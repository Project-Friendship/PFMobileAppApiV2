const dotenv = require("dotenv").config();
const { Pool } = require('pg');

const adapter = (req, res, next) => {

	// database connection parameters
	const {
		POSTGRES_HOST: host,
		POSTGRES_USER: user,
		POSTGRES_PASSWORD: password,
		POSTGRES_DBNAME: database,
		POSTGRES_SCHEMA: schema = "pf",
		POSTGRES_PORT: port = 5432
	} = process.env;

	const pool = new Pool({ user, password, host, database, port, });

	pool.on('connect', client => {
		console.log("on-connect fired")
		//client.query(`SET search_path = ${schema}, public;`) - Adds 100ms per call
	});

	pool.on('error', (err, client) => {
		console.error('Unexpected error on idle client', err)
		process.exit(-1)
	})

	res.pool = pool;
	next();
}
module.exports = adapter;