const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String, required: true }, // Cloudinary URL
  publicId: { type: String }, // Cloudinary public_id
  duration: { type: Number, default: 0 },
  order: { type: Number, required: true }, // Ketma-ketlik uchun
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  views: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);