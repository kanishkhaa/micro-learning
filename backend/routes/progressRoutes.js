const router = require("express").Router();
const Progress = require("../models/Progress");
const Topic = require("../models/Topic");
const User = require("../models/User");
const Activity = require("../models/Activity");
const auth = require("../middleware/authMiddleware");
const { computeLevel } = require("../utils/levelUtils");

// All progress routes require authentication
router.use(auth);

// Helper to award points and update level on the user
async function awardPoints(userId, deltaPoints) {
  if (!deltaPoints) return;
  const user = await User.findById(userId);
  if (!user) return;

  const current = user.points || 0;
  const nextPoints = current + deltaPoints;
  user.points = nextPoints;
  user.level = computeLevel(nextPoints);
  await user.save();

  // Keep Activity.totalPoints in sync
  await Activity.findOneAndUpdate(
    { userId },
    { totalPoints: nextPoints },
    { upsert: true }
  );
}

async function recomputeActivityForUser(userId) {
  const [completedCount, totalTopics, user] = await Promise.all([
    Progress.countDocuments({ user: userId, completedAt: { $ne: null } }),
    Topic.countDocuments({}),
    User.findById(userId),
  ]);

  const totalPoints = user?.points || 0;
  const progressPercentage =
    totalTopics > 0
      ? Math.round((completedCount / totalTopics) * 100)
      : 0;

  await Activity.findOneAndUpdate(
    { userId },
    {
      completedBites: completedCount,
      totalPoints,
      progressPercentage,
    },
    { upsert: true, new: true }
  );
}

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

// Mark a topic as completed for the current user (earns points)
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

    // Award points for completing a learning bite/module
    try {
      // e.g. 20 points per completed module
      await awardPoints(req.user.id, 20);
      await recomputeActivityForUser(req.user.id);
    } catch (e) {
      console.error("Failed to award points for topic completion", e);
    }

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

// Mark a quiz as completed (earns points only when passed)
router.post("/quiz/:topicId/complete", async (req, res) => {
  try {
    const { topicId } = req.params;
    const { passed, score } = req.body || {};

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Only award points if quiz is passed (client decides threshold)
    if (passed) {
      try {
        // e.g. 30 points for passing a quiz
        await awardPoints(req.user.id, 30);
      } catch (e) {
        console.error("Failed to award points for quiz completion", e);
      }
    }

    // Track quiz attempts in Activity
    try {
      await Activity.findOneAndUpdate(
        { userId: req.user.id },
        { $inc: { quizzesAttempted: 1 } },
        { upsert: true }
      );
    } catch (e) {
      console.error("Failed to update quizzesAttempted in Activity", e);
    }

    res.status(201).json({ ok: true, passed: !!passed, score: score ?? null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to record quiz completion" });
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

