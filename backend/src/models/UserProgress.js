const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  watched: { type: Boolean, default: false },
  lastTime: { type: Number, default: 0 } // Videoni qayerda to'xtatgani
}, { timestamps: true });

module.exports = mongoose.model('UserProgress', userProgressSchema);