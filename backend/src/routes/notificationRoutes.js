const router = require("express").Router();
const { auth } = require("../middleware/auth");
const { listNotifications, markNotificationRead } = require("../controllers/notificationController");

router.use(auth);
router.get("/", listNotifications);
router.patch("/:notificationId/read", markNotificationRead);

module.exports = router;
