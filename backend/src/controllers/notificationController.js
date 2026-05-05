const Notification = require("../models/Notification");
const asyncHandler = require("../middleware/asyncHandler");

const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(notifications);
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.notificationId, userId: req.user._id },
    { read: true },
    { new: true }
  );
  res.json(notification);
});

module.exports = { listNotifications, markNotificationRead };
