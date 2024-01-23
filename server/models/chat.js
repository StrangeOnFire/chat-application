import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    participants: [{type: mongoose.Schema.Types.ObjectId, ref: "users"}],
    chatRoom: {type: String,require: true ,unique: true},
    messages: [{
        content:{type: String},
        date: {type: String},
        senderID: {type: mongoose.Schema.Types.ObjectId, ref: "users"},
        recieverID: {type: mongoose.Schema.Types.ObjectId, ref: "users"}
    }]
})

export const Chatmodel = mongoose.model("chats",chatSchema)