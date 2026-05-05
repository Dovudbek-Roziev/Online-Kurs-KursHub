const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("./src/models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    console.log("No admin");
    return process.exit(0);
  }
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
  try {
    const res = await fetch("http://localhost:5000/api/courses", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log("COURSES COUNT:", data.length);
  } catch (e) {
    console.log("COURSES FETCH ERR", e);
  }

  try {
    const res2 = await fetch("http://localhost:5000/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data2 = await res2.text();
    console.log("USERS STATUS:", res2.status, data2.slice(0, 500));
  } catch (e) {
    console.log("USERS FETCH ERR", e);
  }

  process.exit(0);
});
