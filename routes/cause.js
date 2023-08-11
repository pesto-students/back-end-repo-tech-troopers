const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const Cause = require("../models/Cause");
const { BadRequest } = require("../utils/errors");
const loginMiddleware = require("../middlewares/auth");
const { saveImage } = require("../config/cloudinary");
const multer = require("multer");
const {
    checkForInvalid,
} = require("../utils/util");
const upload = multer({ dest: "uploads/" });

const { ACTIVE, IN_ACTIVE, NGO_USER, USER } = require("../utils/constants");

router.post('/admin', loginMiddleware, async (req, res, next) => {
    try {
        const {
            name,
            description,
            amount,
            imagePath,
        } = req.body;

        if (req.user.role !== NGO_USER) {
            throw new BadRequest("You are not allowed");
        }
        if (!Boolean(name)) {
            throw new BadRequest("Name is required");
        }
        if (!Boolean(description)) {
            throw new BadRequest("Description is required");
        }
        if (!Boolean(amount)) {
            throw new BadRequest("Amount is required");
        }

        
        const imageURL = imagePath ? await saveImage(imagePath) : null;
        const newCause = {
            name,
            description,
            amount,
            userId: req.user._id,
            imageURL: imageURL
        }
        const savedCause = await Cause.create(newCause);
        await User.findByIdAndUpdate(req.user._id, {
            $push: { causes: savedCause._id }
        });
        return res.status(201).json(savedCause);
    } catch (err) {
        next(err)
    }
});

module.exports = router;
