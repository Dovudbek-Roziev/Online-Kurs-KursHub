const Video = require('../models/Video');
const UserProgress = require('../models/UserProgress');

exports.openVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id; // JWT auth middleware'dan keladi

    const currentVideo = await Video.findById(videoId).populate('chapterId');
    if (!currentVideo) return res.status(404).json({ message: 'Video topilmadi' });

    // Ketma-ketlikni (Sequential watching) tekshirish
    if (currentVideo.order > 1) {
      const previousVideo = await Video.findOne({
        chapterId: currentVideo.chapterId._id,
        order: currentVideo.order - 1
      });

      if (previousVideo) {
        const prevProgress = await UserProgress.findOne({ userId, videoId: previousVideo._id });
        if (!prevProgress || !prevProgress.watched) {
          return res.status(403).json({ 
            message: 'ERR_PREVIOUS_LESSON_LOCKED', 
            detail: 'Avval oldingi darsni tugatishingiz kerak' 
          });
        }
      }
    }

    // Video ko'rilganini hisoblash (Views +1)
    currentVideo.views += 1;
    await currentVideo.save();

    res.status(200).json(currentVideo);
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi', error: error.message });
  }
};