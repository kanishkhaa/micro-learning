const router = require("express").Router();
const Topic = require("../models/Topic");
const Flashcard = require("../models/Flashcard");
const multer = require("multer");
const fs = require("fs");

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

// GET all topics
router.get("/", async (req, res) => {
  try {
    const topics = await Topic.find({}).sort({ mainCategory: 1, subCategory: 1, order: 1 });
    res.json(topics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create topic manually
router.post("/", async (req, res) => {
  try {
    const topic = new Topic(req.body);
    const saved = await topic.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update topic
router.put("/:id", async (req, res) => {
  try {
    const updated = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE topic
router.delete("/:id", async (req, res) => {
  try {
    await Topic.findByIdAndDelete(req.params.id);
    await Flashcard.deleteMany({ topicId: req.params.id }); // also delete related flashcards
    res.json({ message: "Topic and related flashcards deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST upload JSON with topics + questions
router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "File required" });

  try {
    const data = fs.readFileSync(req.file.path, "utf-8");
    const topicsJSON = JSON.parse(data);

    let totalTopics = 0;
    let totalFlashcards = 0;

    for (const t of topicsJSON) {
      // Save topic first
      const topic = new Topic({
        mainCategory: t.mainCategory,
        subCategory: t.subCategory,
        name: t.name,
        order: t.order
      });
      const savedTopic = await topic.save();
      totalTopics++;

      // Save all flashcards for this topic
      if (Array.isArray(t.questions)) {
        const flashcards = t.questions.map(f => ({
          topicId: savedTopic._id,
          question: f.question,
          answer: f.answer
        }));
        const inserted = await Flashcard.insertMany(flashcards);
        totalFlashcards += inserted.length;
      }
    }

    fs.unlinkSync(req.file.path);
    res.status(201).json({ message: "Topics & Flashcards uploaded", totalTopics, totalFlashcards });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error uploading topics & flashcards" });
  }
});

module.exports = router;
