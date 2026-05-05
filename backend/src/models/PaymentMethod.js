const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Masalan: "Asosiy karta", "Biznes hisob"
    cardHolder: { type: String, required: true },
    last4: { type: String, required: true }, // Kartaning oxirgi 4 raqami
    provider: { type: String, default: "stripe" },
    isDefault: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
