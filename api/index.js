const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const user = require("./models/User");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const ws = require("ws");
const Message = require("./models/Message");

app.use(express.json());
app.use(cookieParser());
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
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err;
      const { id, username } = userData;
      res.json(userData);
    });
  } else {
    res.status(401).json("not authorized");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await user.findOne({ username });
  if (foundUser) {
    const match = bcrypt.compareSync(password, foundUser.password);
    if (match) {
      jwt.sign(
        { userId: foundUser._id, username },
        jwtSecret,
        {},
        (err, token) => {
          if (err) {
            res.status(500).json({ error: "Error signing JWT token" });
          } else {
            res
              .cookie("token", token, { sameSite: "none", secure: true })
              .status(200)
              .json({ id: foundUser._id, username: username });
          }
        }
      );
    } else {
      res.status(401).json("wrong password");
    }
  } else {
    res.status(401).json("user not found");
  }
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hash = bcrypt.hashSync(password, Salt);
    const newuser = await user.create({ username, email, password: hash });
    jwt.sign({ userId: newuser._id, username }, jwtSecret, {}, (err, token) => {
      if (err) {
        res.status(500).json({ error: "Error signing JWT token" });
      } else {
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(200)
          .json({ id: newuser._id, username: username });
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Error creating user" });
  }
});

const server = app.listen(4000);

const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies
      .split(";")
      .find((str) => str.startsWith(str, "token ="));
    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
          // console.log(userData)
        });
      }
    }
  }

  // connection.send("hello");
  [...wss.clients].forEach((client) => {
    client.send(
      JSON.stringify({
        online: [...wss.clients].map((c) => ({
          userId: c.userId,
          username: c.username,
        })),
      })
    );
  });

  //sending message
  connection.on("message", async (message) => {
    // console.log(isBinary? message.toString() : message);
    const messageData = JSON.parse(message.toString());
    const { recipientId, text } = messageData;
    if (recipientId && text) {
      const messagedoc = await Message.create({
        sender: connection.userId,
        receiver: recipientId,
        text,
      });
      [...wss.clients]
        .filter((c) => c.userId === recipientId)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              senderId: connection.userId,
              senderName: connection.username,
              id: messagedoc._id,
            })
          )
        );
    }
    // console.log(messageData);
  });
});
