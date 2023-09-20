module.exports = ({res, rows, count = 0}) => {
	const { pagination: { pageSize, pageNumber } } = res;
	return {
		pagination:{
			total: parseInt(count),
			page: parseInt(pageNumber),
			perPage: parseInt(pageSize),
			pages: Math.ceil(count / pageSize)
		},
		results: Array.isArray(rows) ? rows : [],
		isError: false,
	}
}