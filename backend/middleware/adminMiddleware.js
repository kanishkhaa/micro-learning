const User = require("../models/User");

// Simple admin check based on user.role === "admin"
module.exports = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  } catch (err) {
    console.error("adminMiddleware error", err);
    res.status(500).json({ message: "Failed to authorize admin" });
  }
};

