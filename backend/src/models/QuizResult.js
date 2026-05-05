const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    passed: { type: Boolean, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizResult", quizResultSchema);
