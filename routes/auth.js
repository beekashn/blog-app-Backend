const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json("User not found");
    }

    const match = bcrypt.compareSync(req.body.password, user.password);
    if (!match) {
      return res.status(401).json("Wrong Credentials!");
    }

    const accessToken = jwt.sign(
      { _id: user._id, username: user.username, email: user.email },
      process.env.SECRET,
      {
        expiresIn: "3d",
      }
    );
    const { password, ...info } = user._doc;

    res.cookie("token", accessToken).status(200).json(info);
  } catch (error) {
    res.status(500).json(error);
  }
});

//LogOut
router.get("/logout", async (req, res) => {
  try {
    res
      .clearCookie("token", { sameSite: "none", secure: true })
      .status(200)
      .json("Logged out successfully");
  } catch (error) {
    res.status(500).json(error);
  }
});

//Refetch User
router.get("/refetch", (req, res) => {
  const token = req.cookies.token;
  jwt.verify(token, process.env.SECRET, {}, async (error, data) => {
    if (error) {
      return res.status(404).json(error);
    }
    res.status(200).json(data);
  });
});

module.exports = router;
