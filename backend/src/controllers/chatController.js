const asyncHandler = require("../middleware/asyncHandler");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// STUDENT: Get my conversation & messages
exports.getMyChat = asyncHandler(async (req, res) => {
  let conversation = await Conversation.findOne({ student: req.user._id });
  if (!conversation) {
    conversation = await Conversation.create({ student: req.user._id });
  } else {
    // mark as read by student
    conversation.unreadByStudent = false;
    await conversation.save();
  }

  const messages = await Message.find({ conversation: conversation._id }).sort("createdAt");
  res.json({ conversation, messages });
});

// STUDENT & ADMIN: Send a message
exports.sendMessage = asyncHandler(async (req, res) => {
  const { content, conversationId } = req.body;
  const isAdmin = req.user.role === "admin";
  
  let conversation;
  if (isAdmin) {
    conversation = await Conversation.findById(conversationId);
  } else {
    conversation = await Conversation.findOne({ student: req.user._id });
    if (!conversation) {
      conversation = await Conversation.create({ student: req.user._id });
    }
  }

  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    isAdmin,
    content
  });

  conversation.lastMessage = content;
  if (isAdmin) {
    conversation.unreadByStudent = true;
  } else {
    conversation.unreadByAdmin = true;
  }
  await conversation.save();

  res.status(201).json(message);
});

// ADMIN: Get all conversations
exports.getAllConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find()
    .populate("student", "name email")
    .sort("-updatedAt");
  res.json(conversations);
});

// ADMIN: Get messages for a specific conversation
exports.getAdminConversationMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id).populate("student", "name email");
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }
  
  conversation.unreadByAdmin = false;
  await conversation.save();

  const messages = await Message.find({ conversation: conversation._id }).sort("createdAt");
  res.json({ conversation, messages });
});
