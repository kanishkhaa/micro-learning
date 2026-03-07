const mongoose = require("mongoose");

const SupportTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issueTitle: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    response: {
      type: String,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved"],
      default: "open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportTicket", SupportTicketSchema);

