import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, require: true, unique: true },
  password: { type: String, require: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  notification: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  isOnline: Boolean,
  lastSeen: String
});

export const Usermodel = mongoose.model("users", userSchema);
