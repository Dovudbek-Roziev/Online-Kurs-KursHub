const router = require("express").Router();
const {
  upload,
  createCourse,
  updateCourse,
  deleteCourse,
  addChapter,
  deleteChapter,
  addVideo,
  deleteVideo,
  getAnalytics,
  getUsers,
  updateUserPassword,
  assignCourse,
  getComments,
  deleteComment
} = require("../controllers/adminController");
const { auth } = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

router.use(auth, adminOnly);

router.get("/analytics", getAnalytics);
router.post("/courses", upload.single("thumbnail"), createCourse);
router.put("/courses/:courseId", upload.single("thumbnail"), updateCourse);
router.delete("/courses/:courseId", deleteCourse);
router.post("/courses/:courseId/chapters", addChapter);
router.delete("/chapters/:chapterId", deleteChapter);
router.post("/chapters/:chapterId/videos", upload.single("video"), addVideo);
router.delete("/videos/:videoId", deleteVideo);

// User Management
router.get("/users", getUsers);
router.put("/users/:userId/password", updateUserPassword);
router.post("/assign-course", assignCourse);

// Payment Methods
const { getPaymentMethods, createPaymentMethod, deletePaymentMethod } = require("../controllers/adminController");
router.get("/payment-methods", getPaymentMethods);
router.post("/payment-methods", createPaymentMethod);
router.delete("/payment-methods/:id", deletePaymentMethod);

// Comments
router.get("/comments", getComments);
router.delete("/comments/:commentId", deleteComment);

// Quiz Management
const { getChapterQuizAdmin, upsertChapterQuiz, deleteChapterQuiz } = require("../controllers/quizController");
router.get("/chapters/:chapterId/quiz", getChapterQuizAdmin);
router.post("/chapters/:chapterId/quiz", upsertChapterQuiz);
router.delete("/chapters/:chapterId/quiz", deleteChapterQuiz);

module.exports = router;
