require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Course = require("../src/models/Course");
const Chapter = require("../src/models/Chapter");
const uploadBufferToCloudinary = require("../src/utils/uploadBufferToCloudinary");

async function run() {
  await connectDB();

  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    throw new Error("Admin topilmadi. Avval bitta admin user yarating.");
  }

  const imagePath = path.resolve(__dirname, "../node_modules/png-js/images/laptop.png");
  const fileBuffer = fs.readFileSync(imagePath);
  const uploaded = await uploadBufferToCloudinary(fileBuffer, "course-thumbnails", "image");

  const existing = await Course.findOne({ title: "Test React Kursi" });
  if (existing) {
    await Chapter.deleteMany({ courseId: existing._id });
    await existing.deleteOne();
  }

  const course = await Course.create({
    title: "Test React Kursi",
    description: "Bu test uchun yaratilgan demo kurs. Rasm upload va kurs yaratish ishlayotganini tekshirish uchun qo'shildi.",
    price: 0,
    thumbnail: uploaded.optimizedUrl || uploaded.secure_url,
    category: "Programming",
    createdBy: admin._id,
    isPublished: true
  });

  const chapter = await Chapter.create({
    title: "Boshlanish",
    courseId: course._id,
    order: 1
  });

  console.log(
    JSON.stringify(
      {
        success: true,
        courseId: String(course._id),
        chapterId: String(chapter._id),
        thumbnail: course.thumbnail
      },
      null,
      2
    )
  );
}

run()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
