const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// All leaderboard routes require authentication
router.use(auth);

// GET top 10 users by points (descending)
router.get("/", async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ points: -1 })
      .limit(10)
      .select("name picture points level streak");

    res.json(users);
  } catch (err) {
    console.error("Failed to fetch leaderboard", err);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

module.exports = router;

