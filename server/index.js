import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import { UserRouter } from "./routes/Users.js";
import { chatRouter } from "./routes/Chat.js";
import { HomeRouter } from "./routes/Home.js";
import { Chatmodel } from "./models/chat.js";
import { Usermodel } from "./models/user.js";

// ----------------------------------------------------------------

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

// -----------Routes
app.use("/auth", UserRouter);
app.use("/chat", chatRouter);
app.use("/home", HomeRouter);

// connecting to database---
mongoose
  .connect(
    "mongodb+srv://ayush:U9yN1Jw4LmeiFGC6@chatapp.fggpo3l.mongodb.net/chatAppbyayush?retryWrites=true&w=majority"
  )
  .catch((err) => console.log(err));

// server listening----
server.listen(3001);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT"],
  },
});

app.get("/", (req, res) => {
  res.json({ hello: "Homepage" });
});

// socket.io events-------
io.on("connection", (socket) => {
  console.log("a user connected with: " + socket.id);

  // joining room & setting user status to online-----------------------
  socket.on("join_room", async (data) => {
    socket.join(data);
    const user = await Usermodel.findById(data).catch((err) => false);
    console.log(user.username, "user jioned", data);
    if (user) {
      user.isOnline = true;
      user.save();
      socket.broadcast.emit("online-offline", user);
    }
  });

  // setting user status to offline-----------------------
  socket.on("offline-now", async (data) => {
    const user = await Usermodel.findById(data.id);
    user.isOnline = false;
    user.lastSeen = data.lastSeen;
    user.save();
    socket.broadcast.emit("online-offline", user);
  });

  // sending message-------------------
  socket.on("send-message", async (data) => {
    const chatObj = await Chatmodel.findById(data.chatID);
    chatObj.messages.push(data.newMessage);
    chatObj.save();
    socket.broadcast.to(data.chatRoom).emit("get-message", data.newMessage);
  });

  // is Typing??-------------------
  socket.on("isTyping", (data) => {
    socket.broadcast.to(data.chatRoom).emit("yesTyping", "");
  });

  // sending notification-----------------------
  socket.on("send-notification", async (data) => {
    const sender = await Usermodel.findById(data.senderID);
    const receiver = await Usermodel.findById(data.receiverID);
    if (!receiver.notification.includes(sender._id)) {
      receiver.notification.push(sender);
      receiver.save();
      socket.broadcast.to(data.receiverID).emit("get-notification", sender);
    }
  });

  // accepting friend request------------------
  socket.on("accept-req", async (data) => {
    const sender = await Usermodel.findById(data.senderID);
    const receiver = await Usermodel.findById(data.receiverID);
    const index = sender.notification.indexOf(receiver._id);
    if (index > -1) {
      sender.notification.splice(index, 1);
    }
    receiver.friends.push(sender);
    sender.friends.push(receiver);
    receiver.save();
    sender.save();
    socket.broadcast.to(data.receiverID).emit("req-accepted", sender);
  });

  // rejecting friend request--------------------
  socket.on("reject-req", async (data) => {
    const sender = await Usermodel.findById(data.senderID);
    const receiver = await Usermodel.findById(data.receiverID);
    const index = sender.notification.indexOf(receiver._id);
    if (index > -1) {
      sender.notification.splice(index, 1);
    }
    sender.save();
  });

  // searching the users
  socket.on("searchUsers", async (data) => {
    const users = await Usermodel.find({ username: { $regex: data.username } });
    if (users) {
      socket.emit("searchedUsers", users);
    }
  });

  // Listen for "leave_room" event
  socket.on("leave_room", async (room) => {
    // Leave the specified room
    socket.leave(room);
  });
});
