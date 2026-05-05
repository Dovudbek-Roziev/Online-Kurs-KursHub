const mongoose = require("mongoose");
const Course = require("./src/models/Course");
const User = require("./src/models/User");
require("dotenv").config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
    
    console.log("Testing Course.find().populate('createdBy', 'name')...");
    const courses = await Course.find().populate("createdBy", "name").sort({ createdAt: -1 });
    console.log("Courses found:", courses.length);
    if (courses.length > 0) {
      console.log("First course createdBy:", courses[0].createdBy);
    }

    console.log("Success!");
    process.exit(0);
  } catch (err) {
    console.error("Course Population Error:", err);
    process.exit(1);
  }
}

test();
