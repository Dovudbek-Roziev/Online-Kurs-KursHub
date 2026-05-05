const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true }
  },
  { timestamps: true }
);

bookmarkSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("Bookmark", bookmarkSchema);
