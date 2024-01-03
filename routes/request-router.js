const express = require("express");
const requestrouter = express.Router();
const {submitRequest} = require("../controllers/request-controller");


requestrouter.post("/submitRequest", submitRequest);



module.exports = requestrouter;
