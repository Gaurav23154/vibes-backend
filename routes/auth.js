const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const USER = mongoose.model("USER");
const jwt = require("jsonwebtoken");
const { jwt_secret } = require("../keys");
const requireLogin = require("../middlewares/requireLogin");

router.get("/", (req, res) => {
  res.send("hello");
});

router.post("/signup", (req, res) => {
  //   console.log(req.body.name);
  const { name, gender, college, year, branch, email } = req.body;

  if (!name) {
    return res.status(422).json({ error: "nameError" });
  } else if (!gender) {
    return res.status(422).json({ error: "genderError" });
  } else if (!college) {
    return res.status(422).json({ error: "collegeError" });
  } else if (!year) {
    return res.status(422).json({ error: "yearError" });
  } else if (!branch) {
    return res.status(422).json({ error: "branchError" });
  } else if (!email) {
    return res.status(422).json({ error: "emailError" });
  }

  USER.findOne({ email: email }).then((savedUser) => {
    if (savedUser) {
      return res.status(409).json({ error: "oldUser" });
    }

    const user = new USER({
      name,
      gender,
      college,
      year,
      branch,
      email,
    });

    user
      .save()
      .then((user) => {
        // res.json({ message: "Your Account has been created" });

        const token = jwt.sign({ _id: user.id }, jwt_secret);
        res.json(token);
        // console.log(token);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
      });
  });
});

router.post("/login", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(422).json({ error: "OverallError" });
  }

  USER.findOne({ email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({ error: "newUser" });
    }

    // const { _id, photo, about } = savedUser;
    const { _id } = savedUser;

    const token = jwt.sign({ _id: savedUser.id }, jwt_secret);

    res.json(token);
    // console.log(token);

    // res.json({ token, photo, about });
  });
});

router.post("/uploadphoto", requireLogin, (req, res) => {
  const { photo } = req.body;
  const userId = req.user._id;

  if (!photo) {
    return res.status(422).json({ error: "Upload your Picture" });
  }

  USER.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.photo = photo;

      user
        .save()
        .then(() => {
          res.json({ message: "Photo uploaded successfully" });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ error: "Internal Server Error" });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

router.get("/username", requireLogin, (req, res) => {
  const name = req.user.name.toString();
  res.send(name);
});

router.post("/answers", requireLogin, (req, res) => {
  const { answers } = req.body;
  const userId = req.user._id;

  if (!answers || !Array.isArray(answers)) {
    return res.status(422).json({ error: "Invalid data" });
  }

  USER.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.answers = answers.map(({ questionNumber, selectedOption }) => ({
        questionNumber,
        selectedOption,
      }));

      user
        .save()
        .then(() => {
          res.json({ message: "Answers saved successfully" });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ error: "Internal Server Error" });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

router.get("/isanswers", requireLogin, (req, res) => {
  const hasAnswers =
    req.user && req.user.answers && req.user.answers.length > 0 ? true : false;
  res.json(hasAnswers);
});

router.get("/getanswers", requireLogin, (req, res) => {
  const userId = req.user._id;
  // console.log(userId);

  USER.findById(userId)
    .select("answers")
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    });
});

router.put("/uploadprofilepic", requireLogin, (req, res) => {
  const userId = req.user._id;
  const { photo } = req.body;

  if (!photo) {
    return res.status(422).json({ error: "Invalid data" });
  }

  USER.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.photo = photo;

      return user.save();
    })

    .then(() => {
      res.json({ message: "Answers saved successfully" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
    });
  // .catch((err) => {
  //   console.log(err);
  //   res.status(500).json({ error: "Internal Server Error" });
  // });
});

router.get("/profile", requireLogin, (req, res) => {
  const userId = req.user._id;

  USER.findById(userId)
    .select("name branch year about verify photo")
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    });
});

router.put("/editprofile", requireLogin, (req, res) => {
  const userId = req.user;
  const { name } = req.body;

  if (!name) {
    return res.status(422).json({ error: "Invalid data" });
  }

  USER.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      user.name = name;

      return user.save();
    })
    .then(() => {
      res.json({ message: "Answers saved successfully" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

router.put("/about", requireLogin, (req, res) => {
  const userId = req.user._id;
  const { about } = req.body;

  if (!about) {
    // return res.status(422).json({ error: "Invalid data" });
  }

  USER.findById(userId)
  .then((user) => {
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.about = about

    return user.save();
  })
  .then(() => {
    res.json({ message: "Answers saved successfully" });
  })
  .catch((err) => {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  });

})


module.exports = router;
