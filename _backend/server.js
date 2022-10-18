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
app.use(cors());
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

app.get('/', (req, res) => {

        console.log('...')
        res.send('...');
});

app.get('/api/default', (req, res) => {

        console.log('Hello world...')
        res.send('Hello World!');
});