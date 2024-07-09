const { json } = require("express");
const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");
// const express = require('express');
// const multer = require('multer');
// const app = express();

//update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
});

//get a user by ID
// router.get("/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).json("User not found");
//     }
//     const { password, updatedAt, ...other } = user._doc;
//     res.status(200).json(other);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

//get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  // console.log(username)
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
      // console.log(user)
    const { password, updatedAt, ...other } = user?._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
    console.log(err)
  }
});

//get a user with search
// router.get("/search", async (req, res) => {
//   const username = req.query.username;
//   try {
//     const user = await User.findOne({ username: username });
//     if (!user) {
//       res.status(404).json("User not found");
//     } else {
//       const { password, updatedAt, ...other } = user._doc;
//       res.status(200).json(other);
//     }
//   } catch (err) {
//     res.status(500).json(err);
//     console.log(err)
//   }
// });

//get a user wheather friend or not
// Search for users
router.get("/search", async (req, res) => {
  console.log(JSON.stringify(req.query.username) + "line no 82")
  const username = req.query.username;
  if(!username){
    return res.json("User name is empty")
  }
  try {
    const users = await User.find({ username: { $regex: username, $options: 'i' } });
    // console.log(userData)
    const userData = users.map((user) => {
      const { _id, username, profilePicture } = user;
      return { _id, username, profilePicture };
    });
    res.status(200).json(userData);
  } catch (err) {
    res.status(500).json(err);
    console.log(err)
  }
});

//get friends
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList)
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user
  
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      // console.log(user, currentUser)
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        if (res.status(200).json("user has been followed")){
          console.log("Already following")
        }
        
      } else {
        res.status(403).json("you already follow this user");
        // alert("User already following")
        // console.log("Already following")
      }
    } catch (err) {
      res.status(500).json(err);
      console.log(err)
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});

//unfollow a user

router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
      console.log(err)
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});

module.exports = router;
