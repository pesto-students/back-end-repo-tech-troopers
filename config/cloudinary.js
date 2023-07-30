const { v2: cloudinary } = require("cloudinary");
const crypto = require("crypto");
const fs = require("fs");
require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const saveImage = async (imagePath) => {
    try {
        const uniqueId = crypto.randomBytes(16).toString("hex");
        await cloudinary.uploader.upload(imagePath, { public_id: uniqueId });
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error(err)
                return
            }});
        return uniqueId;
    } catch (err) {
        console.log(err);
    }
}

module.exports = { saveImage };