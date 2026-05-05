const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("./asyncHandler");

const auth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401);
    throw new Error("Tizimga kirish talab qilinadi");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    res.status(401);
    throw new Error("Foydalanuvchi topilmadi");
  }

  req.user = user;
  next();
});

const optionalAuth = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
  } catch (_error) {
    req.user = null;
  }

  next();
});

module.exports = { auth, optionalAuth };
