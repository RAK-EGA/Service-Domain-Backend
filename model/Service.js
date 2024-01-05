const mongoose = require("mongoose");

// const requestSchema = new mongoose.Schema({
//     serviceName: {
//       type: String,
//     },
//     serviceDetails: {
//         type: String,
//     },
//   }
//   ,{
//     timestamps: true
//   }
//   );
//   module.exports = mongoose.model("Request", requestSchema);

const serviceSchema = new mongoose.Schema({
  serviceName: String,
  serviceDetails: Object,
  sla_value: Number,
  sla_unit: String,
});
module.exports = mongoose.model('Service', serviceSchema);