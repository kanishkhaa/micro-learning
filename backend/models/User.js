const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  picture: String,
  googleId: String,

  // Gamification fields
  points: {
    type: Number,
    default: 0,
  },
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Beginner",
  },

  // Simple role flag for admin features/moderation
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  streak: {
    type: Number,
    default: 0,
  },

  lastActiveAt: {
    type: Date,
  },

  favorites: [
    {
      type: String,
    },
  ],
});

module.exports = mongoose.model("User", UserSchema);
