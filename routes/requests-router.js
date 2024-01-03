const express = require("express");
const requestrouter = express.Router();
const {oneTimeJob} = require("../controllers/request-controller");

requestrouter.post("/onetime", oneTimeJob);

module.exports = requestrouter;
