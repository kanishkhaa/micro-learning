const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const Topic = require("../models/Topic");

// All favorites routes require authentication
router.use(auth);

// Helper to safely load user
async function getUser(userId, res) {
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return null;
  }
  return user;
}

// Get all favorite topics (modules) for the current user
router.get("/topics", async (req, res) => {
  try {
    const user = await getUser(req.user.id, res);
    if (!user) return;

    const favorites = user.favorites || [];

    if (!favorites.length) {
      return res.json([]);
    }

    const topics = await Topic.find({ _id: { $in: favorites } }).sort({
      mainCategory: 1,
      subCategory: 1,
      order: 1,
    });

    res.json(topics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch favorites" });
  }
});

// Add a topic to favorites
router.post("/topics/:topicId", async (req, res) => {
  try {
    const user = await getUser(req.user.id, res);
    if (!user) return;

    const { topicId } = req.params;

    if (!user.favorites) {
      user.favorites = [];
    }

    if (!user.favorites.includes(topicId)) {
      user.favorites.push(topicId);
      await user.save();
    }

    res.status(200).json({ favorites: user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add favorite" });
  }
});

// Remove a topic from favorites
router.delete("/topics/:topicId", async (req, res) => {
  try {
    const user = await getUser(req.user.id, res);
    if (!user) return;

    const { topicId } = req.params;

    user.favorites = (user.favorites || []).filter(
      (fav) => fav.toString() !== topicId
    );
    await user.save();

    res.status(200).json({ favorites: user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove favorite" });
  }
});

module.exports = router;

