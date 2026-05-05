const router = require("express").Router();
const { auth } = require("../middleware/auth");
const { getChapterQuiz, submitQuiz, getMyQuizResult } = require("../controllers/quizController");

router.get("/chapters/:chapterId", auth, getChapterQuiz);
router.post("/chapters/:chapterId/submit", auth, submitQuiz);
router.get("/chapters/:chapterId/result", auth, getMyQuizResult);

module.exports = router;
