const mongoose = require("mongoose");

const BiteSchema = new mongoose.Schema({
  mainCategory: String,   // Programming
  subCategory: String,    // Java

  title: String,
  content: String,

  // Difficulty level for search/filtering
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Beginner",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Bite", BiteSchema);
