const { v2: cloudinary } = require("cloudinary");
const crypto = require("crypto");
const fs = require("fs");
require("dotenv").config();

cloudinary.config({
    cloud_name: "dffofqaks",
    api_key: "979397193231618",
    api_secret: "HKM9d45UVDzUFwco-R3RdOyzPHY"
});

const saveImage = async (imagePath) => {
    try {
        const uniqueId = crypto.randomBytes(16).toString("hex");
        const uploadResult = await cloudinary.uploader.upload(imagePath, { public_id: uniqueId });
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error(err)
                return
            }
        });
        return uploadResult.secure_url;
    } catch (err) {
        console.log(err);
    }
}

module.exports = { saveImage };