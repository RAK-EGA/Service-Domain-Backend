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
  
}
,{
    timestamps: true
  }
);

module.exports = mongoose.model('Request', requestSchema);
