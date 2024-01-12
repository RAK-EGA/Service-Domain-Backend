const express = require("express");
const requestrouter = express.Router();
const {submitRequest} = require("../controllers/request-controller");
const {getAllRequests} = require("../controllers/request-controller");
const {filterAndSortRequests} = require("../controllers/request-controller");
const {getRequest} = require("../controllers/request-controller");
const {getInProgressRequests} = require("../controllers/request-controller");
const {updateRequestStatus} = require("../controllers/request-controller");
const authenticateUser = require('../middlewares/UserAuthentication');

requestrouter.post("/submitRequest", submitRequest);
requestrouter.get("/getAllRequests", getAllRequests);
requestrouter.get("/filter/:searchString", filterAndSortRequests);
requestrouter.get("/getRequest/:id", authenticateUser , getRequest);
requestrouter.get("/getInProgressRequests", getInProgressRequests);
requestrouter.put("/updateRequest/:id", updateRequestStatus);





module.exports = requestrouter;
