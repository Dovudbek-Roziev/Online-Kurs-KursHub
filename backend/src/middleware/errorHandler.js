function notFound(req, res, next) {
  const error = new Error(`Route topilmadi: ${req.originalUrl}`);
  res.status(404);
  next(error);
}

function errorHandler(err, _req, res, _next) {
  console.error("Backend Error:", err);
  require("fs").appendFileSync("C:/Users/User/Desktop/Online Kurs/backend/error.log", new Date().toISOString() + " - " + err.stack + "\n\n");
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || "Server xatosi"
  });
}

module.exports = { notFound, errorHandler };
