const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: Number,
        required: false,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["USER", "NGO_USER"]
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
    ngoDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ngodetails",
        required: false
    },
    resources: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "resource",
            required: false
        },
    ],
    events: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "event",
            required: false
        },
    ],
    causes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "cause",
            required: false
        },
    ],
    voluntary: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "voluntary",
            required: false
        }
    ]
});

module.exports = mongoose.model("user", UserSchema);
