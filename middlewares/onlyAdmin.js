
const apiResponse = require("../helpers/apiResponse");

const onlyAdmin = (req, res, next) => {
	if (req.user.isAdmin) {
		next();
	} else{
		return apiResponse.ErrorResponse(res, "YOu are not allowed to access this feature");
	}
};

module.exports = onlyAdmin;