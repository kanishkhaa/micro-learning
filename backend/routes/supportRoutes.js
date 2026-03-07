const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const SupportTicket = require("../models/SupportTicket");
const Notification = require("../models/Notification");
const User = require("../models/User");

// All support routes require authentication
router.use(auth);

// User: create support ticket
router.post("/", async (req, res) => {
  try {
    const { issueTitle, description } = req.body;
    const ticket = await SupportTicket.create({
      userId: req.user.id,
      issueTitle,
      description,
    });

    // Notify all admins that a new support ticket was created
    try {
      const admins = await User.find({ role: "admin" }).select("_id");
      if (admins.length > 0) {
        const notifications = admins.map((a) => ({
          userId: a._id,
          message: `New support ticket: "${issueTitle}".`,
          type: "support",
        }));
        await Notification.insertMany(notifications);
      }
    } catch (e) {
      console.error("Failed to notify admins about support ticket", e);
    }

    res.status(201).json(ticket);
  } catch (err) {
    console.error("Failed to create support ticket", err);
    res.status(500).json({ message: "Failed to create ticket" });
  }
});

// User: list own tickets
router.get("/mine", async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(tickets);
  } catch (err) {
    console.error("Failed to fetch tickets", err);
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
});

// Admin: list all tickets
router.get("/", admin, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({})
      .sort({ createdAt: -1 })
      .populate("userId", "name email");
    res.json(tickets);
  } catch (err) {
    console.error("Failed to fetch all tickets", err);
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
});

// Admin: respond/update ticket
router.patch("/:id", admin, async (req, res) => {
  try {
    const { response, status } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const previousStatus = ticket.status;

    if (response !== undefined) ticket.response = response;
    if (status) ticket.status = status;
    await ticket.save();

    // Notify user when admin responds or changes status
    try {
      let message = null;
      if (response && response.trim()) {
        message = `Support has responded to your issue "${ticket.issueTitle}".`;
      } else if (status && status !== previousStatus) {
        message = `The status of your issue "${ticket.issueTitle}" is now "${ticket.status}".`;
      }

      if (message) {
        await Notification.create({
          userId: ticket.userId,
          message,
          type: "support",
        });
      }
    } catch (e) {
      console.error("Failed to create support notification", e);
    }

    res.json(ticket);
  } catch (err) {
    console.error("Failed to update ticket", err);
    res.status(500).json({ message: "Failed to update ticket" });
  }
});

module.exports = router;

