const Hotel = require("../models/HotelModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
const onlyAdmin = require("../middlewares/onlyAdmin");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Hotel Schema
function HotelData(data) {
	this.id = data._id;
	this.name= data.name;
	this.description = data.description;
}

/**
 * Hotel List.
 * 
 * @returns {Object}
 */
exports.hotelList = [
	auth,
	onlyAdmin,
	function (req, res) {
		try {
			Hotel.find({},"_id title description isbn createdAt").then((hotels)=>{
				if(hotels.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", hotels);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", []);
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Hotel Detail.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.hotelDetail = [
	auth,
	onlyAdmin,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Hotel.findOne({_id: req.params.id,user: req.user._id},"_id title description isbn createdAt").then((hotel)=>{                
				if(hotel !== null){
					let hotelData = new HotelData(hotel);
					return apiResponse.successResponseWithData(res, "Operation success", hotelData);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", {});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Hotel store.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.hotelStore = [
	auth,
	onlyAdmin,
	body("name", "Name must not be empty.").isLength({ min: 1 }).trim().custom((value) => {
		return Hotel.findOne({name : value}).then(hotel => {
			if (hotel) {
				return Promise.reject("Hotel already exist with this name");
			}
		});
	}),
	body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var hotel = new Hotel(
				{ name: req.body.name,
					description: req.body.description,
				});
	
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save hotel.
				hotel.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let hotelData = new HotelData(hotel);
					return apiResponse.successResponseWithData(res,"Hotel add Success.", hotelData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];
