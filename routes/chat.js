const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const USER = mongoose.model("USER");
const jwt = require("jsonwebtoken");
const { jwt_secret } = require("../keys");
const requireLogin = require("../middlewares/requireLogin");
const CHAT = mongoose.model("CHAT");
const MESSAGE = mongoose.model("MESSAGE");

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

// router.get("/chat", requireLogin, async (req, res) => {
//   try {
//     const userId = req.user._id; // Get the user's ID

//     // Find all chats where the user is a member
//     const chats = await CHAT.find({ users: userId })
//       .sort({ updatedAt: -1 })
//       .populate("users", "_id name photo isOnline") // Populate the users field with user data
//       // .populate("latestMessage", "_id text createdAt sender"); // Populate the latestMessage field with message data
//     // .populate({
//     //  "latestMessage",
//     //   populate: {
//     //     path: "sender",
//     //     select: "_id isRead", // Add fields you want to populate for the sender
//     //   },
//     // });
//     const lastmessage = await MESSAGE.find({_id: chat.latestMessage})
//     .popu

//     if (!chats || chats.length === 0) {
//       return res.json([]); // Return an empty array
//     }

//     // Modify each chat object to exclude the current user and keep only the other user's information
//     const modifiedChats = chats.map((chat) => {
//       const otherUser = chat.users.find(
//         (user) => user._id.toString() !== userId.toString()
//       );
//       return {
//         _id: chat._id,
//         users: [otherUser], // Keep only the other user in the array
//         // latestMessage: chat.latestMessage,
//         latestMessage: chat.latestMessage,
//       };
//     });

//     return res.json(modifiedChats);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// });

router.get("/chat", requireLogin, async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all chats where the user is a member
    const chats = await CHAT.find({ users: userId })
      .sort({ updatedAt: -1 })
      .populate("users", "_id name photo isOnline")
      .populate({
        path: "latestMessage",
        select: "_id content sender isRead",
        populate: {
          path: "sender",
          select: "_id name",
        },
      });

    if (!chats || chats.length === 0) {
      return res.json([]); // Return an empty array
    }

    // Modify each chat object to exclude the current user and keep only the other user's information
    const modifiedChats = chats.map((chat) => {
      const otherUser = chat.users.find(
        (user) => user._id.toString() !== userId.toString()
      );
      return {
        _id: chat._id,
        users: [otherUser], // Keep only the other user in the array
        latestMessage: chat.latestMessage,
      };
    });

    return res.json(modifiedChats);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/chat/:chatId", requireLogin, async (req, res) => {
  try {
    const userId = req.user._id;
    const chatId = req.params.chatId;

    // Find the chat with the given chatId
    const chat = await CHAT.findById(chatId).populate(
      "users",
      "_id name isOnline photo verify"
    );

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Find the other user in the chat (excluding the current user)
    const otherUser = chat.users.find(
      (user) => user._id.toString() !== userId.toString()
    );

    if (!otherUser) {
      return res
        .status(404)
        .json({ error: "Other user not found in the chat" });
    }

    // Return the other user's information
    const otherUserData = {
      _id: otherUser._id,
      name: otherUser.name,
      photo: otherUser.photo,
      isOnline: otherUser.isOnline,
      verify: otherUser.verify,
    };

    return res.json(otherUserData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
