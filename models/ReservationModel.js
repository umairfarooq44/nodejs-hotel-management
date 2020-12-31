var mongoose = require("mongoose");

var ReservationSchema = new mongoose.Schema({
	dateIn: {type: Date, required: true},
	dateOut: {type: Date, required: true},
	roomId: {type: String, required: true},
}, {timestamps: true});


module.exports = mongoose.model("Reservation", ReservationSchema);