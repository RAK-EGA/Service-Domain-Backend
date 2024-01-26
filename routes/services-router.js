const express = require("express");
const servicerouter = express.Router();
const {oneTimeJob} = require("../controllers/service-controller");
const {getServiceByName} = require("../controllers/service-controller");
const {getRequestsNames} = require("../controllers/service-controller");
const {getComplainsNames} = require("../controllers/service-controller");
const {getCategories} = require("../controllers/service-controller");
const {getSubCategories} = require("../controllers/service-controller");
const {getAllCacheKeys} = require("../controllers/service-controller");


servicerouter.post("/onetime", oneTimeJob);
servicerouter.get("/servicedetails/:service_name", getServiceByName);
servicerouter.get("/requestsnames", getRequestsNames);
servicerouter.get("/complainsnames", getComplainsNames);
servicerouter.get("/getcategories", getCategories);
servicerouter.get("/getsubcategories/:department", getSubCategories);
servicerouter.get("/getAllCacheKeys", getAllCacheKeys);

module.exports = servicerouter;
