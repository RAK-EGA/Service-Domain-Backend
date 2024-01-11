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
  service_name: String,
  sla_value: Number,
  sla_unit: String,
  additional_fields: Object,
  service_type: String,
  points: Number,
  description: String,
  department: String,
});
module.exports = mongoose.model('Service', serviceSchema);