const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  citizenID: {
    type: String,
  },
  status: {
    type: String,
    enum: ['OPEN', 'CANCELLED', 'RESOLVED', 'IN_PROGRESS'],
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
  
  
}
,{
    timestamps: true
  }
);

module.exports = mongoose.model('Request', requestSchema);
