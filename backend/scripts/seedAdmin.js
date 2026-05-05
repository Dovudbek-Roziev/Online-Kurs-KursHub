const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const User = require("../src/models/User");

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB ga ulandi...");

    const email = process.argv[2] || "admin@example.com";
    const password = process.argv[3] || "admin123";
    const name = process.argv[4] || "Admin";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log(`Bunday admin allaqachon mavjud: ${email}`);
      process.exit(0);
    }

    const adminUser = new User({
      name,
      email,
      password, // Pre-save hook hashes it
      role: "admin"
    });

    await adminUser.save();
    console.log(`✅ Admin muvaffaqiyatli yaratildi!
Email: ${email}
Parol: ${password}`);

    process.exit(0);
  } catch (err) {
    console.error("Xatolik yuz berdi:", err);
    process.exit(1);
  }
}

seedAdmin();
