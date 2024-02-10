const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  college: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  about: {
    type: String,
    // required:true
  },
  verify: {
    type: Boolean,
    default: false,
  },
  photo: {
    type: String,
    default:
      "https://res.cloudinary.com/booktrade/image/upload/v1694354727/default-avatar-profile-icon-vector-social-media-user-photo-700-205577532_yzne6o.jpg",
  },
  answers: {
    type: [
      {
        questionNumber: {
          type: String,
          //   required: true,
        },
        selectedOption: {
          type: String,
          //   required: true,
        },
      },
    ],
  },
  connectRequest: {
    type: [ObjectId],
    default: [], // Default to an empty array
  },
  dailyConnectionRequests: {
    type: Number,
    default: 0,
  },
  lastConnectionRequestDate: {
    type: Date,
    default: Date.now,
  },
  request: {
    type: [ObjectId],
    default: [], // Default to an empty array
  },
  friend: {
    type: [ObjectId],
    default: [], // Default to an empty array
  }

});

mongoose.model("USER", userSchema);
