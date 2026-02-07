const router = require("express").Router();
const Flashcard = require("../models/Flashcard");

// GET all flashcards for a topic
router.get("/:topicId", async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ topicId: req.params.topicId }).sort({ createdAt: 1 });
    res.json(flashcards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add flashcard manually
router.post("/", async (req, res) => {
  try {
    const flashcard = new Flashcard(req.body);
    const saved = await flashcard.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update flashcard
router.put("/:id", async (req, res) => {
  try {
    const updated = await Flashcard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE flashcard
router.delete("/:id", async (req, res) => {
  try {
    await Flashcard.findByIdAndDelete(req.params.id);
    res.json({ message: "Flashcard deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
