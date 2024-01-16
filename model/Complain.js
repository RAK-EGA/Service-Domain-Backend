const mongoose = require("mongoose");


const statusEnum = ["OPEN", "VIEWED_BY_STAFF", "ASSIGNED_TO_CONCERNED_DEPARTMENT","RESOLVED","CANCELED"];

const complainSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    default: "OTHER",
  },
  citizenID: {
    type: String,
  },
  complainName: {
    type: String,
  },
  subcategory: {
    type: String,
    required: true,
    default: "OTHER",
  },
  status: {
    type: String,
    enum: statusEnum,
    default: "OPEN",
  },
  Rate: {
    type: Number,
  },
  feedback: {
    type: String,
  },
  assignedTo:{
    type: String,
  },
  points:{
    type: Number,
    default:0
  },
  sla_value: {
    type: Number,
  },
  sla_unit: {
    type: String,
  },
  additional_fields: {
    type: Object,
  },
  resolutionTime:{
    type: Number,
  },
  isExceeded:{
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    default: "",
  },
  location: {
    type: String,
  }
  
}
,{
  timestamps: true
}
);
module.exports = mongoose.model("Complain", complainSchema);
