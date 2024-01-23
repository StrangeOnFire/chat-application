import express from "express";
import { Chatmodel } from "../models/chat.js";
import { Usermodel } from "../models/user.js";

const router = express.Router();

router.post("/:id", async (req, res) => {
  const senderID = req.body.id;
  const recieverID = req.params.id;
  const sender = await Usermodel.findById(senderID);
  const reciver = await Usermodel.findById(recieverID);
  const roomName = sender.username + reciver.username;
  const chat = await Chatmodel.findOne({
    $or: [
      { participants: [sender, reciver] },
      { participants: [reciver, sender] },
    ],
  });
  if (chat) {
    return res.json({ chat, recivername: reciver.username, result: "found" });
  }
  const newChat = new Chatmodel({
    participants: [sender, reciver],
    chatRoom: roomName,
    messages: [
      // {
      //   content: "",
      //   date: "",
      //   senderID,
      //   recieverID,
      // },
    ],
  });
  const response = await newChat.save();
  res.json({
    chat: response,
    recivername: reciver.username,
    result: "notfound",
  });
});

export { router as chatRouter };
