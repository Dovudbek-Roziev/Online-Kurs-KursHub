module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("Faqat admin uchun");
  }

  next();
};
