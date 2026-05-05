const express = require("express");
const { getMyChat, sendMessage, getAllConversations, getAdminConversationMessages } = require("../controllers/chatController");
const { auth } = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();

router.use(auth);

// Student routes
router.get("/my", getMyChat);
router.post("/send", sendMessage);

// Admin routes
router.get("/admin", adminOnly, getAllConversations);
router.get("/admin/:id", adminOnly, getAdminConversationMessages);

module.exports = router;
