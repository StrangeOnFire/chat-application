import express from "express";
import { Usermodel } from "../models/user.js";

const router = express.Router();

router.get("/user/:id", async (req, res) => {
  const user = await Usermodel.findById(req.params.id)
    .populate({
      path: "friends",
      select: ["username", "isOnline", "lastSeen"],
    })
    .populate({
      path: "notification",
      select: "username",
    });

  if (!user) {
    return res.json({ message: "Can't find the user!" });
  }
  user.isOnline = true;
  user.save();
  res.json({ user });
});

// get all the users expect sender
router.get("/all/:id", async (req, res) => {
  try {
    const user = await Usermodel.find({
      _id: { $nin: req.params.id },
    });
    const myself = await Usermodel.findOne({ _id: req.params.id });
    const sendlist = myself.friends.concat(myself.notification);
    if (!myself) {
      return res.json({ message: "some error happened!" });
    }
    res.json({ user, sendlist });
  } catch (err) {
    console.log(err);
  }
});

export { router as HomeRouter };
