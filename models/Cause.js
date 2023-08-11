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
        required: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: false
    },
});

module.exports = mongoose.model("cause", CausesSchema);
