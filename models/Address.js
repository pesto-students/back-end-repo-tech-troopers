const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
    addressLine1: {
        type: String,
        required: true,
    },
    addressLine2: {
        type: String,
        required: false,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    pinCode: {
        type: Number,
        require: true
    }
});

module.exports = mongoose.model("address", AddressSchema);
