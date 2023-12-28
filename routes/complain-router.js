const express = require("express");
const {
  submitComplain,
  updateComplainStatus,
  getComplain,
  getAllComplain,
  filterAndSortTickets,
  getInProgressComplains
} = require("../controllers/complain-controller.js");

const complainrouter = express.Router();

// Define routes
complainrouter.post("/submit", submitComplain);
complainrouter.put("/update/:id", updateComplainStatus);
complainrouter.get("/view", getAllComplain);
complainrouter.get("/view/:id", getComplain);
complainrouter.get('/filter/:searchString',filterAndSortTickets);
complainrouter.get('/viewInProgress',getInProgressComplains);

module.exports = complainrouter;
