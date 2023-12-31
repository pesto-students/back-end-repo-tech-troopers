const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const Address = require("../models/Address");
const Event = require("../models/Events");
const { BadRequest } = require("../utils/errors");
const loginMiddleware = require("../middlewares/auth");
const { saveImage } = require("../config/cloudinary");
const multer = require("multer");
const {
    checkForInvalid,
} = require("../utils/util");
const upload = multer({ dest: "uploads/" });

const { ACTIVE, IN_ACTIVE, NGO_USER, USER } = require("../utils/constants");

router.get("/:eventId", loginMiddleware, async (req, res, next) => {
    try {
        // if (req.user.role !== USER) {
        //     throw new BadRequest("You are not allowed");
        // }
        const eventData = await Event.findById(req.params.eventId)
            .populate("address")
            .exec();
        return res.status(200).json({
            eventData,
        });
    } catch (err) {
        next(err);
    }
});

router.post('/admin', loginMiddleware, async (req, res, next) => {
    try {
        const {
            title,
            description,
            status,
            organizedBy,
            ngoName,
            date,
            address,
            imagePath,
        } = req.body;

        if (req.user.role !== NGO_USER) {
            throw new BadRequest("You are not allowed");
        }
        if (!Boolean(title)) {
            throw new BadRequest("Title is required");
        }
        if (!Boolean(description)) {
            throw new BadRequest("Description is required");
        }
        if (!Boolean(status)) {
            throw new BadRequest("Status is required");
        }
        if (!Boolean(organizedBy)) {
            throw new BadRequest("Organized by is required");
        }
        if (!Boolean(ngoName)) {
            throw new BadRequest("NGO name is required");
        }
        if (!Boolean(date)) {
            throw new BadRequest("Date is required");
        }
        const { addressLine1, city, state, pinCode } = address;

        if (
            checkForInvalid(addressLine1) ||
            checkForInvalid(city) ||
            checkForInvalid(state) ||
            checkForInvalid(pinCode)
        ) {
            if (checkForInvalid(addressLine1)) {
                throw new BadRequest(`Address is required.`);
            }

            if (checkForInvalid(city)) {
                throw new BadRequest(`City is required.`);
            }

            if (checkForInvalid(state)) {
                throw new BadRequest(`State is required.`);
            }

            if (checkForInvalid(pinCode)) {
                throw new BadRequest(`Pincode is required.`);
            }
        }
        const savedAddress = await Address.create(address);
        // let imageURL = null;
        // if (imagePath) {
        //     imageURL = await saveImage(imagePath);
        // }
        const newEvent = {
            title,
            description,
            status: status == ACTIVE ? ACTIVE : IN_ACTIVE,
            organizedBy,
            ngoName,
            date: new Date(date),
            address: savedAddress._id,
            userId: req.user._id,
            imageURL: imagePath
        }
        const savedEvent = await Event.create(newEvent);
        await User.findByIdAndUpdate(req.user._id, {
            $push: { events: savedEvent._id }
        });
        return res.status(201).json(savedEvent)
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
        const eventList = await Event.find({userId: req.user._id})
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate("address")
            .exec();
        const totalCount = await Event.countDocuments();
        return res.status(200).json({
            eventList,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    } catch (err) {
        next(err);
    }
});

router.get("/", loginMiddleware, async (req, res, next) => {
    try {
        // if (req.user.role !== USER) {
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
        const eventList = await Event.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate("address")
            .exec();
        const totalCount = await Event.countDocuments();
        return res.status(200).json({
            eventList,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    } catch (err) {
        next(err);
    }
});
router.put("/admin/:eventId",loginMiddleware,async(req,res,next)=>{
    try{
        const {
            title,
            description,
            status,
            organizedBy,
            ngoName,
            date,
            address
        } = req.body;

        if (req.user.role !== NGO_USER) {
            throw new BadRequest("You are not allowed");
        }
        if (!Boolean(title)) {
            throw new BadRequest("Title is required");
        }
        if (!Boolean(description)) {
            throw new BadRequest("Description is required");
        }
        if (!Boolean(status)) {
            throw new BadRequest("Status is required");
        }
        if (!Boolean(organizedBy)) {
            throw new BadRequest("Organized by is required");
        }
        if (!Boolean(ngoName)) {
            throw new BadRequest("NGO name is required");
        }
        if (!Boolean(date)) {
            throw new BadRequest("Date is required");
        }
        const { addressLine1, city, state, pinCode } = address;

        if (
            checkForInvalid(addressLine1) ||
            checkForInvalid(city) ||
            checkForInvalid(state) ||
            checkForInvalid(pinCode)
        ) {
            if (checkForInvalid(addressLine1)) {
                throw new BadRequest(`Address is required.`);
            }

            if (checkForInvalid(city)) {
                throw new BadRequest(`City is required.`);
            }

            if (checkForInvalid(state)) {
                throw new BadRequest(`State is required.`);
            }

            if (checkForInvalid(pinCode)) {
                throw new BadRequest(`Pincode is required.`);
            }
        }
        let eventData = await Event.findById(req.params.eventId);
        if (!eventData) {
            throw new BadRequest("Event not found");
        }
        const addressData = await Address.findById(eventData.address);
        addressData.addressLine1 = addressLine1;
        addressData.city = city;
        addressData.state = state;
        addressData.pinCode = pinCode;
        await addressData.save();

        eventData.title = title;
        eventData.description = description;
        eventData.status = (status == ACTIVE ? ACTIVE : IN_ACTIVE);
        eventData.organizedBy = organizedBy;
        eventData.ngoName = ngoName;   
        eventData.date= new Date(date);
        await eventData.save();

        return res.status(200).json({message: "Successfully update events"});
    }catch(err){
        next(err);
    }
});

router.post(
    "/admin/upload",
    loginMiddleware,
    upload.array("image"),
    async (req, res, next) => {
        try {
            if (req.user.role !== NGO_USER) {
                throw new BadRequest("You are not allowed");
            }
            return res.status(201).json({ path: req.files[0].path });
        } catch (err) {
            next(err);
        }
    }
);

router.delete("/admin/:eventId", loginMiddleware, async(req, res, next)=>{
    try {
        if (req.user.role !== NGO_USER) {
            throw new BadRequest("You are not allowed");
        }
        await Event.findByIdAndDelete(req.params.eventId);
        await User.findByIdAndUpdate(req.user._id, {$pull:{"events":req.params.eventId}});
        return res.status(200).json("Event deleted successfully");
    } catch(err) {
        next(err)
    }
})
module.exports = router;
