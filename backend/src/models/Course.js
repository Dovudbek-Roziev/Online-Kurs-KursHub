const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  thumbnail: { type: String, default: '' }, // Cloudinary URL
  thumbnailPublicId: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  category: { type: String, required: true },
  outcomes: { type: [String], default: [] },
  isPublished: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);