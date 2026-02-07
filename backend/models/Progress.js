const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one progress record per user/topic
ProgressSchema.index({ user: 1, topicId: 1 }, { unique: true });

module.exports = mongoose.model("Progress", ProgressSchema);
