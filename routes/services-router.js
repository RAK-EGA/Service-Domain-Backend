const express = require("express");
const servicerouter = express.Router();
const {oneTimeJob} = require("../controllers/service-controller");
const {getServiceByName} = require("../controllers/service-controller");
const {getServicesNames} = require("../controllers/service-controller");

servicerouter.post("/onetime", oneTimeJob);
servicerouter.get("/servicedetails", getServiceByName);
servicerouter.get("/servicesnames", getServicesNames);

module.exports = servicerouter;
