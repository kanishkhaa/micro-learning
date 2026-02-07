const mongoose = require("mongoose");

const BiteSchema = new mongoose.Schema({
  mainCategory: String,   // Programming
  subCategory: String,    // Java

  title: String,
  content: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Bite", BiteSchema);
