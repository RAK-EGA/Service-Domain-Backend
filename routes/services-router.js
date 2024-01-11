const express = require("express");
const servicerouter = express.Router();
const {oneTimeJob} = require("../controllers/service-controller");
const {getServiceByName} = require("../controllers/service-controller");
const {getRequestsNames} = require("../controllers/service-controller");
const {getComplainsNames} = require("../controllers/service-controller");

servicerouter.post("/onetime", oneTimeJob);
servicerouter.get("/servicedetails/:service_name", getServiceByName);
servicerouter.get("/requestsnames", getRequestsNames);
servicerouter.get("/complainsnames", getComplainsNames);

module.exports = servicerouter;
