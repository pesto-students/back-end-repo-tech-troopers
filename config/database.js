const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = async () => {
    try {
        console.log({MONGOURI:process.env.MONGOURI});
        await mongoose.connect(process.env.MONGOURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).con;
        console.log("MongoDB Connnected...");
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
