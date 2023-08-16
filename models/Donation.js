const mongoose = require("mongoose");

const DonationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: false,
    },
    phone: {
        type: String,
        required: false,
    },
    amount: {
        type: Number,
        required: false,
    },
    transactionId: {
        type: String,
        require: false
    },
    causeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cause",
        required: false
    }
});

module.exports = mongoose.model("donation", DonationSchema);
