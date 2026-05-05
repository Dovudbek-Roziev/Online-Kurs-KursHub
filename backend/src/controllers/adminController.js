const multer = require("multer");
const Course = require("../models/Course");
const Chapter = require("../models/Chapter");
const Video = require("../models/Video");
const Purchase = require("../models/Purchase");
const User = require("../models/User");
const Notification = require("../models/Notification");
const UserProgress = require("../models/UserProgress");
const PaymentMethod = require("../models/PaymentMethod");
const asyncHandler = require("../middleware/asyncHandler");
const os = require("os");
const cloudinary = require("../config/cloudinary");
const uploadFileToCloudinary = require("../utils/uploadFileToCloudinary");

const upload = multer({ dest: os.tmpdir() });

const createCourse = asyncHandler(async (req, res) => {
  let thumbnail = "";
  let thumbnailPublicId = "";
  if (req.file) {
    const uploaded = await uploadFileToCloudinary(req.file.path, "course-thumbnails", "image");
    thumbnail = uploaded.optimizedUrl || uploaded.secure_url;
    thumbnailPublicId = uploaded.public_id;
  }

  let paymentMethodId = req.body.paymentMethodId;
  if (!paymentMethodId && Number(req.body.price) > 0) {
    const firstMethod = await PaymentMethod.findOne({ createdBy: req.user._id });
    if (firstMethod) paymentMethodId = firstMethod._id;
  }

  const course = await Course.create({
    title: req.body.title,
    description: req.body.description,
    price: Number(req.body.price || 0),
    thumbnail,
    thumbnailPublicId,
    category: req.body.category,
    outcomes: req.body.outcomes ? (typeof req.body.outcomes === 'string' ? JSON.parse(req.body.outcomes) : req.body.outcomes) : [],
    createdBy: req.user._id,
    paymentMethodId,
    isPublished: req.body.isPublished !== "false"
  });

  const users = await User.find({ role: "user" }).select("_id");
  if (users.length) {
    await Notification.insertMany(
      users.map((user) => ({
        userId: user._id,
        text: `Yangi kurs qo'shildi: ${course.title}`
      }))
    );
  }

  res.status(201).json(course);
});
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error("ERR_COURSE_NOT_FOUND");
  }

  if (req.file) {
    if (course.thumbnailPublicId) {
      await cloudinary.uploader.destroy(course.thumbnailPublicId);
    }
    const uploaded = await uploadFileToCloudinary(req.file.path, "course-thumbnails", "image");
    course.thumbnail = uploaded.optimizedUrl || uploaded.secure_url;
    course.thumbnailPublicId = uploaded.public_id;
  }

  Object.assign(course, {
    title: req.body.title ?? course.title,
    description: req.body.description ?? course.description,
    price: req.body.price !== undefined ? Number(req.body.price) : course.price,
    category: req.body.category ?? course.category,
    outcomes: req.body.outcomes !== undefined 
      ? (typeof req.body.outcomes === 'string' ? JSON.parse(req.body.outcomes) : req.body.outcomes) 
      : course.outcomes,
    isPublished:
      req.body.isPublished !== undefined
        ? req.body.isPublished === "true" || req.body.isPublished === true
        : course.isPublished
  });

  await course.save();
  res.json(course);
});

const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error("ERR_COURSE_NOT_FOUND");
  }

  const chapters = await Chapter.find({ courseId: course._id });
  const chapterIds = chapters.map((chapter) => chapter._id);

  const videos = await Video.find({ chapterId: { $in: chapterIds } });
  
  for (const video of videos) {
    if (video.publicId) {
      await cloudinary.uploader.destroy(video.publicId, { resource_type: "video" });
    }
  }

  if (course.thumbnailPublicId) {
    await cloudinary.uploader.destroy(course.thumbnailPublicId);
  }

  await Video.deleteMany({ chapterId: { $in: chapterIds } });
  await Chapter.deleteMany({ courseId: course._id });
  await course.deleteOne();

  res.json({ success: true });
});

const addChapter = asyncHandler(async (req, res) => {
  const chapter = await Chapter.create({
    title: req.body.title,
    courseId: req.params.courseId,
    order: Number(req.body.order)
  });

  res.status(201).json(chapter);
});

const addVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("ERR_VIDEO_REQUIRED");
  }

  const uploaded = await uploadFileToCloudinary(req.file.path, "course-videos", "video");

  const video = await Video.create({
    title: req.body.title,
    description: req.body.description,
    videoUrl: uploaded.optimizedUrl || uploaded.secure_url,
    publicId: uploaded.public_id,
    duration: Math.round(uploaded.duration || 0),
    order: Number(req.body.order),
    chapterId: req.params.chapterId
  });

  res.status(201).json(video);
});

const getAnalytics = asyncHandler(async (_req, res) => {
  try {
    const [topCourses, activeUsers, revenue, mostActiveUsers, topLikedVideos] = await Promise.all([
      Course.find().sort({ views: -1 }).limit(5).select("title views price rating"),
      User.countDocuments({ role: "user" }),
      Purchase.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      UserProgress.aggregate([
        { $group: { _id: "$userId", total: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user"
          }
        }
      ]),
      Video.find().sort({ likes: -1 }).limit(5).select("title likes dislikes views")
    ]);

    res.json({
      topCourses,
      activeUsers,
      revenue: revenue[0]?.total || 0,
      mostActiveUsers: mostActiveUsers.map((item) => ({
        name: item.user[0]?.name || "User",
        total: item.total
      })),
      topLikedVideos
    });
  } catch (err) {
    console.error("Analytics Error:", err);
    throw err;
  }
});

const deleteChapter = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findById(req.params.chapterId);
  if (!chapter) {
    res.status(404);
    throw new Error("ERR_CHAPTER_NOT_FOUND");
  }

  const videos = await Video.find({ chapterId: chapter._id });
  for (const video of videos) {
    if (video.publicId) {
      await cloudinary.uploader.destroy(video.publicId, { resource_type: "video" });
    }
  }

  await Video.deleteMany({ chapterId: chapter._id });
  await chapter.deleteOne();

  res.json({ success: true });
});

const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.videoId);
  if (!video) {
    res.status(404);
    throw new Error("ERR_VIDEO_NOT_FOUND");
  }

  if (video.publicId) {
    await cloudinary.uploader.destroy(video.publicId, { resource_type: "video" });
  }

  await video.deleteOne();
  res.json({ success: true });
});

const getPaymentMethods = asyncHandler(async (req, res) => {
  const methods = await PaymentMethod.find({ createdBy: req.user._id });
  res.json(methods);
});

const createPaymentMethod = asyncHandler(async (req, res) => {
  const { name, cardHolder, last4, provider } = req.body;
  const method = await PaymentMethod.create({
    name,
    cardHolder,
    last4,
    provider: provider || "stripe",
    createdBy: req.user._id
  });
  res.status(201).json(method);
});

const deletePaymentMethod = asyncHandler(async (req, res) => {
  const method = await PaymentMethod.findById(req.params.id);
  if (!method || String(method.createdBy) !== String(req.user._id)) {
    res.status(404);
    throw new Error("To'lov usuli topilmadi");
  }
  await method.deleteOne();
  res.json({ success: true });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

const updateUserPassword = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length !== 6) {
    res.status(400);
    throw new Error("ERR_PASSWORD_SHORT");
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("ERR_USER_NOT_FOUND");
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: "Password updated successfully" });
});

const assignCourse = asyncHandler(async (req, res) => {
  const { userId, courseId } = req.body;
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error("ERR_COURSE_NOT_FOUND");
  }
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("ERR_USER_NOT_FOUND");
  }
  
  const existing = await Purchase.findOne({ userId, courseId });
  if (existing) {
    res.status(400);
    throw new Error("ERR_ALREADY_PURCHASED");
  }
  
  await Purchase.create({
    userId,
    courseId,
    amount: course.price,
    paymentMethod: "admin_assigned",
    status: "completed"
  });
  
  res.json({ success: true });
});

const Comment = require("../models/Comment");

const getComments = asyncHandler(async (_req, res) => {
  const comments = await Comment.find({ parentCommentId: null })
    .populate("userId", "name")
    .populate("videoId", "title")
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(comments);
});

const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }
  await Comment.deleteMany({ parentCommentId: comment._id });
  await comment.deleteOne();
  res.json({ success: true });
});

module.exports = {
  upload,
  createCourse,
  updateCourse,
  deleteCourse,
  addChapter,
  deleteChapter,
  addVideo,
  deleteVideo,
  getAnalytics,
  getPaymentMethods,
  createPaymentMethod,
  deletePaymentMethod,
  getUsers,
  updateUserPassword,
  assignCourse,
  getComments,
  deleteComment
};
