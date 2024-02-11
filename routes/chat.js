
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const USER = mongoose.model("USER");
const jwt = require("jsonwebtoken");
const { jwt_secret } = require("../keys");
const requireLogin = require("../middlewares/requireLogin");
const CHAT = mongoose.model("CHAT");

router.post("/chat", requireLogin, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.body; // userIds should be an array of user IDs

    // Check if a chat with the same set of users already exists
    const existingChat = await CHAT.findOne({
      users: { $all: [userId, id] },
    });

    if (existingChat) {
      return res.json({ chatId: existingChat._id });
    }

    // Create a new chat if it doesn't exist
    const newChat = new CHAT({
      users: [userId, id], // Create a chat with two users
    });

    const savedChat = await newChat.save();

    return res.json({ chatId: savedChat._id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
