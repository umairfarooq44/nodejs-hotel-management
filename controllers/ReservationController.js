const Reservation = require("../models/ReservationModel");
const Room = require("../models/RoomModel");
const { body,validationResult, query } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Reservation Schema 
function ReservationData(data) {
	this.id = data._id;
	this.dateIn = data.dateIn;
	this.dateOut = data.dateOut;
	this.roomId = data.roomId;
}



/**
 * Book room API.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.bookRoom = [
	auth,
	body("dateIn", "In date must not be empty.").notEmpty().isDate(),
	body("dateOut", "Out date must not be empty.").notEmpty().isDate(),
	body("roomId", "Room id must not be empty.").notEmpty().isLength({ min: 1 }).custom((value) => {
		return Room.findOne({_id : value}).then(room => {
			if (room) {
				return Promise.reject("Hotel doesn't exists with this id");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var reservation = new Reservation(
				{ dateIn: req.body.dateIn,
					dateOut: req.body.dateOut,
					roomId: req.body.roomId,
				});
	
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save reservation.
				reservation.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let reservationData = new ReservationData(reservation);
					return apiResponse.successResponseWithData(res,"Reservation add Success.", reservationData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Book room API.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.checkAvailability = [
	auth,
	query("numOfDays", "Number of days should be valid number.").notEmpty().isNumeric(),
	query("roomId", "Room id should be valid.").isLength({ min: 1 }),
	// sanitizeBody("*").escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				const dates = [];
				const { numOfDays, roomId } = req.query;
				const currentDate = new Date().setUTCHours(0,0,0,0);
				for ( let i = 1; i <= numOfDays; i ++ ) {
					dates.push(new Date( currentDate + i * 24 * 60 * 60 * 1000));
				}
				
				const firstDate = dates[0];
				const lastDate = dates[numOfDays - 1];
				const reservations = await Reservation.find({
					roomId,
					$or : [{ dateIn: {$gte: firstDate, $lte: lastDate}}, { dateOut: {$gte: firstDate, $lte: lastDate }} ],
				});
				const freeSlots = [];
				dates.forEach(date => {
					const cD = date.getTime();
					const found = reservations.some(reservation => {
						const inD = new Date(reservation.dateIn).getTime();
						const outD = new Date(reservation.dateOut).getTime();
						console.log(date, cD, inD, outD, !(cD >= inD && cD <= outD));
						return cD >= inD && cD <= outD;
					});
					console.log(found);
					if (!found) {
						freeSlots.push(date);
					}
				});
				return apiResponse.successResponseWithData(res, "Operation success", freeSlots);
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];
