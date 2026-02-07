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
