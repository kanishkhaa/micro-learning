const mongoose = require("mongoose");

const FlashcardSchema = new mongoose.Schema({
  topicId: String, // ← match Compass string
  question: String,
  answer: String,
});

module.exports = mongoose.model("Flashcard", FlashcardSchema);
