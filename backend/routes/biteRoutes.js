const router = require("express").Router();
const Bite = require("../models/Bite");

// GET bites with optional filters:
// - main, sub      : category filters
// - q              : search by title/content (case-insensitive)
// - level          : Beginner / Intermediate / Advanced
router.get("/", async (req, res) => {
  try {
    const { main, sub, q, level } = req.query;

    const filter = {};
    if (main) filter.mainCategory = main;
    if (sub) filter.subCategory = sub;
    if (level) filter.level = level;

    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [{ title: regex }, { content: regex }];
    }

    const bites = await Bite.find(filter).sort({ createdAt: -1 });
    res.json(bites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch bites" });
  }
});

module.exports = router;
