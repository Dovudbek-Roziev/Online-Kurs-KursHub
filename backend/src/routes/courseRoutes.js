const router = require("express").Router();
const {
  listCourses,
  getCourseDetail,
  openVideo,
  updateProgress,
  toggleBookmark,
  rateCourse,
  reactCourse,
  reactVideo,
  addComment,
  getCategories,
  getCourseStatus,
  getCompletionSummary
} = require("../controllers/courseController");
const { auth, optionalAuth } = require("../middleware/auth");

router.get("/", optionalAuth, listCourses);
router.get("/categories", getCategories);
router.get("/:courseId", optionalAuth, getCourseDetail);
router.get("/:courseId/status", auth, getCourseStatus);
router.get("/:courseId/progress-summary", auth, getCompletionSummary);
router.post("/:courseId/bookmark", auth, toggleBookmark);
router.post("/:courseId/rate", auth, rateCourse);
router.post("/:courseId/reaction", auth, reactCourse);
router.post("/videos/:videoId/open", auth, openVideo);
router.post("/videos/:videoId/progress", auth, updateProgress);
router.post("/videos/:videoId/reaction", auth, reactVideo);
router.post("/videos/:videoId/comments", auth, addComment);

module.exports = router;
