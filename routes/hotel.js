var express = require("express");
const HotelController = require("../controllers/HotelController");

var router = express.Router();

router.get("/", HotelController.hotelList);
router.get("/:id", HotelController.hotelDetail);
router.post("/", HotelController.hotelStore);

module.exports = router;