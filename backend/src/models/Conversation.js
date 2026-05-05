const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lastMessage: { type: String, default: "" },
    unreadByAdmin: { type: Boolean, default: true },
    unreadByStudent: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
