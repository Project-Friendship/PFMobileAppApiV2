const { param } = require("express/lib/request");
const MessageCode = require("../enum/MessageCode");
const ErrorCodes = require("../enum/ErrorCodes");
module.exports = (params) => {
	params = {
		res: {},
		errorCode: 400,
		message: null,
		error: false,
		isError: true,
		tests: [],
		messageCode: MessageCode.IN_ERROR,
		...params
	}
	let { res, error, tests } = params;
	const errors = ErrorCodes;

	if (error) {
		console.log(error);
		tests.forEach((errorTest) => {
			const defaultMessages = errors.hasOwnProperty(errorTest.errorCode) ? errors[errorTest.errorCode] : {};
			const { test, errorCode, message, messageCode } = {
				test: () => false,
				errorCode: 400,
				messageCode: MessageCode.IN_ERROR,
				message: "",
				...defaultMessages,
				...errorTest
			};
			if (test(error)) params = { ...params, errorCode, message, messageCode }
		});
	}

	if (!params.messageCode && errors.hasOwnProperty(params.errorCode)) params = { ...params, ...errors[params.errorCode] };

	res.status(params.errorCode).json({
		errorCode: params.errorCode,
		isError: params.isError,
		message: params.message,
		messageCode: params.messageCode
	});
}