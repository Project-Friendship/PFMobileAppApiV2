const MessageCode = require("../enum/MessageCode");
const collection = require("../view/collection");
const errorView = require("../view/errorView");

module.exports = (params) => {

	params = {
		table: "tableOfSomething",
		entityName: "something",
		collectionName: "somethings",
		idField: "id",
		validFields: [],
		retrieveDefaultData: () => Promise.resolve({}),
		onCreate: (data, res) => Promise.resolve(data),
		onCreateGet: (data, res) => Promise.resolve(data),
		onGet: (data, res) => Promise.resolve(data),
		onGetAll: (data, res) => Promise.resolve(data),
		onDelete: (data, res) => Promise.resolve(data),
		onUpdate: (data, res) => Promise.resolve(data),
		...params
	}

	const {
		validFields, table, idField, entityName, collectionName, retrieveDefaultData,
		onCreate, onGet, onCreateGet, onGetAll, onDelete, onUpdate
	} = params;

	const listOfFields = validFields.filter(({ isHidden }) => !isHidden).map(({ field }) => field).join(", ");
	const hasRequired = (body) => validFields.filter(({ isRequired }) => isRequired).map(({ field }) => field).every(field => body.hasOwnProperty(field) && (body[field] !== "" || body[field] !== null));
	const parseValue = value => value === "" ? null : value;
	return {
		getEntities: (req, res, next) => {
			const { pool, pagination: { offset, limit } } = res;
			const query = {
				name: `fetch-${collectionName}`,
				text: `SELECT
						(SELECT COUNT(*) FROM ${table}) as count, (SELECT json_agg(t.*) FROM 
						(select ${listOfFields} from ${table} offset $1 limit $2) as t) as rows`,
				values: [offset, limit]
			}
			return pool.query(query, (error, response) => {
				if (error) return errorView({ res })
				onGetAll(response, res).then(data => {
					const { rows: [{ rows, count }] } = data;
					res.json(collection({ rows, res, count }));
				})
			})
		},

		getEntity: (req, res, next) => {
			let { params: { id } } = req;
			id = id ?? res.locals.id;
			const query = {
				name: `fetch-${entityName}`,
				text: `select ${listOfFields} from ${table} where ${idField} = $1`,
				values: [id]
			};
			return res.pool.query(query, (error, response) => {
				if (error) errorView({ res, errorCode: 400, })
				const { createGet = false } = res.locals;
				(createGet ? onCreateGet : onGet)(response, res).then(data => {
					const { rowCount, rows: [record] } = data;
					if (rowCount === 0) errorView({ res, errorCode: 404 })
					res.json(record)
				})
			})
		},

		createEntity: (req, res, next) => {
			let { body } = req;
			retrieveDefaultData(res).then(data => {
				body = { ...data, ...body }
				if (!hasRequired(body)) return errorView({ res });
				const fields = validFields.filter(({ isReadOnly }) => !isReadOnly)
					.filter(({ field }) => body.hasOwnProperty(field))
					.map(({ field }) => ({ field, value: parseValue(body[field]) }))

				const text = `insert into ${table}(${fields.map(({ field }) => field).join(",")}) 
							values (${fields.map((x, i) => `$${i + 1}`).join(", ")}) 
							RETURNING ${idField}`
				const values = fields.map(({ value }) => value);

				return res.pool.query({ text, values, name: `create-${entityName}` }, (error, response) => {
					if (error) return errorView({
						res, errorCode: 400, error, tests: [
							{ test: ({ detail }) => /already exists/.test(detail), errorCode: 409, message: `${entityName} already exists`, messageCode: MessageCode.USER_ALREADY_EXISTS },
							{ test: ({ code }) => code === '23502', errorCode: 409, message: "Missing required fields" }
						]
					});

					onCreate(response, res).then(data => {
						const { rowCount, rows: [{ [idField]: id }] } = data;
						if (rowCount === 0) return errorView({ res, errorCode: 404 })
						res.locals = { ...res.locals, id, createGet: true };
						next()
					})
				})
			})
		},

		updateEntity: (req, res, next) => {
			let i = 1;
			const { body, params: { id } } = req;

			const fields = validFields
				.filter(({ isReadOnly }) => !isReadOnly)
				.filter(({ field }) => body.hasOwnProperty(field))
				.map(({ field }) => ({ field: `${field} = $${i++}`, value: parseValue(body[field]) }))
			if (fields.length === 0) return errorView({ res, statusCode: 400 });
			const text = `Update ${table} set ${fields.map(({ field }) => field).join(", ")} where ${idField} = $${i}`
			const values = [...fields.map(({ value }) => value), id];
			return res.pool.query({ text, values, name: `update-${entityName}` }, (error, response) => {
				if (error) return errorView({
					res, errorCode: 400, error, tests: [
						{ test: ({ detail }) => /already exists/.test(detail), errorCode: 409, message: `${entityName} already exists`, messageCode: MessageCode.USER_ALREADY_EXISTS },
						{ test: ({ code }) => code === '23502', errorCode: 409, message: "Missing required fields" }
					]
				})
				onUpdate(response, res).then(data => {
					next()
				})
			})
		},

		deleteEntity: (req, res, next) => {
			const { params: { id } } = req
			const text = `delete from ${table} where ${idField} = $1`
			const values = [id];
			return res.pool.query({ text, values, name: `remove-${entityName}` }, (error, response) => {
				if (error) return errorView({ res, errorCode: 400, error });
				onDelete(response, res).then(data => {
					return res.status(204).json({});
				})
			})
		}
	}
}