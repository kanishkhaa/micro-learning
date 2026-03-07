const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const ForumPost = require("../models/ForumPost");
const ForumReply = require("../models/ForumReply");
const Notification = require("../models/Notification");

// All forum routes require authentication
router.use(auth);

// Get all posts (excluding soft-deleted), newest first
router.get("/posts", async (req, res) => {
  try {
    const posts = await ForumPost.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .populate("userId", "name picture");
    res.json(posts);
  } catch (err) {
    console.error("Failed to fetch forum posts", err);
    res.status(500).json({ message: "Failed to fetch forum posts" });
  }
});

// Create a new post
router.post("/posts", async (req, res) => {
  try {
    const { title, description } = req.body;
    const post = await ForumPost.create({
      userId: req.user.id,
      title,
      description,
    });
    res.status(201).json(post);
  } catch (err) {
    console.error("Failed to create forum post", err);
    res.status(500).json({ message: "Failed to create post" });
  }
});

// Get single post with replies
router.get("/posts/:id", async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id).populate(
      "userId",
      "name picture"
    );
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: "Post not found" });
    }

    const replies = await ForumReply.find({ postId: post._id })
      .sort({ createdAt: 1 })
      .populate("userId", "name picture");

    res.json({ post, replies });
  } catch (err) {
    console.error("Failed to fetch forum post", err);
    res.status(500).json({ message: "Failed to fetch post" });
  }
});

// Add reply to a post
router.post("/posts/:id/replies", async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.isLocked) {
      return res.status(403).json({ message: "Post is locked by admin" });
    }

    const { message } = req.body;
    const reply = await ForumReply.create({
      postId: post._id,
      userId: req.user.id,
      message,
    });

    // Notify post owner if someone else replied
    if (String(post.userId) !== String(req.user.id)) {
      try {
        await Notification.create({
          userId: post.userId,
          message: "Someone replied to your forum post.",
          type: "forum",
        });
      } catch (e) {
        console.error("Failed to create forum notification", e);
      }
    }

    res.status(201).json(reply);
  } catch (err) {
    console.error("Failed to add reply", err);
    res.status(500).json({ message: "Failed to add reply" });
  }
});

// Admin: soft-delete a post
router.delete("/posts/:id", admin, async (req, res) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("Failed to delete post", err);
    res.status(500).json({ message: "Failed to delete post" });
  }
});

// Admin: lock or unlock a post
router.patch("/posts/:id/lock", admin, async (req, res) => {
  try {
    const { locked } = req.body;
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { isLocked: !!locked },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    console.error("Failed to update lock state", err);
    res.status(500).json({ message: "Failed to update post" });
  }
});

module.exports = router;

