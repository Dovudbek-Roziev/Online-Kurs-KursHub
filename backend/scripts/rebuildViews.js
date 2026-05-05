require("dotenv").config();
const connectDB = require("../src/config/db");
const Course = require("../src/models/Course");
const Video = require("../src/models/Video");
const CourseView = require("../src/models/CourseView");
const VideoView = require("../src/models/VideoView");

async function rebuildViews() {
  await connectDB();

  const [courseViewCounts, videoViewCounts] = await Promise.all([
    CourseView.aggregate([{ $group: { _id: "$courseId", total: { $sum: 1 } } }]),
    VideoView.aggregate([{ $group: { _id: "$videoId", total: { $sum: 1 } } }])
  ]);

  await Promise.all([
    Course.updateMany({}, { $set: { views: 0 } }),
    Video.updateMany({}, { $set: { views: 0 } })
  ]);

  await Promise.all([
    ...courseViewCounts.map((item) =>
      Course.findByIdAndUpdate(item._id, { $set: { views: item.total } })
    ),
    ...videoViewCounts.map((item) =>
      Video.findByIdAndUpdate(item._id, { $set: { views: item.total } })
    )
  ]);

  console.log(`Course views rebuilt: ${courseViewCounts.length}`);
  console.log(`Video views rebuilt: ${videoViewCounts.length}`);
  process.exit(0);
}

rebuildViews().catch((error) => {
  console.error("Failed to rebuild views:", error.message);
  process.exit(1);
});
