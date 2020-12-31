var express = require("express");
const RoomController = require("../controllers/RoomController");

var router = express.Router();

router.get("/", RoomController.roomList);
router.get("/:id", RoomController.roomDetail);
router.post("/", RoomController.roomStore);

module.exports = router;