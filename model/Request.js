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

const requestSchema = new mongoose.Schema({
  serviceName: String,
  serviceDetails: Object,
});
module.exports = mongoose.model('Request', requestSchema);