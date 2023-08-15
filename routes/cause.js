const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const Cause = require("../models/Cause");
const Donation = require("../models/Donation");
const { BadRequest } = require("../utils/errors");
const loginMiddleware = require("../middlewares/auth");
const { saveImage } = require("../config/cloudinary");
const multer = require("multer");
const {
    checkForInvalid,
    phoneNumberValidation,
    emailValidation
} = require("../utils/util");
const upload = multer({ dest: "uploads/" });

const { ACTIVE, IN_ACTIVE, NGO_USER, USER } = require("../utils/constants");

router.post('/admin', loginMiddleware, async (req, res, next) => {
    try {
        const {
            name,
            description,
            amount,
            imageURL,
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

        
        // const imageURL = imagePath ? await saveImage(imagePath) : null;
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

router.get("/admin", loginMiddleware, async (req, res, next) => {
    try {
        if (req.user.role !== NGO_USER) {
            throw new BadRequest("You are not allowed");
        }
        let page = req.query.page;
        let limit = req.query.limit;

        if (!page) {
            page = 1;
        }
        if (!limit) {
            limit = 10;
        }
        const causeList = await Cause.find({ userId: req.user._id  })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        const totalCount = await Cause.countDocuments();
        return res.status(200).json({
            causeList,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    } catch (err) {
        next(err);
    }
});

router.get("/", loginMiddleware, async (req, res, next) => {
    try {
        // if (req.user.role !== USER ) {
        //     throw new BadRequest("You are not allowed");
        // }
        let page = req.query.page;
        let limit = req.query.limit;

        if (!page) {
            page = 1;
        }
        if (!limit) {
            limit = 10;
        }
        const causeList = await Cause.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        const totalCount = await Cause.countDocuments();
        return res.status(200).json({
            causeList,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    } catch (err) {
        next(err);
    }
});

router.put("/admin/:causeId", loginMiddleware, async (req, res, next) => {
    try {
        const {
            name,
            description,
            amount,
            imageURL
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

        let causeData = await Cause.findById(req.params.causeId);
        if (!causeData) {
            throw new BadRequest("Cause not found");
        }
    
        causeData.name = name;
        causeData.description = description;
        causeData.amount = amount;
        causeData.imageURL = imageURL;
        // if (imagePath) {
        //     causeData.imageURL = await saveImage(imagePath);
        // }
        await causeData.save(); 

        return res.status(200).json({ message: "Successfully update a cause" });
    } catch (err) {
        next(err);
    }
});

router.delete("/admin/:causeId", loginMiddleware, async(req, res, next)=>{
    try {
        if (req.user.role !== NGO_USER) {
            throw new BadRequest("You are not allowed");
        }
        await Cause.findByIdAndDelete(req.params.causeId);
        await User.findByIdAndUpdate(req.user._id, {$pull:{"causes":req.params.causeId}});
        return res.status(200).json("Cause deleted successfully");
    } catch(err) {
        next(err)
    }
});

router.post("/donation/:causerId", async(req, res, next)=>{
    try {
        let { name,
            email,
            phone,
            amount
        } = req.body;
        if(phone && phoneNumberValidation(phone)) {
            throw new BadRequest("Invalid phone number");
        }
            if(email && !emailValidation(email)) {
            throw new BadRequest("Email is not valid");
        }
        await Donation.create({name, email,phone,amount,causeId:req.params.causerId });
        return res.status(200).json({message: "Successfull donation made"});
    }catch(err) {
        next(err);
    }
})
module.exports = router;
