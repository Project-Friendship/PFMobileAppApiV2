require("dotenv").config()
const nodemailer = require('nodemailer');

module.exports = (params) => {
	params = { to: "", subject: "", body: "", ...params }
	return new Promise((resolve, reject) => {
		const { to, subject, body: html } = params;
		const {
			EMAIL_SERIVCE: service,
			EMAIL_USER: user,
			EMAIL_PASSWORD: pass
		} = process.env

		const transporter = nodemailer.createTransport({
			service,
			auth: { user, pass },
			secure: false,
			tls: {
				rejectUnauthorized: false
			}
		});

		const mailOptions = { from: user, to, subject, html };

		transporter.sendMail(mailOptions, function (error, info) {
			if (error) return reject(error);
			return resolve(info)
		});
	})

}