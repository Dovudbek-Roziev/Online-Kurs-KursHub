const Chapter = require("../models/Chapter");
const Video = require("../models/Video");
const Purchase = require("../models/Purchase");
const UserProgress = require("../models/UserProgress");

async function getOrderedVideos(courseId) {
  const chapters = await Chapter.find({ courseId }).sort({ order: 1 }).lean();
  const chapterIds = chapters.map((chapter) => chapter._id);
  const videos = await Video.find({ chapterId: { $in: chapterIds } }).lean();

  return chapters.flatMap((chapter) =>
    videos
      .filter((video) => String(video.chapterId) === String(chapter._id))
      .sort((a, b) => a.order - b.order)
  );
}

async function canAccessCourse(user, course) {
  if (!course.price) return true;
  if (!user) return false;
  if (user.role === "admin") return true;
  const purchase = await Purchase.findOne({ userId: user._id, courseId: course._id });
  return Boolean(purchase);
}

async function canAccessVideo(user, course, videoId) {
  if (!user) return { allowed: false, reason: "ERR_AUTH_REQUIRED" };

  const purchased = await canAccessCourse(user, course);
  if (!purchased) {
    return { allowed: false, reason: "ERR_COURSE_NOT_PURCHASED" };
  }

  const orderedVideos = await getOrderedVideos(course._id);
  const index = orderedVideos.findIndex((video) => String(video._id) === String(videoId));

  if (index === -1) {
    return { allowed: false, reason: "ERR_VIDEO_NOT_FOUND" };
  }

  if (index === 0) {
    return { allowed: true };
  }

  const previous = orderedVideos[index - 1];
  const progress = await UserProgress.findOne({ userId: user._id, videoId: previous._id });
  if (!progress?.watched) {
    return { allowed: false, reason: "ERR_PREVIOUS_LESSON_LOCKED" };
  }

  return { allowed: true };
}

module.exports = { getOrderedVideos, canAccessCourse, canAccessVideo };
