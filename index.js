const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const ws = require("ws");
const Message = require("./models/Message");
const fs = require("fs");

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
app.use('/uploads', express.static(__dirname + '/uploads'));

app.use(
  cors({
    credentials: true,
    origin: "https://chat-app-six-kappa-63.vercel.app",
  })
);
app.get("/test", (req, res) => {
  res.json("Hello World!");
});

async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtsecret, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject("no token");
    }
  });
}

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.get("/messages/:userId", async (req, res) => {
  const { userId } = req.params;
  // console.log(req.params);
  const userData =  await getUserDataFromRequest(req);
  const ourUserId = userData.userId;
  const messages = await Message.find({
    sender: { $in: [userId, ourUserId] },
    recipient: { $in: [userId, ourUserId] },
  }).sort({ createdAt: 1 });
  res.json(messages);
});

app.get("/people", async (req, res) => {
  const users = await User.find({}, {'_id': 1, 'username': 1});
  res.json(users);
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

app.post("/logout", (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0), // Set expiration to past date
    sameSite: "none",
    secure: true,
    httpOnly: true, // Helps prevent client-side access
  });
  res.status(200).json({ message: "Logged out successfully" });
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, bcryptSalt).json('ok'); // Await the hash
    const createdUser = await User.create({
      username: username,
      password: hashedPassword, // Save the hashed password
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



const server = app.listen(8000, () => {
  console.log("Server said hello world");
});

const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  // console.log("connected");
  const cookie = req.headers.cookie;
  if (cookie) {
    const tokenCookieString = cookie
      .split(";")
      .find((str) => str.startsWith("token="));
    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      if (token) {
        jwt.verify(token, jwtsecret, {}, (err, userData) => {
          if (err) throw err;
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

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

  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    let filename = null; // Define filename here
    const { recipient, text, file } = messageData;

    if (file) {
      const parts = file.name.split(".");
      const ext = parts[parts.length - 1];
      filename = Date.now() + "." + ext; // Assign to the outer filename variable
      const path = __dirname + "/uploads/" + filename;
      const bufferData = Buffer.from(file.data.split(',')[1], "base64");
      fs.writeFile(path, bufferData, () => {
        console.log("File saved at:", path);
      });
    }

    if (recipient && (text || file)) {
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
        file: file ? filename : null, // Use the updated filename
      });

      console.log("Filename:", filename); // Should now log the correct filename

      [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              recipient,
              file: filename ? filename : null,
              _id: messageDoc._id,
            })
          )
        );
    }
  });
});
