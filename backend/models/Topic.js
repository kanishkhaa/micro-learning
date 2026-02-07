const mongoose = require("mongoose");

const TopicSchema = new mongoose.Schema({
  mainCategory: String,   // Programming
  subCategory: String,    // Java

  name: String,           // Introduction to Java
  order: Number,          // 1,2,3
});

module.exports = mongoose.model("Topic", TopicSchema);
