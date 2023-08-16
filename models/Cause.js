const mongoose = require("mongoose");

const CausesSchema = new mongoose.Schema({
    name: {
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
    amount: {
        type: Number,
        required: false,
        default:0
    },
    calculatedAmount: {
        type: Number,
        required: false,
        default: 0
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: false
    },
});

module.exports = mongoose.model("cause", CausesSchema);
