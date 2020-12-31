var express = require("express");
const ReservationController = require("../controllers/ReservationController");

var router = express.Router();

router.get("/availability", ReservationController.checkAvailability);
router.post("/book-room", ReservationController.bookRoom);

module.exports = router;