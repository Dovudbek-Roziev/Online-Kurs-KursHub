const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./src/models/User");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const email = "rozievdovudbek5@gmail.com";
    const user = await User.findOneAndUpdate(
      { email: email },
      { role: "admin" },
      { new: true }
    );
    if (user) {
      console.log("SUCCESS: Akkaunt admin qilib belgilandi! Email:", user.email);
    } else {
      console.log("ERROR: Bunday email topilmadi!");
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error("Xatolik yuz berdi:", err);
    process.exit(1);
  });
