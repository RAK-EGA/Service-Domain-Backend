const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    documentName: {
      type: String,
    },
    document: {
        type: String,
    },
  }
  ,{
    timestamps: true
  }
  );
  module.exports = mongoose.model("Request", requestSchema);