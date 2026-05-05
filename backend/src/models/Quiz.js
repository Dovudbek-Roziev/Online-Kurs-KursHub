const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctIndex: { type: Number, required: true }
});

const quizSchema = new mongoose.Schema(
  {
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true, unique: true },
    questions: [questionSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
