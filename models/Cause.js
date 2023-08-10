const mongoose = require("mongoose");

const CausesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
    },
    imageUrl: {
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
    }
});

module.exports = mongoose.model("cause", CausesSchema);
