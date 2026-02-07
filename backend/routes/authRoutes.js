const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

router.post("/google", async (req, res) => {
  try {
    const { name, email, picture, googleId } = req.body;

    // Check user exists
    let user = await User.findOne({ email });

    // Create if not exists
    if (!user) {
      user = await User.create({
        name,
        email,
        picture,
        googleId,
      });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: "Google Login Failed",
    });
  }
});

// Get current authenticated user (for updated streak/progress info)
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to load user" });
  }
});

module.exports = router;
