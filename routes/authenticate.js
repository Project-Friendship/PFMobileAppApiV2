const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const errorView = require("../view/errorView");
const MessageCode = require("../enum/MessageCode");

router.post("/login", (req, res, next) => {
	const { body: { username, password } } = req;
	const { pool } = res;
	const text = `select password from pf.users where email = $1`;
	pool.query({ text, values: [username], name: 'validate-user' }, (error, response) => {
		const { rows: [{ password: passwordHash } = { password: false }] } = response;
		if (error || passwordHash === false) return errorView({ res, error, errorCode: 403, messageCode: MessageCode.USER_UNKNOWN });
		bcrypt.compare(password, passwordHash, function (err, result) {
			if(!result)  return errorView({ res, error, errorCode: 403, messageCode: MessageCode.USER_UNKNOWN });
			res.json({ result })
		});
	});
});

module.exports = router;