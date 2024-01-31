const express = require("express");
const requestrouter = express.Router();
const {submitRequest} = require("../controllers/request-controller");
const {getAllRequests} = require("../controllers/request-controller");
const {filterAndSortRequests} = require("../controllers/request-controller");
const {getRequest} = require("../controllers/request-controller");
const {getInProgressRequests} = require("../controllers/request-controller");
const {updateRequestStatus} = require("../controllers/request-controller");
const authenticateUser = require('../middlewares/UserAuthentication');
const {getOpenedRequestsWithServiceName} = require("../controllers/request-controller")
const {assignRequestToStaff} = require("../controllers/request-controller")
const {getRequestsWithIdandViewedByStaff} = require("../controllers/request-controller")
const {getTicketWithStaffID} = require("../controllers/request-controller")
const {getRequestsWithIdandOpen}=require("../controllers/request-controller")


requestrouter.post("/submitRequest", authenticateUser, submitRequest);
requestrouter.get("/getAllRequests", getAllRequests);
requestrouter.get("/filter/:searchString", filterAndSortRequests);
requestrouter.get("/getRequest/:id" , getRequest);
requestrouter.get("/getInProgressRequests", getInProgressRequests);
requestrouter.put("/updateRequest/:id",updateRequestStatus );
requestrouter.get('/openedRequestsWithCategory', getOpenedRequestsWithServiceName);
requestrouter.put('/assignRequestToStaff', assignRequestToStaff);
requestrouter.get('/viewRequestsWithIdandViewedByStaff', getRequestsWithIdandViewedByStaff);
requestrouter.get('/getTicketWithStaffID', getTicketWithStaffID);
requestrouter.get('/viewRequestsWithIdandOpen', getRequestsWithIdandOpen);






module.exports = requestrouter;
