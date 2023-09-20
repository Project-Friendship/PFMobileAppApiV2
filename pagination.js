const pagination = (req, res, next) => {
	const validate = (value, defaultNumber, max = 500) => {
		value = parseInt(value);
		if(isNaN(value)) return defaultNumber;
		if(value < 0) return defaultNumber;
		if(value > max) return max;
		return value;
	};
	const { page = 1, size = 25 } = req.query;
	const pageNumber = validate(page, 1);
	const pageSize = validate(size, 25);
	const limit = pageSize;
	const offset = (page - 1) * pageSize;
	res.pagination = {...res.pagination ?? {}, pageSize, pageNumber, limit, offset};
	next()
};
module.exports = pagination