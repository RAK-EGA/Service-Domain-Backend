const mongoose = require("mongoose");

const categoryEnum = ["ELECTRICITY", "WATER", "SEWAGE", "GARBAGE", "OTHER"];
const statusEnum = ["OPEN", "VIEWED_BY_STAFF", "ASSIGNED_TO_CONCERNED_DEPARTMENT","RESOLVED","CANCELED"];
const subcategoryEnum = [
  "LEAKS",
  "LOW_WATER_PRESSURE",
  "WATER_CONTAMINATION",
  "BROKEN_PIPES",
  "WATER_QUALITY_ISSUES",
  "POWER_OUTAGES",
  "STREETLIGHT_MALFUNCTION",
  "DAMAGED_POWER_LINES",
  "ELECTRICAL_HAZARDS",
  "VOLTAGE_FLUCTUATIONS",
  "ILLEGAL_DUMPING",
  "OVERFLOWING_BINS",
  "MISSED_COLLECTION",
  "LITTERING",
  "BROKEN_WASTE_CONTAINERS",
  "SEWER_BLOCKAGE",
  "FOUL_ODORS",
  "SANITARY_SEWER_OVERFLOWS",
  "SEWER_PIPE_DAMAGE",
  "BACKUP_ISSUES",
  "OTHER",
];

const complainSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: categoryEnum,
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
    enum: subcategoryEnum,
    required: true,
    default: "OTHER",
  },
  status: {
    type: String,
    enum: statusEnum,
    default: "OPEN",
  },
  description: {
    type: String,
    required: true,
  },
  imageAttachment: {
    type: String,
  },
  voiceRecordAttachment: {
    type: String,
  },
  Location: {
    type: String,
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
}
,{
  timestamps: true
}
);
module.exports = mongoose.model("Complain", complainSchema);
