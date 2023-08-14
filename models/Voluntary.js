const mongoose = require("mongoose");

const VoluntarySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: ["ACTIVE", "IN_ACTIVE", "ACCEPTED"]
    },
    timeCommitment: {
        type: String,
        required: false
    },
    ageGroup: [{
        type: Number,
        required: false
    }],
    interestedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: false
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    ngoDetailId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ngodetails",
        required: false
    },
    userIdNGO: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: false
    }
});
module.exports = mongoose.model("voluntary", VoluntarySchema);
