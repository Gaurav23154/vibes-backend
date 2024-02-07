const mongoose = require("mongoose");

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
  photo: {
    type: String,
    // required:true
  },
  //   answers: {
  //     type: Array,
  //   },
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
});

mongoose.model("USER", userSchema);
