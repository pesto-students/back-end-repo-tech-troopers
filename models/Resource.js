const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: false,
    },
    imageURL: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: ["ACTIVE", "IN_ACTIVE", "APPROVED"]
    },
    phoneNumber: {
        type: Number,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
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
    }
});
module.exports = mongoose.model("resource", UserSchema);
