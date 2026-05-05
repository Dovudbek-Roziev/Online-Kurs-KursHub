const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../middleware/asyncHandler");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(normalizedEmail)) {
    res.status(400);
    throw new Error("ERR_INVALID_EMAIL");
  }

  if (!password || password.length !== 6) {
    res.status(400);
    throw new Error("ERR_PASSWORD_SHORT");
  }

  const exists = await User.findOne({ email: normalizedEmail });

  if (exists) {
    res.status(400);
    throw new Error("ERR_EMAIL_EXISTS");
  }

  const user = await User.create({ name, email: normalizedEmail, password });

  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token: generateToken(user._id)
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("ERR_LOGIN_FAILED");
  }

  res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token: generateToken(user._id)
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const dns = require("dns");
const net = require("net");

// Node.js ulanishlarini faqat IPv4 ga majburlash
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}
if (net.setDefaultAutoSelectFamily) {
  net.setDefaultAutoSelectFamily(false);
}

async function sendResetCode(email, code) {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const transporter = nodemailer.createTransport({
      // smtp.gmail.com ning aniq IPv4 manzili (DNS muammolarini chetlab o'tish uchun)
      host: "74.125.133.108", 
      port: 465,
      secure: true,
      auth: { 
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
      },
      tls: {
        rejectUnauthorized: false,
        servername: 'smtp.gmail.com' // Sertifikat tekshiruvi uchun kerak
      }
    });

    await transporter.sendMail({
      from: `"Online Kurs" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Parolni tiklash / Сброс пароля",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; background: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 24px; border: 1px solid #e5e7eb;">
            <h2 style="color: #111827; font-size: 24px; text-align: center;">Parolni tiklash</h2>
            <div style="text-align: center; padding: 30px; background: #f3f4f6; border-radius: 20px; margin: 20px 0;">
              <h1 style="color: #4f46e5; font-size: 48px; letter-spacing: 12px;">${code}</h1>
            </div>
            <p style="color: #4b5563; text-align: center;">Ushbu kodni saytga kiriting.</p>
          </div>
        </div>
      `,
      text: `Tiklash kodi: ${code}`
    });
  }
}

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("ERR_EMAIL_REQUIRED");
  }

  const user = await User.findOne({ email: String(email).trim().toLowerCase() });
  if (!user) {
    res.status(400);
    throw new Error("ERR_USER_NOT_FOUND");
  }

  const code = Math.floor(1000 + Math.random() * 9000).toString();
  user.resetCode = code;
  user.resetCodeExpires = Date.now() + 15 * 60 * 1000; // 15 mins
  await user.save();

  console.log("\n🚀 TIKLASH KODI (RESET CODE) 🚀");
  console.log("-----------------------------------------");
  console.log(`POCHTA: ${user.email}`);
  console.log(`KOD:    ${code}`);
  console.log("-----------------------------------------\n");

  try {
    // Email yuborilishini kutamiz
    await sendResetCode(user.email, code);
    res.json({ message: "otpSent" });
  } catch (error) {
    console.error("❌ Email yuborishda xato:", error.message);
    res.status(500).json({ 
      message: "emailSendError",
      error: error.message
    });
  }
});

const verifyResetCode = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ 
    email: String(email).trim().toLowerCase(),
    resetCode: code,
    resetCodeExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error("ERR_CODE_INVALID");
  }

  res.json({ success: true, message: "otpVerified" });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, password } = req.body;

  if (!password || password.length !== 6) {
    res.status(400);
    throw new Error("ERR_PASSWORD_SHORT");
  }

  const user = await User.findOne({ 
    email: String(email).trim().toLowerCase(),
    resetCode: code,
    resetCodeExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error("ERR_CODE_INVALID");
  }

  user.password = password;
  user.resetCode = "";
  user.resetCodeExpires = undefined;
  await user.save();

  res.json({ message: "passwordUpdatedSuccess" });
});

module.exports = { register, login, me, forgotPassword, verifyResetCode, resetPassword };
