var mongoose = require("mongoose");

var RoomSchema = new mongoose.Schema({
	name: {type: String, required: true},
	type: {type: String, required: true},
	price: { type: Number, required: true},
	hotelId: {type: String, required: true},
}, {timestamps: true});


module.exports = mongoose.model("Rool", RoomSchema);