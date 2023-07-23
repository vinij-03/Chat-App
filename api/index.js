const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const user = require("./models/User");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

app.use(express.json());
app.use(cookieParser())
dotenv.config();
mongoose.connect(process.env.url);

const Salt = bcrypt.genSaltSync(10);

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
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err;
      const { id, username } = userData;
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

app.post('/login', async (req,res)=>{
  const {username , password} = req.body;
  const foundUser = await user.findOne({username});
  if(foundUser){
    const match = bcrypt.compareSync(password, foundUser.password);
    if(match){
      jwt.sign({ userId: newuser._id, username }, jwtSecret, {}, (err, token) => {
        if (err) {
          res.status(500).json({ error: "Error signing JWT token" });
        } else {
          res.cookie("token", token , {sameSite : 'none' , secure:true}).status(200).json({ id : foundUser._id , username : username});
        }
      });
    }
    else{
      res.status(401).json("wrong password")
    }
  }
  else{
    res.status(401).json("user not found")
  }
})

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hash = bcrypt.hashSync(password, Salt);
    const newuser = await user.create({ username, email, password:hash  });
    jwt.sign({ userId: newuser._id, username }, jwtSecret, {}, (err, token) => {
      if (err) {
        res.status(500).json({ error: "Error signing JWT token" });
      } else {
        res.cookie("token", token , {sameSite : 'none' , secure:true}).status(200).json({ id : newuser._id , username : username});
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Error creating user" });
  }
});

app.listen(4000);
