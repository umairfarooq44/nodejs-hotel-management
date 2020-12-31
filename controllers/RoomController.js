const Room = require("../models/RoomModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
const onlyAdmin = require("../middlewares/onlyAdmin");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Room Schema
function RoomData(data) {
	this.id = data._id;
	this.name = data.name;
	this.type = data.type;
	this.price = data.price;
}

/**
 * Room List.
 * 
 * @returns {Object}
 */
exports.roomList = [
	auth,
	onlyAdmin,
	function (req, res) {
		try {
			Room.find({},"_id title description isbn createdAt").then((rooms)=>{
				if(rooms.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", rooms);
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
 * Room Detail.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.roomDetail = [
	auth,
	onlyAdmin,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Room.findOne({_id: req.params.id,user: req.user._id},"_id title description isbn createdAt").then((room)=>{                
				if(room !== null){
					let roomData = new RoomData(room);
					return apiResponse.successResponseWithData(res, "Operation success", roomData);
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
 * Room store.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.roomStore = [
	auth,
	onlyAdmin,
	body("name", "Name must not be empty.").isLength({ min: 1 }).trim(),
	body("type", "Type must not be empty.").isLength({ min: 1 }).trim(),
	body("price", "price must not be empty.").notEmpty().isNumeric(),
	body("hotelId", "price must not be empty.").isLength({ min: 1 }),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var room = new Room(
				{ name: req.body.name,
					type: req.body.type,
					price: req.body.price,
					hotelId: req.body.hotelId,
				});
	
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save room.
				room.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let roomData = new RoomData(room);
					return apiResponse.successResponseWithData(res,"Room add Success.", roomData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];
