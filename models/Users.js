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
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["USER","NGO_USER"]
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt :{
        type: Date,
        default: Date.now
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "address",
        required: false
    },
    resources: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "userquestion",
            required: false
        },
    ],
});

module.exports = mongoose.model("user", UserSchema);
