import dotenv from 'dotenv';
//read .env file
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql';
import dayjs from 'dayjs';
import AWS from 'aws-sdk';
import * as cron from 'node-cron';

import nodemailer from 'nodemailer';

dotenv.config();
// disable TLS for testing mail SMTP
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
//set time zone
process.env.TZ = 'America/Toronto';

let AWS_SNS_ACCESS_KEY_ID = process.env.AWS_SNS_ACCESS_KEY_ID;
let AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = 'ca-central-1';

AWS.config.update({
	region: AWS_REGION,
	accessKeyId: AWS_SNS_ACCESS_KEY_ID,
	secretAccessKey: AWS_SECRET_ACCESS_KEY,
});

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: parseInt(process.env.SMTP_PORT || `465`, 10),
	secure: true,
	auth: {
		user: process.env.SMTP_USERNAME,
		pass: process.env.SMTP_PASSWORD
	}
});

// async..await is not allowed in global scope, must use a wrapper
async function sendOtpMail(otp, user) {

	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: '"Sender" <noreply@example.com>', // sender address
		to: user, // list of receivers
		subject: "Votre code de vérification", // Subject line
		text: "Votre code de vérification est: " + otp, // plain text body
		html: "Votre code de vérification est: <b>" + otp + "</b><br /><br />", // html body
	});

	console.log("sending otp mail... %s", info.messageId);
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

}

// set port, listen for requests
const PORT = process.env.PORT || 3500;

//express json cors setup
let app = express();
app.use(cors({
	origin: '*',
	methods: ['GET', 'POST'],
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));

app.listen(PORT, () => {
	console.log(`server is running on port ${PORT}.`);
});


//database connection info
var connection;
const connectionInfo = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	dateStrings: true
};

// this contains all the business configuration and settings
let businessConfig;

//auto connect and reconnect to database function
function connectToDb(callback) {
	const attemptConnection = () => {
		console.log('connecting to database...');
		connectionInfo.connectTimeout = 2000; // same as setTimeout to avoid server overload 
		connection = mysql.createConnection(connectionInfo);
		connection.connect(function (err) {
			if (err) {
				console.log('error connecting to database, trying again in 2 secs...');
				connection.destroy(); // end immediately failed connection before creating new one
				setTimeout(attemptConnection, 2000);
			} else {
				callback();
			}
		});
		connection.on('error', function (err) {
			if (err.code === 'PROTOCOL_CONNECTION_LOST') {
				console.log('renewing database connection...');
			} else {
				console.log('database error...', err);
			}
			attemptConnection();
		});

	};
	attemptConnection();
}
console.log(`process.env.NODE_ENV`, process.env.NODE_ENV)
if (process.env.NODE_ENV === 'production') {
	// now you simply call it with normal callback
	connectToDb(() => {
		console.log("Connected to database!");
	
		console.log("Fetching settings from database...");
		const fetchSettingsRequest = "SELECT * FROM res_settings";
		connection.query(fetchSettingsRequest, (err, result) => {
			if (err) {
				console.log('error...', err);
				return false;
			}
	
			businessConfig = result[0];
	
		});
	});
}

function sendSms(message) {

	console.log('sending SMS via AWS SNS...');

	// Create publish parameters
	var awsParams = {
		Message: message, /* required */
		PhoneNumber: businessConfig.business_phone || ``,
	};

	// Create promise and SNS service object
	var publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(awsParams).promise();

	// Handle promise's fulfilled/rejected states
	publishTextPromise.then(function (data) {
		console.log("MessageID is " + data.MessageId);
	}).catch(function (err) {
		console.error(err, err.stack);
	});

}

app.get('/api/sns', (req, res) => {

	console.log(businessConfig);

	// Create publish parameters
	var awsParams = {
		Message: 'TEXT_MESSAGE', /* required */
		PhoneNumber: businessConfig.business_phone || ``,
	};

	// Create promise and SNS service object
	var publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(awsParams).promise();

	// Handle promise's fulfilled/rejected states
	publishTextPromise.then(function (data) {
		console.log("MessageID is " + data.MessageId);
	}).catch(function (err) {
		console.error(err, err.stack);
	});

});


app.get('/api/list/categories', (req, res) => {

	console.log('fetching all categories...');

	// fetch categories
	const fetchCategoryRequest = "SELECT * FROM res_categories WHERE deleted=0";
	connection.query(fetchCategoryRequest, (err, result) => {
		if (err) {
			console.log('db error...', err);
			res.status(500).send(err);
			return false;
		}
		res.send(result);
	});

});

app.get('/api/list/services', (req, res) => {

	console.log('fetching all services...');

	// fetch categories
	const fetchServiceRequest = "SELECT * FROM res_services WHERE deleted=0";
	connection.query(fetchServiceRequest, (err, result) => {
		if (err) {
			console.log('error...', err);
			res.status(500).send(err);
			return false;
		}

		let serviceList = result;

		const fetchVariantRequest = "SELECT * FROM res_services_variants WHERE deleted=0";
		connection.query(fetchVariantRequest, (err, result) => {
			if (err) {
				console.log('error', err);
				res.status(500).send(err);
				return false;
			}
			for (let serviceRow of serviceList) {
				let variants = [];
				for (let variantRow of result) {
					if (variantRow.service_id === serviceRow.service_id) {
						variants.push(variantRow);
					}
				}
				serviceRow.variants = variants;
			}
			res.send(serviceList);
		});
	});

});

app.post('/api/list/timegroups', (req, res) => {

	console.log('fetching all timegroups...');

	// fetch categories
	const fetchTimegroupRequest = "SELECT * FROM res_timegroups";
	connection.query(fetchTimegroupRequest, (err, result) => {
		if (err) {
			console.log('error...', err);
			res.status(500).send(err);
			return false;
		}
		res.send(result);
	});

});

app.post('/api/list/limit/date/bookings', (req, res) => {

	const limitDate = req.body.limitDate;

	console.log('fetching all bookings by date...', limitDate);
	// fetch categories
	const fetchServiceRequest = "SELECT * FROM res_bookings WHERE deleted=0 AND reserved_date=?";
	connection.query(fetchServiceRequest, [limitDate], (err, result) => {
		if (err) {
			console.log('error...', err);
			res.status(500).send(err);
			return false;
		}

		res.send(result);
	});

});

app.post('/api/create/booking', (req, res) => {

	let variantId = 0;

	if (req.body.variantId) {
		variantId = req.body.variantId;
	}

	const serviceId = req.body.serviceId;
	const bookingDate = req.body.bookingDate;
	const bookingTime = req.body.bookingTime;
	const customerFirstName = req.body.customerFirstName;
	const customerLastName = req.body.customerLastName;
	const customerEmail = req.body.customerEmail;
	const customerPhone = req.body.customerPhone;

	console.log('new booking request...');

	// insert customer info into database
	const insertCustomerRequest = "INSERT INTO res_customers (first_name, last_name, phone, email) VALUES (?,?,?,?);";
	connection.query(insertCustomerRequest, [customerFirstName, customerLastName, customerEmail, customerPhone], (err, result) => {
		console.log('insert new customer...', customerEmail);
		if (err) {
			console.log('error...', err);
			res.status(500).send(err);
			return false;
		}

		// get the new customer id
		let customerId = result.insertId;

		// insert new booking
		const insertBookingRequest = "INSERT INTO res_bookings (reserved_date, reserved_time, customer_id, service_id, variant_id) VALUES (?,?,?,?,?);";
		connection.query(insertBookingRequest, [bookingDate, bookingTime, customerId, serviceId, variantId], (err, result) => {
			console.log('insert new booking...', bookingDate, bookingTime);
			if (err) {
				console.log('error...', err);
				res.status(500).send(err);
				return false;
			}

			console.log('sending SMS confirmation...');

			let bookingMessage = ('New appointment:\n' + customerFirstName + ' ' + customerLastName + ' has booked a new appointment on ' + bookingDate + ' ' + bookingTime);
			sendSms(bookingMessage);

			res.send('ok');


		});
	});
});


app.post('/api/admin/list/today/bookings', (req, res) => {

	const limitDate = req.body.limitDate;

	console.log('fetching all bookings by date...', limitDate);
	// fetch categories
	const fetchServiceRequest = "SELECT * FROM res_bookings WHERE deleted=0 AND reserved_date=?";
	connection.query(fetchServiceRequest, [limitDate], (err, result) => {
		if (err) {
			console.log('error...', err);
			res.status(500).send(err);
			return false;
		}
		res.send(result);
	});

});

/** ------------------------------------------------------------------------------------------------ */

app.post('/api/onsite/email/signup', (req, res) => {
	const name = req.body.name
	const phone = req.body.phone
	const email = req.body.email

	console.log('received email signup...', req.body)

	const fetchSignupRequest = "SELECT * FROM gm_email_signups WHERE email=?;";
	connection.query(fetchSignupRequest, [email], (err, result) => {
		if (result.length) {
			console.log('/api/onsite/email/signup email already exists, do nothing...')
			return res.status(200).send();
		} else {
			const insertSignupRequest = "INSERT INTO gm_email_signups (name, phone, email) VALUES (?,?,?);";
			connection.query(insertSignupRequest, [name, phone, email], (err, result) => {
				console.log('/api/onsite/email/signup insert new signup...', email);
				if (err) {
					console.log('/api/onsite/email/signup error...', err);
					res.status(500).send(err);
					return false;
				}
		
				return res.status(200).send();
			});
		}
	})

})

cron.schedule('0 11 * * *', () => {
	console.log(`checking email signups to send review mail...`)
	const fetchEmailSignupRequest = "SELECT * FROM gm_email_signups WHERE reminded=0;"
	connection.query(fetchEmailSignupRequest, (err, result) => {
		if (err) {
			console.error('fetchEmailSignupRequest error...', err);
			return false;
		}

		if (result.length === 0) {
			console.log(`No users need to be reminded...`)
			return
		}

		console.log(`Found users that need to be reminded...`, result.length)
		let emailQueue = []

		for (let row of result) {
			const subject = `Hello ${row.name}, please take a moment to review us on Google.`
			const textContent = `Hello ${row.name}, \n We hope you enjoyed our service. Please take a moment to review us on Google. \n Leave a Review at https://search.google.com/local/writereview?placeid=ChIJjVNdMKQRyUwR7mgfSaIs4Ts`
			const template = `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Review Reminder</title>
			</head>
			<body style="background-color: #442824; font-family: serif; color: #fff;">
				<table width="100%" border="0" cellspacing="0" cellpadding="0">
					<tr>
						<td align="center">
							<table width="500" border="0" cellspacing="0" cellpadding="0" style="border-radius: 5px; border: 1px dotted #fff; background-color: #f4f1ea; background-image: url('https://ginsengmassage.ca/wp-content/uploads/2022/10/section-bg-2.jpg');">
								<tr>
									<td align="center" style="padding: 20px;">
										<img src="https://ginsengmassage.ca/wp-content/uploads/2022/10/main-logo-lg.png" alt="Ginseng Massage Logo" width="250" style="display: block;">
									</td>
								</tr>
								<tr>
									<td align="center" style="padding: 20px;">
										<h1 style="margin-top: 0px;margin-bottom: 32px;">Hello ${row.name},</h1>
										<p style="margin: 20px 0;">We hope you enjoyed our service. Please take a moment to review us on Google.</p>
										<a href="https://search.google.com/local/writereview?placeid=ChIJjVNdMKQRyUwR7mgfSaIs4Ts" style="margin-top: 32px; display: block; padding: 22px 42px; border: none; border-radius: 4px; background-color: #de8376; color: white; cursor: pointer; text-decoration: none; font-size: 20px;">Leave a Review</a>
									</td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
			</body>
			</html>
			`

			console.log(`pushing new sendReviewEmail to: ${row.email}`)
			emailQueue.push(sendReviewEmail(transporter, row.email, subject, template, textContent).catch(err => console.error(err)))
		}

		console.log(`reached end of results, awaiting email queue to resolve...`)
		Promise.all(emailQueue)
		.then(() => {
			console.log(`all email queue jobs resolved, review email job done...`, new Date.now())
		})
		
		function sendReviewEmail(transporter, to, subject, html, text) {
			return new Promise((resolve, reject) => {

				console.log(`running sendReviewEmail to: ${to}`)

				// send mail with defined transport object
				transporter.sendMail({
					from: '"mailer" <admin@ginsengmassage.ca>', // sender address
					to: to, // list of receivers
					subject: subject, // Subject line
					text: text, // plain text body
					html: html, // html body
				}, function (error, info) {

					if (error) {
						console.error(`could not send review email... to ${to}`, err)
						return
					}
					
					console.log("sendReviewEmail sent review email... %s", info.messageId);
					// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
					const updateQuery = "UPDATE gm_email_signups SET reminded=1 WHERE email=?;"
					connection.query(updateQuery, (err, result) => {
						if (err) {
							console.log('sendReviewEmail updateQuery error...', err);
							return reject();
						}
						console.log(`sendReviewEmail updated reminded to true for ${to}...`);
						return resolve()
					})
				})

			})

		}
	});
})