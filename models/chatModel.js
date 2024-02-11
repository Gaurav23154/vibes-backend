const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const chatSchema = new mongoose.Schema(
  {
    users: [
      {
        type: ObjectId,
        ref: "USER",
      },
    ],
    latestMessage: {
      type: ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

mongoose.model("CHAT", chatSchema)