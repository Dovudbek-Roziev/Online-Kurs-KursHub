const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
    type: { type: String, enum: ["like", "dislike"], required: true }
  },
  { timestamps: true }
);

reactionSchema.index({ userId: 1, videoId: 1 }, { unique: true });

module.exports = mongoose.model("Reaction", reactionSchema);
