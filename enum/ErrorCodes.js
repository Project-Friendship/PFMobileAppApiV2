const MessageCode = require("./MessageCode");

module.exports = {
	400: { message: 'Bad Request', messageCode: MessageCode.BAD_REQUEST },
	401: { message: 'Unauthorized', messageCode: MessageCode.CONFLICT },
	402: { message: 'Payment Required', messageCode: MessageCode.PAYMENT_REQUIRED },
	403: { message: 'Forbidden', messageCode: MessageCode.FORBIDDEN },
	404: { message: 'Not Found', messageCode: MessageCode.NOT_FOUND },
	405: { message: 'Method Not Allowed', messageCode: MessageCode.METH },
	406: { message: 'Not Acceptable', messageCode: MessageCode.NOT_ACCEPTABLE },
	407: { message: 'Proxy Authentication Required', messageCode: MessageCode.PROXY_AUTHENTICATION_REQUIRED },
	408: { message: 'Request Timeout', messageCode: MessageCode.REQUEST_TIMEOUT },
	409: { message: 'Conflict', messageCode: MessageCode.CONFLICT },
	410: { message: 'Gone', messageCode: MessageCode.GONE },
	411: { message: 'Length Required', messageCode: MessageCode.LENGTH_REQUIRED },
	412: { message: 'Precondition Failed', messageCode: MessageCode.PRECONDITION_FAILED },
	413: { message: 'Request Too Large', messageCode: MessageCode.REQUEST_TOO_LARGE },
	414: { message: 'Request-URI Too Long', messageCode: MessageCode.REQUEST_URI_TOO_LONG },
	415: { message: 'Unsupported Media Type', messageCode: MessageCode.UNSUPPORTED_MEDIA_TYPE },
	416: { message: 'Range Not Satisfiable', messageCode: MessageCode.RANGE_NOT_SATISFIABLE },
	417: { message: 'Expectation Failed', messageCode: MessageCode.EXPECTATION_FAILED },
}