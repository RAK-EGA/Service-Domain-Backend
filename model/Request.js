const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  citizenID: {
    type: String,
  },
  status: {
    type: String,
    enum: ["OPEN", "VIEWED_BY_STAFF", "ASSIGNED_TO_CONCERNED_DEPARTMENT","RESOLVED","CANCELED"],
    default: 'OPEN',
  },
  serviceName: {
    type: String,
  },
  serviceDetails: {
    type: Object,
  },
  sla_value: {
    type: Number,
  },
  sla_unit: {
    type: String,
  },
  requestName:{
    type: String,
  },
  resolutionTime:{
    type: Number,
  },
  isExceeded:{
    type: Boolean,
    default: false,
  },
  department:{
    type: String,
  },
  
}
,{
    timestamps: true
  }
);

module.exports = mongoose.model('Request', requestSchema);
