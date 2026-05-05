const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    amount: { type: Number, required: true },
    paidAt: { type: Date, default: Date.now },
    stripeSessionId: { type: String, default: "" }
  },
  { timestamps: true }
);

purchaseSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("Purchase", purchaseSchema);
