import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql';

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
//read .env file
dotenv.config();

// disable TLS for testing mail SMTP
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
//set time zone
process.env.TZ = 'America/Toronto';

let AWS_SNS_ACCESS_KEY_ID = process.env.AWS_SNS_ACCESS_KEY_ID; 
let AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION='ca-central-1';


// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 25,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // generated ethereal user
      pass: process.env.SMTP_PASSWORD, // generated ethereal password
    },
});

// async..await is not allowed in global scope, must use a wrapper
async function sendOtpMail(otp, user) {

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Restaurant 2K Fusion" <noreply@2kfusion.com>', // sender address
    to: user, // list of receivers
    subject: "Votre code de vérification", // Subject line
    text: "Votre code de vérification est: "+otp, // plain text body
    html: "Votre code de vérification est: <b>"+otp+"</b><br /><br />", // html body
  });

  console.log("sending otp mail... %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

}



// set website address
const SITE = 'https://staging.2kfusion.com';
// set port, listen for requests
const PORT = process.env.PORT || 3500;

//express json cors setup
let app = express();
app.use(cors({
	origin: '*',
	methods: ['GET', 'POST'],
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({extended: true}));

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}.`)
});


//database connection info
var connection;
const connectionInfo = {
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

//auto connect and reconnect to database function
function connectToDb(callback) {
  const attemptConnection = () => {
    console.log('connecting to database...')
    connectionInfo.connectTimeout = 2000 // same as setTimeout to avoid server overload 
    connection = mysql.createConnection(connectionInfo)
    connection.connect(function (err) {
      if (err) {
        console.log('error connecting to database, trying again in 2 secs...')
        connection.destroy() // end immediately failed connection before creating new one
        setTimeout(attemptConnection, 2000)
      } else {
        callback()
      }
    })
    connection.on('error', function(err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('renewing database connection...');
        } else {
            console.log('database error...', err);
        }
        attemptConnection();
    });

  }
  attemptConnection()
}
// now you simply call it with normal callback
connectToDb( () => {
    console.log("Connected to database!");
})


app.get('/api/list/categories', (req, res) => {

	console.log('fetching all categories...')

	// fetch categories
	const fetchCategoryRequest = "SELECT * FROM res_categories WHERE deleted=0"
	connection.query(fetchCategoryRequest, (err, result) => {
		if(err) {
			console.log('error...', err);
			res.status(500).send(err);
			return false;
		}
		res.send(result)
	});

});

app.get('/api/list/services', (req, res) => {

	console.log('fetching all services...')

	// fetch categories
	const fetchServiceRequest = "SELECT * FROM res_services WHERE deleted=0"
	connection.query(fetchServiceRequest, (err, result) => {
		if(err) {
			console.log('error...', err);
			res.status(500).send(err);
			return false;
		}

		let serviceList = result

		const fetchVariantRequest = "SELECT * FROM res_services_variants WHERE deleted=0"
		connection.query(fetchVariantRequest, (err, result) => {
			if(err) {
				console.log('error', err);
				res.status(500).send(err);
				return false;
			}
			for(let serviceRow of serviceList) {
				let variants = []
				for(let variantRow of result) {
					if(variantRow.service_id === serviceRow.service_id) {
						variants.push(variantRow)
					}
				}
				serviceRow.variants = variants
			}
			res.send(serviceList)
		})
	});

});

app.post('/api/list/timegroups', (req, res) => {

	console.log('fetching all timegroups...')

	// fetch categories
	const fetchTimegroupRequest = "SELECT * FROM res_timegroups"
	connection.query(fetchTimegroupRequest, (err, result) => {
		if(err) {
			console.log('error...', err);
			res.status(500).send(err);
			return false;
		}
		res.send(result)
	});

});

app.post('/api/list/limit/date/bookings', (req, res) => {

	const limitDate = req.body.limitDate;

	console.log('fetching all bookings by date...', limitDate)
	// fetch categories
	const fetchServiceRequest = "SELECT * FROM res_bookings WHERE deleted=0 AND reserved_date=?"
	connection.query(fetchServiceRequest, [limitDate], (err, result) => {
		if(err) {
			console.log('error...', err);
			res.status(500).send(err);
			return false;
		}
		res.send(result)
	});

});

app.post('/api/create/booking', (req, res) => {

	let variantId = 0

	if(req.body.variantId) {
		variantId = req.body.variantId
	}

	const serviceId = req.body.serviceId;
	const bookingDate = req.body.bookingDate;
	const bookingTime = req.body.bookingTime;
	const customerFirstName = req.body.customerFirstName;
	const customerLastName = req.body.customerLastName;
	const customerEmail = req.body.customerEmail;
	const customerPhone = req.body.customerPhone;

	console.log('new booking request...')


	// insert customer info into database
	const insertCustomerRequest = "INSERT INTO res_customers (first_name, last_name, phone, email) VALUES (?,?,?,?);"
	connection.query(insertCustomerRequest, [customerFirstName, customerLastName, customerEmail, customerPhone], (err, result) => {
		console.log('insert new customer...', customerEmail)
		if(err) {
			console.log('error...', err);
			res.status(500).send(err);
			return false;
		}

		// get the new customer id
		let customerId = result.insertId;

		// insert new booking
		const insertBookingRequest = "INSERT INTO res_bookings (reserved_date, reserved_time, customer_id, service_id, variant_id) VALUES (?,?,?,?,?);"
		connection.query(insertBookingRequest, [bookingDate, bookingTime, customerId, serviceId, variantId], (err, result) => {
			console.log('insert new booking...', bookingDate, bookingTime)
			if(err) {
				console.log('error...', err);
				res.status(500).send(err);
				return false;
			}

			res.send('ok');

		});
	});
});