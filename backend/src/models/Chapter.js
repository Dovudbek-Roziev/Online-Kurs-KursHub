const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    order: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chapter", chapterSchema);
