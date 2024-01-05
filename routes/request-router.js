const express = require("express");
const requestrouter = express.Router();
const {submitRequest} = require("../controllers/request-controller");
const {getAllRequests} = require("../controllers/request-controller");

requestrouter.post("/submitRequest", submitRequest);
requestrouter.post("/getAllRequests", getAllRequests);




module.exports = requestrouter;
