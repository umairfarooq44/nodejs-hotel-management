var mongoose = require("mongoose");

var HotelSchema = new mongoose.Schema({
	name: {type: String, required: true},
	description: {type: String, required: true},
}, {timestamps: true});


module.exports = mongoose.model("Hotel", HotelSchema);