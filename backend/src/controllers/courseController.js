const Course = require("../models/Course");
const Chapter = require("../models/Chapter");
const Video = require("../models/Video");
const CourseView = require("../models/CourseView");
const VideoView = require("../models/VideoView");
const Comment = require("../models/Comment");
const Rating = require("../models/Rating");
const Reaction = require("../models/Reaction");
const CourseReaction = require("../models/CourseReaction");
const Bookmark = require("../models/Bookmark");
const Purchase = require("../models/Purchase");
const UserProgress = require("../models/UserProgress");
const Notification = require("../models/Notification");
const asyncHandler = require("../middleware/asyncHandler");
const { canAccessCourse, canAccessVideo, getOrderedVideos } = require("../utils/access");

async function enrichCourses(courses, userId) {
  const list = Array.isArray(courses) ? courses : [courses];
  const ids = list.map((course) => course._id);
  const [ratings, bookmarks, purchases] = await Promise.all([
    Rating.find({ courseId: { $in: ids } }),
    userId ? Bookmark.find({ userId, courseId: { $in: ids } }) : [],
    userId ? Purchase.find({ userId, courseId: { $in: ids } }) : []
  ]);

  return list.map((course) => {
    const courseRatings = ratings.filter((item) => String(item.courseId) === String(course._id));
    const average = courseRatings.length
      ? Number((courseRatings.reduce((sum, item) => sum + item.value, 0) / courseRatings.length).toFixed(1))
      : 0;

    return {
      ...(course.toObject?.() || course),
      rating: average,
      myRating: userId ? ratings.find((item) => String(item.courseId) === String(course._id) && String(item.userId) === String(userId))?.value || null : null,
      isBookmarked: bookmarks.some((item) => String(item.courseId) === String(course._id)),
      isPurchased: purchases.some((item) => String(item.courseId) === String(course._id))
    };
  });
}

const listCourses = asyncHandler(async (req, res) => {
  const { q, category, pricing, minRating } = req.query;
  const filter = req.user?.role === "admin" ? {} : { isPublished: true };

  if (q) filter.title = { $regex: q, $options: "i" };
  if (category) filter.category = category;
  if (pricing === "free") filter.price = 0;
  if (pricing === "paid") filter.price = { $gt: 0 };

  const courses = await Course.find(filter).populate("createdBy", "name").sort({ createdAt: -1 });
  const enriched = await enrichCourses(courses, req.user?._id);
  res.json(minRating ? enriched.filter((item) => item.rating >= Number(minRating)) : enriched);
});

const getCourseDetail = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId).populate("createdBy", "name");
  if (!course) {
    res.status(404);
    throw new Error("ERR_COURSE_NOT_FOUND");
  }

  if (req.user) {
    const existingView = await CourseView.findOne({ userId: req.user._id, courseId: course._id });
    if (!existingView) {
      await CourseView.create({ userId: req.user._id, courseId: course._id });
      await Course.findByIdAndUpdate(course._id, { $inc: { views: 1 } });
      course.views += 1;
    }
  }

  const chapters = await Chapter.find({ courseId: course._id }).sort({ order: 1 }).lean();
  const videos = await Video.find({ chapterId: { $in: chapters.map((chapter) => chapter._id) } }).lean();
  const progressRecords = req.user
    ? await UserProgress.find({ userId: req.user._id, videoId: { $in: videos.map((video) => video._id) } }).lean()
    : [];

  const accessAllowed = await canAccessCourse(req.user, course);
  const progressMap = new Map(progressRecords.map((item) => [String(item.videoId), item]));
  const orderedVideos = chapters.flatMap((chapter) =>
    videos
      .filter((video) => String(video.chapterId) === String(chapter._id))
      .sort((a, b) => a.order - b.order)
  );
  const sequentialLockMap = new Map();
  orderedVideos.forEach((video, index) => {
    if (index === 0) {
      sequentialLockMap.set(String(video._id), false);
      return;
    }
    const previous = orderedVideos[index - 1];
    sequentialLockMap.set(String(video._id), !progressMap.get(String(previous._id))?.watched);
  });

  const chapterPayload = chapters.map((chapter) => ({
    ...chapter,
    videos: videos
      .filter((video) => String(video.chapterId) === String(chapter._id))
      .sort((a, b) => a.order - b.order)
      .map((video) => ({
        ...video,
        locked: (course.price > 0 && !accessAllowed) || (req.user ? sequentialLockMap.get(String(video._id)) : false),
        progress: progressMap.get(String(video._id)) || null
      }))
  }));

  const ratings = await Rating.find({ courseId: course._id });
  const average = ratings.length
    ? Number((ratings.reduce((sum, item) => sum + item.value, 0) / ratings.length).toFixed(1))
    : 0;
  const [likes, dislikes, myReaction, myRatingRecord] = await Promise.all([
    CourseReaction.countDocuments({ courseId: course._id, type: "like" }),
    CourseReaction.countDocuments({ courseId: course._id, type: "dislike" }),
    req.user ? CourseReaction.findOne({ userId: req.user._id, courseId: course._id }) : null,
    req.user ? Rating.findOne({ userId: req.user._id, courseId: course._id }) : null
  ]);

  const enriched = await enrichCourses(course, req.user?._id);

  res.json({
    ...enriched[0],
    rating: average,
    myRating: myRatingRecord?.value || null,
    likes,
    dislikes,
    myReaction: myReaction?.type || null,
    chapters: chapterPayload
  });
});

const openVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.videoId);
  if (!video) {
    res.status(404);
    throw new Error("ERR_VIDEO_NOT_FOUND");
  }

  const chapter = await Chapter.findById(video.chapterId);
  const course = await Course.findById(chapter.courseId);
  const access = await canAccessVideo(req.user, course, video._id);

  if (!access.allowed) {
    res.status(403);
    throw new Error(access.reason);
  }

  const existingVideoView = await VideoView.findOne({ userId: req.user._id, videoId: video._id });
  if (!existingVideoView) {
    await VideoView.create({ userId: req.user._id, videoId: video._id });
    await Video.findByIdAndUpdate(video._id, { $inc: { views: 1 } });
  }

  const existingCourseView = await CourseView.findOne({ userId: req.user._id, courseId: course._id });
  if (!existingCourseView) {
    await CourseView.create({ userId: req.user._id, courseId: course._id });
    await Course.findByIdAndUpdate(course._id, { $inc: { views: 1 } });
  }

  const chapters = await Chapter.find({ courseId: course._id }).sort({ order: 1 }).lean();
  const videos = await Video.find({ chapterId: { $in: chapters.map((chapter) => chapter._id) } }).lean();
  const progressRecords = await UserProgress.find({ userId: req.user._id, videoId: { $in: videos.map((v) => v._id) } }).lean();
  const progressMap = new Map(progressRecords.map((item) => [String(item.videoId), item]));
  
  const accessAllowed = await canAccessCourse(req.user, course);
  const orderedVideos = chapters.flatMap((chapter) =>
    videos
      .filter((v) => String(v.chapterId) === String(chapter._id))
      .sort((a, b) => a.order - b.order)
  );

  const sequentialLockMap = new Map();
  orderedVideos.forEach((v, index) => {
    if (index === 0) {
      sequentialLockMap.set(String(v._id), false);
      return;
    }
    const previous = orderedVideos[index - 1];
    sequentialLockMap.set(String(v._id), !progressMap.get(String(previous._id))?.watched);
  });

  const chapterPayload = chapters.map((chapter) => ({
    ...chapter,
    videos: videos
      .filter((v) => String(v.chapterId) === String(chapter._id))
      .sort((a, b) => a.order - b.order)
      .map((v) => ({
        ...v,
        locked: (course.price > 0 && !accessAllowed) || sequentialLockMap.get(String(v._id)),
        progress: progressMap.get(String(v._id)) || null
      }))
  }));

  const [comments, reaction, progress] = await Promise.all([
    Comment.find({ videoId: video._id }).populate("userId", "name").sort({ createdAt: -1 }),
    Reaction.findOne({ userId: req.user._id, videoId: video._id }),
    UserProgress.findOne({ userId: req.user._id, videoId: video._id })
  ]);

  res.json({
    video: video,
    course: { ...course.toObject(), chapters: chapterPayload },
    comments,
    reaction: reaction?.type || null,
    progress
  });
});

const updateProgress = asyncHandler(async (req, res) => {
  const { lastTime = 0, watched = false } = req.body;
  const video = await Video.findById(req.params.videoId);
  const chapter = await Chapter.findById(video.chapterId);
  const course = await Course.findById(chapter.courseId);
  const access = await canAccessVideo(req.user, course, video._id);

  if (!access.allowed) {
    res.status(403);
    throw new Error(access.reason);
  }

  const normalizedWatched = watched || (video.duration > 0 && lastTime >= video.duration * 0.9);
  const progress = await UserProgress.findOneAndUpdate(
    { userId: req.user._id, videoId: video._id },
    { userId: req.user._id, videoId: video._id, lastTime, watched: normalizedWatched },
    { upsert: true, new: true }
  );

  res.json(progress);
});

const toggleBookmark = asyncHandler(async (req, res) => {
  const existing = await Bookmark.findOne({ userId: req.user._id, courseId: req.params.courseId });
  if (existing) {
    await existing.deleteOne();
    return res.json({ bookmarked: false });
  }

  await Bookmark.create({ userId: req.user._id, courseId: req.params.courseId });
  res.json({ bookmarked: true });
});

const rateCourse = asyncHandler(async (req, res) => {
  const value = Number(req.body.value);
  if (value < 1 || value > 5) {
    res.status(400);
    throw new Error("ERR_RATING_RANGE");
  }

  await Rating.findOneAndUpdate(
    { userId: req.user._id, courseId: req.params.courseId },
    { userId: req.user._id, courseId: req.params.courseId, value },
    { upsert: true, new: true }
  );

  const ratings = await Rating.find({ courseId: req.params.courseId });
  const average = Number((ratings.reduce((sum, item) => sum + item.value, 0) / ratings.length).toFixed(1));
  await Course.findByIdAndUpdate(req.params.courseId, { rating: average });
  res.json({ rating: average });
});

const reactCourse = asyncHandler(async (req, res) => {
  const { type } = req.body;
  if (!["like", "dislike"].includes(type)) {
    res.status(400);
    throw new Error("ERR_INVALID_REACTION");
  }

  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error("ERR_COURSE_NOT_FOUND");
  }

  const current = await CourseReaction.findOne({ userId: req.user._id, courseId: course._id });

  if (current?.type === type) {
    await current.deleteOne();
  } else {
    await CourseReaction.findOneAndUpdate(
      { userId: req.user._id, courseId: course._id },
      { userId: req.user._id, courseId: course._id, type },
      { upsert: true, new: true }
    );
  }

  const [likes, dislikes, myReaction] = await Promise.all([
    CourseReaction.countDocuments({ courseId: course._id, type: "like" }),
    CourseReaction.countDocuments({ courseId: course._id, type: "dislike" }),
    CourseReaction.findOne({ userId: req.user._id, courseId: course._id })
  ]);

  res.json({
    likes,
    dislikes,
    myReaction: myReaction?.type || null
  });
});

const reactVideo = asyncHandler(async (req, res) => {
  const { type } = req.body;
  if (!["like", "dislike"].includes(type)) {
    res.status(400);
    throw new Error("ERR_INVALID_REACTION");
  }

  const video = await Video.findById(req.params.videoId);
  const current = await Reaction.findOne({ userId: req.user._id, videoId: video._id });

  if (current?.type === type) {
    await current.deleteOne();
  } else {
    await Reaction.findOneAndUpdate(
      { userId: req.user._id, videoId: video._id },
      { userId: req.user._id, videoId: video._id, type },
      { upsert: true, new: true }
    );
  }

  const [likes, dislikes] = await Promise.all([
    Reaction.countDocuments({ videoId: video._id, type: "like" }),
    Reaction.countDocuments({ videoId: video._id, type: "dislike" })
  ]);

  await Video.findByIdAndUpdate(video._id, { likes, dislikes });
  res.json({ likes, dislikes });
});

const addComment = asyncHandler(async (req, res) => {
  const { text, parentCommentId = null } = req.body;
  const comment = await Comment.create({
    userId: req.user._id,
    videoId: req.params.videoId,
    text,
    parentCommentId
  });

  if (parentCommentId) {
    const parent = await Comment.findById(parentCommentId);
    if (parent && String(parent.userId) !== String(req.user._id)) {
      await Notification.create({
        userId: parent.userId,
        text: "replyToYourComment"
      });
    }
  }

  const populated = await Comment.findById(comment._id).populate("userId", "name");
  res.status(201).json(populated);
});

const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Course.distinct("category");
  res.json(categories.filter(Boolean));
});

const getCourseStatus = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  const purchased = req.user
    ? await Purchase.findOne({ userId: req.user._id, courseId: course._id })
    : null;

  res.json({
    canAccess: await canAccessCourse(req.user, course),
    isPurchased: Boolean(purchased)
  });
});

const getCompletionSummary = asyncHandler(async (req, res) => {
  const orderedVideos = await getOrderedVideos(req.params.courseId);
  const progress = await UserProgress.find({
    userId: req.user._id,
    videoId: { $in: orderedVideos.map((video) => video._id) }
  });
  const watchedCount = progress.filter((item) => item.watched).length;
  const percent = orderedVideos.length ? Math.round((watchedCount / orderedVideos.length) * 100) : 0;

  res.json({ totalVideos: orderedVideos.length, watchedCount, percent });
});

module.exports = {
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
};
