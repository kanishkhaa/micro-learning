const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");

// All notification routes require authentication
router.use(auth);

// Get notifications for current user (newest first)
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    console.error("Failed to fetch notifications", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// Mark a single notification as read
router.patch("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(notification);
  } catch (err) {
    console.error("Failed to mark notification read", err);
    res.status(500).json({ message: "Failed to update notification" });
  }
});

// Mark all notifications as read
router.post("/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to mark all notifications read", err);
    res.status(500).json({ message: "Failed to update notifications" });
  }
});

module.exports = router;

