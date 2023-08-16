const mongoose = require("mongoose");

const NGODetailsSchema = new mongoose.Schema({
    ngoName: {
        type: String,
        required: true,
    },
    registrationNumber: {
        type: String,
        required: false,
    },
    typeOfNGO: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("ngodetails", NGODetailsSchema);
