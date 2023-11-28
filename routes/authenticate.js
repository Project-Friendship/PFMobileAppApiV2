const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const errorView = require("../view/errorView");
const MessageCode = require("../enum/MessageCode");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const Email = require("../model/Email");
const ejs = require("ejs")
const fs = require("fs");

const {
	JWT_SECRET
} = process.env;

router.get("/reset/:email", (req, res, next) => {
	const { params: { email } } = req;
	const { pool } = res;
	const text = `select id, email, fname, lname from pf.users where email = $1`;
	pool.query({ text, values: [email], name: 'reset-password' }, (error, response) => {
		if (response.rows.length === 0) return res.json({ success: true })
		const { rows: [{ id, email, fname, lname } = { id: false }] } = response;
		const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: '24h' })
		const body = ejs.render(fs.readFileSync('view/email/confirmEmailTemplate.ejs', 'utf-8'), { fname, lname, id, token, link: "" })
		return Email({ to: email, subject: "Reset password", body }).then(() => {
			return res.json({ success: true })
		});
	})
})

router.post("/login", (req, res, next) => {
	const { body: { username, password } } = req;
	const { pool } = res;
	const text = `select password from pf.users where email = $1`;
	pool.query({ text, values: [username], name: 'validate-user' }, (error, response) => {
		const { rows: [{ password: passwordHash } = { password: false }] } = response;
		if (error || passwordHash === false) return errorView({ res, error, errorCode: 403, messageCode: MessageCode.USER_UNKNOWN });
		bcrypt.compare(password, passwordHash, function (err, result) {
			if (!result) return errorView({ res, error, errorCode: 403, messageCode: MessageCode.USER_UNKNOWN });
			res.json({ result })
		});
	});
});

module.exports = router;