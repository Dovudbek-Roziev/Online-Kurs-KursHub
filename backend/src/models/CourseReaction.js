const mongoose = require("mongoose");

const courseReactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    type: { type: String, enum: ["like", "dislike"], required: true }
  },
  { timestamps: true }
);

courseReactionSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("CourseReaction", courseReactionSchema);
