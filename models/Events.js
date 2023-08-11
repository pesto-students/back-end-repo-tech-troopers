const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    title: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: ["ACTIVE", "IN_ACTIVE"]
    },
    organizedBy: {
        type: String,
        required: false
    },
    ngoName: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "address",
        required: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: false
    },
    imageURL: {
        type: String,
        required: false,
    },
});
module.exports = mongoose.model("event", UserSchema);
