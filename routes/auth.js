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

      user.about = about;

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

// for founders

router.get("/9651411934-7007932194-get", (req, res) => {
  const { email } = req.body;

  USER.findOne({ email })
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

router.put("/9651411934-7007932194-put", (req, res) => {
  const { email, verify } = req.body;

  USER.findOne({ email })
    .select("name branch year about verify photo")
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      user.verify = verify;
      return user.save();
    })
    .then((updatedUser) => {
      res.json(updatedUser);
    })

    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    });
});

// matching algotithm
function calculateMatchingPercentage(array1, array2) {
  // Ensure both arrays have the same length
  if (array1.length !== array2.length) {
    console.log("Array lengths:", array1.length, array2.length);

    throw new Error("Arrays must have the same length");
  }

  // Count the number of matching elements
  let matchingCount = 0;

  // Iterate through each element and compare
  for (let i = 0; i < array1.length; i++) {
    const answer1 = array1[i];
    const answer2 = array2[i];

    // Compare questionNumber and selectedOption
    if (
      answer1.questionNumber === answer2.questionNumber &&
      answer1.selectedOption === answer2.selectedOption
    ) {
      matchingCount++;
    }
  }

  // Calculate the percentage of matching elements
  const percentage = (matchingCount / array1.length) * 100;

  return percentage;
}

//first working modal
// router.get("/match", requireLogin, (req, res) => {
//   try{
//   const userId = req.user._id

//   const currentUser = await USER.findById(userId).select("answers");

//   if(!currentUser) {
//     return res.status(404).json({ error: "User not found" });
//   }

//   const allUsers = await USER.find().select("_id answers");

//   let mostSimilarUser = null;
//   let highestMatchingPercentage = 0;

//   for (const user of allUsers) {
//     if (user._id.toString() !== userId) {
//       const matchingPercentage = calculateMatchingPercentage(currentUser.answers, user.answers);

//       if (matchingPercentage > highestMatchingPercentage) {
//         highestMatchingPercentage = matchingPercentage;
//         mostSimilarUser = user;
//       }
//     }
//   }

//   if (mostSimilarUser) {
//     return res.json({
//       mostSimilarUserId: mostSimilarUser._id,
//       matchingPercentage: highestMatchingPercentage,
//     });
//   } else {
//     return res.json({ message: "No similar user found" });
//   }
// }
//  catch (error) {
//   console.error(error);
//   return res.status(500).json({ error: "Internal server error" });
// }
// })

// first working prototype

// router.get("/match", requireLogin, async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const currentUser = await USER.findById(userId).select("gender answers");

//     if (!currentUser || !currentUser.answers || currentUser.answers.length === 0) {
//       return res.status(404).json({ error: "User not found or no answers available" });
//     }

//     const allUsers = await USER.find().select("_id gender answers");

//     let mostSimilarUser = null;
//     let highestMatchingPercentage = 0;

//     for (const user of allUsers) {
//       // if (user._id.toString() !== userId && user.answers && user.answers.length > 0 && user.answers.length === currentUser.answers.length) {
//         if (user._id.toString() !== userId.toString() && user.gender !== currentUser.gender && user.answers && user.answers.length > 0 && user.answers.length === currentUser.answers.length) {

//       // if (user._id.toString() !== userId) {
//         const matchingPercentage = calculateMatchingPercentage(currentUser.answers, user.answers);

//         if (matchingPercentage > highestMatchingPercentage) {
//           highestMatchingPercentage = matchingPercentage;
//           mostSimilarUser = user;
//         }
//       }
//     }

//     if (mostSimilarUser) {
//       return res.json({
//         mostSimilarUserId: mostSimilarUser._id,
//         matchingPercentage: highestMatchingPercentage,
//       });
//     } else {
//       return res.json({ message: "No similar user found" });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// });

router.get("/match", requireLogin, async (req, res) => {
  try {
    const userId = req.user._id;

    const currentUser = await USER.findById(userId).select("gender answers");

    if (
      !currentUser ||
      !currentUser.answers ||
      currentUser.answers.length === 0
    ) {
      return res
        .status(404)
        .json({ error: "User not found or no answers available" });
    }

    const allUsers = await USER.find().select(
      "_id gender answers request friend"
    );

    const matchingResults = [];

    for (const user of allUsers) {
      // if (user._id.toString() !== userId && user.answers && user.answers.length > 0 && user.answers.length === currentUser.answers.length) {
      if (
        user._id.toString() !== userId.toString() &&
        user.gender !== currentUser.gender &&
        user.answers &&
        user.answers.length > 0 &&
        user.answers.length === currentUser.answers.length &&
        // !user.connectRequest.includes(userId) &&
        // !currentUser.connectRequest.includes(user._id)

        !user.request.includes(userId) &&
        !user.friend.includes(userId)
      ) {
        // if (user._id.toString() !== userId) {
        const matchingPercentage = calculateMatchingPercentage(
          currentUser.answers,
          user.answers
        );

        matchingResults.push({
          userId: user._id,
          matchingPercentage: matchingPercentage,
        });
      }
    }

    // Sort the results in decreasing order of matching percentage
    matchingResults.sort((a, b) => b.matchingPercentage - a.matchingPercentage);

    // // Calculate the number of users to include in the top 60%
    // const top60PercentCount = Math.ceil(0.6 * matchingResults.length);

    // // Get only the top 60% of users
    // const top60PercentUsers = matchingResults.slice(0, top60PercentCount);

    // //30%

    // // Calculate the number of users to include in the top 30%
    // const top30PercentCount = Math.ceil(0.3 * matchingResults.length);

    // // Get only the top 30% of users
    // const top30PercentUsers = matchingResults.slice(0, top30PercentCount);

    // //5%

    // // Calculate the number of users to include in the top 30%
    // const top5PercentCount = Math.ceil(0.05 * matchingResults.length);

    // // Get only the top 30% of users
    // const top5PercentUsers = matchingResults.slice(0, top5PercentCount);

    const percentages = [0.6, 0.3, 0.05];

    const topUsersByPercentage = percentages.map((percentage) => {
      const count = Math.ceil(percentage * matchingResults.length);
      return matchingResults.slice(0, count);
    });

    // return res.json(topUsersByPercentage);

    // Keep track of selected users to avoid repetition
    // const selectedUserIds = new Set();

    // Function to get a random user from the array, excluding those in the set
    // const getRandomUser = (userArray, exclusionSet) => {
    //   const availableUsers = userArray.filter(user => !exclusionSet.has(user.userId));
    //   const randomUserIndex = Math.floor(Math.random() * availableUsers.length);
    //   const randomUser = availableUsers[randomUserIndex];
    //   return randomUser;
    // };

    // Get a random user from the top 60% array
    const randomUserIndex = Math.floor(
      Math.random() * topUsersByPercentage[0].length
    );
    const randomUser60 = topUsersByPercentage[0][randomUserIndex];

    // Get a random user from the top 60% array
    // const randomUser60 = getRandomUser(topUsersByPercentage[0], selectedUserIds);

    // Check if the randomly selected user is in the top 30% or top 5%
    const isInTop30Percent = topUsersByPercentage[1].some(
      (user) => user.userId === randomUser60.userId
    );
    const isInTop5Percent = topUsersByPercentage[2].some(
      (user) => user.userId === randomUser60.userId
    );

    // Add the selected user to the set to avoid repetition
    // selectedUserIds.add(randomUser60.userId);

    // Get user details based on the randomly selected user's ID
    const userDetails = await USER.findById(randomUser60.userId).select(
      "name year branch photo _id about verify"
    );

    return res.json({
      userDetails,
      isInTop30Percent,
      isInTop5Percent,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error here" });
  }
});

// router.put("/connectRequest", requireLogin, (req, res) => {
//   const userId = req.user._id;
//   const { id } = req.body;

//   if (!id) {
//     return res.status(422).json({ error: "Invalid data" });
//   }

//   USER.findById(userId)
//     .then((user) => {
//       if (!user) {
//         return res.status(404).json({ error: "User not found" });
//       }

//       const currentDate = new Date();
//       const lastRequestDate = new Date(user.lastConnectionRequestDate);

//       if (
//         currentDate.getDate() !== lastRequestDate.getDate() ||
//         currentDate.getMonth() !== lastRequestDate.getMonth() ||
//         currentDate.getFullYear() !== lastRequestDate.getFullYear()
//       ) {
//         // If it's a new day, reset the dailyConnectionRequests count
//         user.dailyConnectionRequests = 0;
//       }

//       // Check if the dailyConnectionRequests limit has been reached
//       if (user.dailyConnectionRequests >= 2) {
//         return res
//           .status(400)
//           .json({ error: "Daily connection requests limit reached" });
//       }

//       if (!user.connectRequest.includes(id)) {
//         user.connectRequest.push(id);
//         // user.request.push(id);
//         user.dailyConnectionRequests += 1;

//         user.lastConnectionRequestDate = currentDate;
//       }

//       return user.save();
//     })
//     .then(() => {
//       res.json({ message: "Answers saved successfully" });
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({ error: "Internal Server Error" });
//     });
// });

router.get("/connectionlimit", requireLogin, (req, res) => {
  const userId = req.user._id;

  USER.findById(userId)
    .select("dailyConnectionRequests lastConnectionRequestDate")
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const currentDate = new Date();
      const lastRequestDate = new Date(user.lastConnectionRequestDate);

      if (
        currentDate.getDate() !== lastRequestDate.getDate() ||
        currentDate.getMonth() !== lastRequestDate.getMonth() ||
        currentDate.getFullYear() !== lastRequestDate.getFullYear()
      ) {
        // If it's a new day, reset the dailyConnectionRequests count
        user.dailyConnectionRequests = 0;
        user.lastConnectionRequestDate = currentDate; // Update last connection request date
      }

      return user.save();
    })
    .then((updatedUser) => {
      // Send the updated user information in the response
      res.json({
        dailyConnectionRequests: updatedUser.dailyConnectionRequests,
        // lastConnectionRequestDate: updatedUser.lastConnectionRequestDate,
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    });
});

router.put("/limit", requireLogin, (req, res) => {
  const userId = req.user._id;

  USER.findById(userId)
    .select("dailyConnectionRequests")
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      user.dailyConnectionRequests += 1;
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

// router.put("/request", requireLogin, (req, res) => {
//   const userId = req.user._id;
//   const { id } = req.body;

//   USER.findById(id)
//   .select("request vibes")
//   .then((user) => {
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     user.request.push(userId)
//     user.vibes += 1;
//     return user.save();
//   })
//   .then(() => {
//     res.json({ message: "Answers saved successfully" });
//   })
//   .catch((err) => {
//     console.log(err);
//     res.status(500).json({ error: "Internal Server Error" });
//   });
// })

router.put("/request", requireLogin, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.body;

    // Find the user by ID and update request, vibes, and isNotification
    const user = await USER.findByIdAndUpdate(
      id,
      {
        $push: { request: userId },
        $inc: { vibes: 1 },
        $set: { isNotification: true }, // Set isNotification to true
      },
      { new: true } // Return the updated document
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Request, vibes, and isNotification updated successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/request", requireLogin, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await USER.findById(userId).select("request");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Extract request IDs from the user document
    const requestIds = user.request;

    // If there are no requests, return an empty array
    if (!requestIds || requestIds.length === 0) {
      return res.json([]);
    }

    // Fetch user details for each request ID
    const userDetails = await USER.find({ _id: { $in: requestIds } })
      .select("name photo branch verify year")
      .exec();

    res.json(userDetails);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/removerequest", requireLogin, (req, res) => {
  const userId = req.user._id;
  const { id } = req.body;

  USER.findByIdAndUpdate(
    userId,
    {
      $pull: { request: id },
      $set: { isNotification: false },
    },
    { new: true }
  )
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ message: "Request removed successfully" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

router.put("/friend", requireLogin, (req, res) => {
  const userId = req.user._id;
  const { id } = req.body;

  USER.findById(userId)
    .select("friend")
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      user.friend.push(id);
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

router.get("/isnotification", requireLogin, (req, res) => {
  const userId = req.user._id;

  USER.findById(userId)
    .select("isNotification")
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

// Endpoint to get top 10 users based on vibes
router.get("/top10users-female", async (req, res) => {
  try {
    // Fetch all users and sort them based on vibes
    // const allUsers = await USER.find().select("name vibes gender").sort({ vibes: -1 });
    const femaleUsers = await USER.find({ gender: "female", verify: true })
      .select("name vibes gender branch year photo verify")
      .sort({ vibes: -1 });

    // Get the top 10 users
    const top10Users = femaleUsers.slice(0, 10);

    res.json(top10Users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/top10users-male", async (req, res) => {
  try {
    // Fetch all users and sort them based on vibes
    // const allUsers = await USER.find().select("name vibes gender").sort({ vibes: -1 });
    const femaleUsers = await USER.find({ gender: "male", verify: true })
      .select("name verify vibes gender branch year photo")
      .sort({ vibes: -1 });

    // Get the top 10 users
    const top10Users = femaleUsers.slice(0, 10);

    res.json(top10Users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/top-female", async (req, res) => {
  try {
    // Fetch all users and sort them based on vibes
    // const allUsers = await USER.find().select("name vibes gender").sort({ vibes: -1 });
    const femaleUsers = await USER.find({ gender: "female" })
      .select("name vibes gender branch year photo verify")
      .sort({ vibes: -1 });

    // Get the top 10 users
    const top10Users = femaleUsers.slice(0, 10);

    res.json(top10Users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
