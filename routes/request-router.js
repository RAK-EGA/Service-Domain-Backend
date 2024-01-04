const express = require("express");
const requestrouter = express.Router();
const {submitRequest} = require("../controllers/request-controller");
const {checkSla} = require("../controllers/request-controller");

requestrouter.post("/submitRequest", submitRequest);
requestrouter.post("/checkSla", checkSla);




module.exports = requestrouter;
