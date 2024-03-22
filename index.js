const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();
const { connection } = require("./config/db");
const { UserModel } = require("./model/Usermodel");
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send({ msg: "welcome to home" });
});

app.post("/signup", async (req, res) => {
  let { name, email, password } = req.body;

  // Remove leading and trailing spaces from email and password
  email = email.trim();
  password = password.trim();

  // Check if name is empty after removing leading and trailing spaces
  if (!name.trim()) {
    return res.status(400).send({ msg: "Name cannot be empty!" });
  }

  // Check if email is empty or contains blank spaces
  if (!email || /\s/.test(email)) {
    return res.status(400).send({ msg: "Invalid email address!" });
  }

  // Check if password is empty
  if (!password) {
    return res.status(400).send({ msg: "Password cannot be empty!" });
  }

  // Check if email is already registered
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return res.status(409).send({ msg: "User already registered!" });
  }

  try {
    // Hash password asynchronously
    const hash = await bcrypt.hash(password, 10); // 10 is the saltRounds
    await UserModel.create({ name, email, password: hash });
    return res.status(201).send({ msg: "User created successfully!" });
  } catch (error) {
    return res.status(500).send({ msg: "Something went wrong!" });
  }
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.send({ msg: "Email not found." });
  }
  const hash = user.password;
  // Compare passwords asynchronously
  try {
    const result = await bcrypt.compare(password, hash);
    if (result) {
      let token = jwt.sign({ userID: user._id }, "masai");
      return res.send({ msg: "login successful ", token: token });
    } else {
      return res.send({ msg: "please enter valid password " });
    }
  } catch (error) {
    return res.status(500).send({ msg: "Something went wrong!" });
  }
});

const PORT = process.env._PORT || 8001;
app.listen(PORT, async () => {
  try {
    await connection;
    console.log(`Connected to DB!!`);
  } catch (error) {
    console.log(error);
    console.log("Not connected to DB!!");
  }
  console.log(`server is running port ${PORT} `);
});
