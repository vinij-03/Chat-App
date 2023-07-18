const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const user = require("./models/User");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();
mongoose.connect(process.env.url);

app.use(express.json());
app.use(cookieParser())
app.use(
  cors({
    credentials: true,
    origin: process.env.client_url,
  })
);

const jwtSecret = process.env.jwtSecret;
app.get("/test", (req, res) => {
  res.json("tested sucessfull");
});

app.get("/profile", (req, res) => {
  const token = req.cookies?.token;
  if(token){
    jwt.verify(token, jwtSecret, {}, (err, userDate) => {
      if (err) throw err;
      const { id, username } = userDate;
      res.json({
        id,
        username,
      });
    });
  }
  else{
    res.status(401).json("not authorized")
  }
})

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const newuser = await user.create({ username, email, password });
    jwt.sign({ userId: newuser._id, username }, jwtSecret, {}, (err, token) => {
      if (err) {
        res.status(500).json({ error: "Error signing JWT token" });
      } else {
        res.cookie("token", token , {sameSite : 'none' , secure:true}).status(200).json({ id : newuser._id});
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Error creating user" });
  }
});

app.listen(4000);
