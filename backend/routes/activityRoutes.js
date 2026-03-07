const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const Activity = require("../models/Activity");
const User = require("../models/User");
const Progress = require("../models/Progress");
const Topic = require("../models/Topic");

// All activity routes require authentication
router.use(auth);

// Get aggregated activity for current user.
// If no record exists yet, compute a basic snapshot on the fly.
router.get("/me", async (req, res) => {
  try {
    let activity = await Activity.findOne({ userId: req.user.id });
    const user = await User.findById(req.user.id);

    if (!activity) {
      const [completedCount, totalTopics] = await Promise.all([
        Progress.countDocuments({
          user: req.user.id,
          completedAt: { $ne: null },
        }),
        Topic.countDocuments({}),
      ]);

      const points = user?.points || 0;
      const progressPercentage =
        totalTopics > 0
          ? Math.round((completedCount / totalTopics) * 100)
          : 0;

      activity = await Activity.create({
        userId: req.user.id,
        completedBites: completedCount,
        quizzesAttempted: 0,
        totalPoints: points,
        progressPercentage,
      });
    }

    res.json({
      userPoints: user?.points || 0,
      userLevel: user?.level || "Beginner",
      activity,
    });
  } catch (err) {
    console.error("Failed to fetch activity", err);
    res.status(500).json({ message: "Failed to fetch activity" });
  }
});

module.exports = router;

