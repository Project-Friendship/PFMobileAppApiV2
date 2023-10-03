require("dotenv").config();
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const BasicCrud = require("../model/BasicCrud");
const UserStatus = require("../enum/UserStatus");
const Email = require("../model/Email");
const ejs = require("ejs")
const fs = require("fs");
const errorView = require("../view/errorView");
const MessageCode = require("../enum/MessageCode");

const model = BasicCrud({
	entityName: 'user',
	collectionName: 'users',
	table: "pf.users",
	idField: "id",
	validFields: [
		{ field: 'id', isReadOnly: true },
		{ field: 'email', isRequired: true },
		{ field: 'fname', isRequired: true },
		{ field: 'lname', isRequired: true },
		{ field: 'pronouns' },
		{ field: 'phone' },
		{ field: 'status_id' },
		{ field: 'password', isRequired: true, isHidden: true, mutator: value => bcrypt.hashSync(value, parseInt(process.env.SALT_ROUNDS)) }
	],
	retrieveDefaultData: () => Promise.resolve({ status_id: UserStatus.PENDING_CONFIRMAION }),
	onCreateGet: response => {
		const { rows: [{ fname, lname, id, email }] } = response;
		const body = ejs.render(fs.readFileSync('view/email/validateEmailTemplate.ejs', 'utf-8'), { fname, lname, id, link: `http://localhost:3000/users/${id}/validate` })
		return Email({ to: email, subject: "Verify your email address", body }).then(() => response);
	}
})


router.post("/", model.createEntity);
router.post("/", model.getEntity);

router.get("/", model.getEntities)

router.route("/:id")
	.get(model.getEntity)
	.put(model.updateEntity)
	.put(model.getEntity)
	.patch(model.updateEntity)
	.patch(model.getEntity)
	.delete(model.deleteEntity)

router.get("/:id/validate", (req, res, next) => {
	const { pool } = res;
	const { params: { id } } = req;
	const text = `update pf.users set status_id = $1 where id = $2`;
	return pool.query({ text, values: [UserStatus.ACTIVE, id], name: `validate-user` }, (error, response) => {
		if (error) return errorView({ res, error });
		res.json({ isError: false, success: true, messageCode: MessageCode.USER_VERIFIED, messaage: "User verified" });
	})
})
module.exports = router;