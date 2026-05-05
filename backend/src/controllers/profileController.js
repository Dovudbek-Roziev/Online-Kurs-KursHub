const Course = require("../models/Course");
const Purchase = require("../models/Purchase");
const Bookmark = require("../models/Bookmark");
const UserProgress = require("../models/UserProgress");
const Comment = require("../models/Comment");
const Video = require("../models/Video");
const Chapter = require("../models/Chapter");
const PaymentMethod = require("../models/PaymentMethod");
const Certificate = require("../models/Certificate");
const asyncHandler = require("../middleware/asyncHandler");
const { buildCertificateBuffer } = require("../services/certificateService");
const { getOrderedVideos } = require("../utils/access");

const getProfile = asyncHandler(async (req, res) => {
  const [purchases, bookmarks, issuedCerts] = await Promise.all([
    Purchase.find({ userId: req.user._id }).populate("courseId"),
    Bookmark.find({ userId: req.user._id }).populate("courseId"),
    Certificate.find({ userId: req.user._id }),
  ]);

  const issuedMap = new Map(issuedCerts.map(c => [String(c.courseId), c]));

  const purchasedCourses = await Promise.all(
    purchases
      .filter(p => p.courseId)
      .map(async (purchase) => {
        const orderedVideos = await getOrderedVideos(purchase.courseId._id);
        const progress = await UserProgress.find({
          userId: req.user._id,
          videoId: { $in: orderedVideos.map((video) => video._id) }
        });
        const watchedCount = progress.filter((item) => item.watched).length;
        const percent = orderedVideos.length ? Math.round((watchedCount / orderedVideos.length) * 100) : 0;
        const issued = issuedMap.get(String(purchase.courseId._id));
        return {
          course: purchase.courseId,
          percent,
          eligibleCertificate: percent === 100,
          alreadyIssued: !!issued,
          issuedAt: issued ? issued.issuedAt : null,
          certificateId: issued ? issued.certificateId : null,
        };
      })
  );

  const comments = await Comment.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  const commentVideoIds = comments.map((item) => item.videoId);
  const videos = await Video.find({ _id: { $in: commentVideoIds } }).lean();
  const chapters = await Chapter.find({ _id: { $in: videos.map((video) => video.chapterId) } }).lean();
  const courses = await Course.find({ _id: { $in: chapters.map((chapter) => chapter.courseId) } }).lean();

  const chapterMap = new Map(chapters.map((chapter) => [String(chapter._id), chapter]));
  const courseMap = new Map(courses.map((course) => [String(course._id), course]));
  const videoMap = new Map(videos.map((video) => [String(video._id), video]));

  res.json({
    user: req.user,
    purchasedCourses,
    bookmarks: bookmarks.filter(b => b.courseId).map((bookmark) => bookmark.courseId),
    certificates: purchasedCourses
      .filter((item) => item.eligibleCertificate)
      .map((item) => ({
        course: item.course,
        alreadyIssued: item.alreadyIssued,
        issuedAt: item.issuedAt,
        certificateId: item.certificateId,
      })),
    comments: comments.map((comment) => {
      const video = videoMap.get(String(comment.videoId));
      const chapter = video ? chapterMap.get(String(video.chapterId)) : null;
      const course = chapter ? courseMap.get(String(chapter.courseId)) : null;
      return {
        ...comment,
        videoTitle: video?.title || "",
        courseTitle: course?.title || ""
      };
    })
  });
});

const downloadCertificate = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  const orderedVideos = await getOrderedVideos(course._id);
  const progress = await UserProgress.find({
    userId: req.user._id,
    videoId: { $in: orderedVideos.map((video) => video._id) }
  });
  const watchedCount = progress.filter((item) => item.watched).length;
  const percent = orderedVideos.length ? Math.round((watchedCount / orderedVideos.length) * 100) : 0;

  if (percent !== 100) {
    res.status(400);
    throw new Error("ERR_CERTIFICATE_LOCKED");
  }

  const MONTHS = [
    "января","февраля","марта","апреля","мая","июня",
    "июля","августа","сентября","октября","ноября","декабря",
  ];

  const existing = await Certificate.findOne({ userId: req.user._id, courseId: course._id });
  let certificateId, completionDate;
  if (existing) {
    certificateId = existing.certificateId;
    const d = new Date(existing.issuedAt);
    completionDate = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} г.`;
  } else {
    const now = new Date();
    completionDate = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()} г.`;
    certificateId = `${String(req.user._id).slice(-6)}-${String(course._id).slice(-4)}`.toUpperCase();
    await Certificate.create({ userId: req.user._id, courseId: course._id, certificateId, issuedAt: now });
  }

  const buffer = await buildCertificateBuffer({
    userName: req.user.name,
    courseTitle: course.title,
    completionDate,
    certificateId,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="certificate-${certificateId}.pdf"`
  );
  res.send(buffer);
});

const getMyPaymentMethods = asyncHandler(async (req, res) => {
  const methods = await PaymentMethod.find({ createdBy: req.user._id });
  res.json(methods);
});

const addPaymentMethod = asyncHandler(async (req, res) => {
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

const deleteMyPaymentMethod = asyncHandler(async (req, res) => {
  const method = await PaymentMethod.findById(req.params.id);
  if (!method || String(method.createdBy) !== String(req.user._id)) {
    res.status(404);
    throw new Error("To'lov usuli topilmadi");
  }
  await method.deleteOne();
  res.json({ success: true });
});

module.exports = { getProfile, downloadCertificate, getMyPaymentMethods, addPaymentMethod, deleteMyPaymentMethod };
