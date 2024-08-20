const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const ws = require("ws");
const Message = require("./models/message");

const User = require("./models/model");
const { default: nodemon } = require("nodemon");
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MonogUrl);
    console.log("Connected to DB");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
connectDB();

const jwtsecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    origin: process.env.clientURL,
  })
);
app.get("/test", (req, res) => {
  res.json("Hello World!");
});

app.get("/profile", (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtsecret, {}, (err, userData) => {
      if (err) throw err;
      // const { id, usernmae } = userData;
      res.json(userData);
    });
  } else {
    res.status(401).json("Unauthorized");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findOne({ username });
  if (foundUser) {
    const match = bcrypt.compareSync(password, foundUser.password);
    if (match) {
      jwt.sign(
        { userId: foundUser._id, username },
        jwtsecret,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json({
            id: foundUser._id,
            username: username,
          });
        }
      );
    }
  }
});



app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const createdUser = await User.create({
      username: shSynusername,
      password: bcrypt.hac(password, bcryptSalt),
    });
    jwt.sign(
      { userId: createdUser._id, username },
      jwtsecret,
      {},
      (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(201)
          .json({
            id: createdUser._id,
            username,
          });
      }
    );
  } catch (err) {
    if (err) throw err;
    res.status(500).json("Error");
  }
});

const server = app.listen(3000, () => { 
  console.log("Server said hello world");
});

const wss = new ws.WebSocketServer({server})
wss.on("connection", (connection,req) => {
  // console.log("connected");
  const cookie = req.headers.cookie;
  if (cookie) {
    const tokenCookieString = cookie.split(';').find(str => str.startsWith('token='));
    if (tokenCookieString) {
      const token = tokenCookieString.split('=')[1];
      if (token) {
        jwt.verify(token, jwtsecret, {}, (err, userData) => {
          if (err) throw err;
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
          
        })
      }
    }
  }
  
 [...wss.clients].forEach(client => {
   client.send(
     JSON.stringify({
       online: [...wss.clients].map((c) => ({
         userId: c.userId,
         username: c.username,
       })),
     })
   );
 })

connection.on("message", async(message) => {
  const messageData = JSON.parse(message.toString()); 
  // console.log(message);
  const {recepient,text} = messageData;
  if(recepient && text){
     const messageDoc =  await  Message.create({sender: connection.userId, recepient, text});
    [...wss.clients].filter(c=> c.userId === recepient).forEach(c => c.send(JSON.stringify({
      text , 
      sender : connection.userId, 
      recepient,
      id: messageDoc._id
    })))
  }
});
});

