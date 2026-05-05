const Quiz = require("../models/Quiz");
const QuizResult = require("../models/QuizResult");
const asyncHandler = require("../middleware/asyncHandler");

// Admin: chapter quizini to'liq ko'rish (to'g'ri javoblar bilan)
const getChapterQuizAdmin = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ chapterId: req.params.chapterId });
  res.json(quiz || { chapterId: req.params.chapterId, questions: [] });
});

// Admin: quiz yaratish yoki yangilash
const upsertChapterQuiz = asyncHandler(async (req, res) => {
  const { questions } = req.body;
  if (!Array.isArray(questions)) {
    res.status(400);
    throw new Error("questions massiv bo'lishi kerak");
  }
  const quiz = await Quiz.findOneAndUpdate(
    { chapterId: req.params.chapterId },
    { chapterId: req.params.chapterId, questions },
    { upsert: true, new: true, runValidators: true }
  );
  res.json(quiz);
});

// Admin: quizni o'chirish
const deleteChapterQuiz = asyncHandler(async (req, res) => {
  await Quiz.deleteOne({ chapterId: req.params.chapterId });
  res.json({ success: true });
});

// User: quizni to'g'ri javoblarsiz olish
const getChapterQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ chapterId: req.params.chapterId });
  if (!quiz) return res.json(null);

  res.json({
    _id: quiz._id,
    chapterId: quiz.chapterId,
    questions: quiz.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options
    }))
  });
});

// User: quiz javoblarini topshirish
const submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body;
  if (!Array.isArray(answers)) {
    res.status(400);
    throw new Error("answers massiv bo'lishi kerak");
  }

  const quiz = await Quiz.findOne({ chapterId: req.params.chapterId });
  if (!quiz || quiz.questions.length === 0) {
    res.status(404);
    throw new Error("Quiz topilmadi");
  }

  let score = 0;
  quiz.questions.forEach((q, i) => {
    if (answers[i] === q.correctIndex) score++;
  });

  const total = quiz.questions.length;
  const passed = score >= Math.ceil(total * 0.6);

  await QuizResult.findOneAndUpdate(
    { userId: req.user._id, chapterId: req.params.chapterId },
    { userId: req.user._id, chapterId: req.params.chapterId, score, total, passed },
    { upsert: true, new: true }
  );

  res.json({
    score,
    total,
    passed,
    correctAnswers: quiz.questions.map((q) => q.correctIndex)
  });
});

// User: o'z natijasini ko'rish
const getMyQuizResult = asyncHandler(async (req, res) => {
  const result = await QuizResult.findOne({
    userId: req.user._id,
    chapterId: req.params.chapterId
  });
  res.json(result || null);
});

module.exports = {
  getChapterQuizAdmin,
  upsertChapterQuiz,
  deleteChapterQuiz,
  getChapterQuiz,
  submitQuiz,
  getMyQuizResult
};
