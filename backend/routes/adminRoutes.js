const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const User = require("../models/User");
const Bite = require("../models/Bite");
const ForumPost = require("../models/ForumPost");
const ContentRequest = require("../models/ContentRequest");

// All admin routes require auth + admin
router.use(auth, admin);

// Basic analytics summary for admin dashboard
router.get("/analytics", async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7); // last 7 days

    const [totalUsers, totalBites, totalForumPosts, totalContentRequests, activeUsers] =
      await Promise.all([
        User.countDocuments({}),
        Bite.countDocuments({}),
        ForumPost.countDocuments({ isDeleted: false }),
        ContentRequest.countDocuments({}),
        User.countDocuments({ lastActiveAt: { $gte: since } }),
      ]);

    res.json({
      totalUsers,
      totalBites,
      totalForumPosts,
      totalContentRequests,
      activeUsers,
    });
  } catch (err) {
    console.error("Failed to fetch admin analytics", err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

module.exports = router;

