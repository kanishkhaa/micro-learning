const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const ContentRequest = require("../models/ContentRequest");
const Notification = require("../models/Notification");
const User = require("../models/User");

// All content request routes require authentication
router.use(auth);

// Create a new content request (user)
router.post("/", async (req, res) => {
  try {
    const { topicTitle, description } = req.body;
    const request = await ContentRequest.create({
      userId: req.user.id,
      topicTitle,
      description,
    });

    // Notify all admins that a new content request was created
    try {
      const admins = await User.find({ role: "admin" }).select("_id");
      if (admins.length > 0) {
        const notifications = admins.map((a) => ({
          userId: a._id,
          message: `New content request: "${topicTitle}".`,
          type: "content",
        }));
        await Notification.insertMany(notifications);
      }
    } catch (e) {
      console.error("Failed to notify admins about content request", e);
    }

    res.status(201).json(request);
  } catch (err) {
    console.error("Failed to create content request", err);
    res.status(500).json({ message: "Failed to create request" });
  }
});

// Get current user's requests
router.get("/mine", async (req, res) => {
  try {
    const requests = await ContentRequest.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(requests);
  } catch (err) {
    console.error("Failed to fetch user requests", err);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

// Admin: get all requests
router.get("/", admin, async (req, res) => {
  try {
    const requests = await ContentRequest.find({})
      .sort({ createdAt: -1 })
      .populate("userId", "name email");
    res.json(requests);
  } catch (err) {
    console.error("Failed to fetch all requests", err);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

// Admin: update status; when marking as accepted/completed, send notification
router.patch("/:id", admin, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await ContentRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const previousStatus = request.status;
    request.status = status || request.status;
    await request.save();

    // If newly accepted or completed, notify the requester
    if (previousStatus !== request.status) {
      try {
        let message;
        if (request.status === "accepted") {
          message = `Your content request "${request.topicTitle}" has been accepted.`;
        } else if (request.status === "completed") {
          message = `Your requested content "${request.topicTitle}" is now available.`;
        }

        if (message) {
          await Notification.create({
            userId: request.userId,
            message,
            type: "content",
          });
        }
      } catch (e) {
        console.error("Failed to create content request notification", e);
      }
    }

    res.json(request);
  } catch (err) {
    console.error("Failed to update request", err);
    res.status(500).json({ message: "Failed to update request" });
  }
});

module.exports = router;

