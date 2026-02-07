const router = require("express").Router();
const Progress = require("../models/Progress");
const Topic = require("../models/Topic");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// All progress routes require authentication
router.use(auth);

// Mark the start of a topic for the current user (used for timing)
router.post("/topic/:topicId/start", async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const now = new Date();

    const progress = await Progress.findOneAndUpdate(
      { user: req.user.id, topicId },
      { $setOnInsert: { startedAt: now } },
      { new: true, upsert: true }
    );

    res.status(201).json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to start progress" });
  }
});

// Mark a topic as completed for the current user
router.post("/topic/:topicId/complete", async (req, res) => {
  try {
    const { topicId } = req.params;

    // Optional: ensure topic exists
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const now = new Date();

    const progress = await Progress.findOneAndUpdate(
      { user: req.user.id, topicId },
      {
        $set: { completedAt: now },
        $setOnInsert: { startedAt: now },
      },
      { new: true, upsert: true }
    );

    // Update user streak day-wise
    try {
      const user = await User.findById(req.user.id);
      if (user) {
        const today = new Date();
        const todayDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );

        let streak = user.streak || 0;

        if (!user.lastActiveAt) {
          streak = 1;
        } else {
          const last = new Date(user.lastActiveAt);
          const lastDate = new Date(
            last.getFullYear(),
            last.getMonth(),
            last.getDate()
          );
          const diffDays = Math.round(
            (todayDate - lastDate) / (1000 * 60 * 60 * 24)
          );

          if (diffDays === 0) {
            // same day – keep streak as is
          } else if (diffDays === 1) {
            streak += 1;
          } else if (diffDays > 1) {
            streak = 1;
          }
        }

        user.streak = streak;
        user.lastActiveAt = now;
        await user.save();
      }
    } catch (e) {
      console.error("Failed to update streak", e);
    }

    res.status(201).json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update progress" });
  }
});

// Get all completed topics for the current user (with topic details)
router.get("/", async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user.id }).populate(
      "topicId"
    );
    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch progress" });
  }
});

module.exports = router;

