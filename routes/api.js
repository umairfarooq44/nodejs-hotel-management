var express = require("express");
var authRouter = require("./auth");
var bookRouter = require("./book");
var hotelRouter = require("./hotel");
var roomRouter = require("./room");

var app = express();

app.use("/auth/", authRouter);
app.use("/book/", bookRouter);
app.use("/hotel/", hotelRouter);
app.use("/room/", roomRouter);

module.exports = app;