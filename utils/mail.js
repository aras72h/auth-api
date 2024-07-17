// utils/mail.js
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables from .env file

const isProduction = process.env.NODE_ENV === 'production';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // 'smtp.gmail.com'
    port: process.env.SMTP_PORT, // 465
    secure: process.env.SMTP_SECURE === 'true', // true
    auth: {
        user: process.env.SMTP_USER, // 'aras72h@gmail.com'
        pass: process.env.SMTP_PASS, // Your app-specific password
    },
});

const sendEmail = (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
};

module.exports = sendEmail;
