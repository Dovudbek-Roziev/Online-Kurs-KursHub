const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true },
  courseId:      { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  certificateId: { type: String, required: true },
  issuedAt:      { type: Date,   default: Date.now },
});

schema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("Certificate", schema);
