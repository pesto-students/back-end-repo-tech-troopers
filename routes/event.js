var express = require("express");
const router = express.Router();
const User = require("../models/Users");
const Address = require("../models/Address");
const Event =  require("../models/Events");
const { BadRequest } = require("../utils/errors");
const loginMiddleware = require("../middlewares/auth");
const {
    checkForInvalid,
} = require("../utils/util");
const { ACTIVE, IN_ACTIVE, NGO_USER } = require("../utils/constants");
router.post('/', loginMiddleware, async(req, res,next) => {
    try {
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
    const savedAddress = await Address.create(address);

    const newEvent = {
        title,
        description,
        status : status == ACTIVE ? ACTIVE : IN_ACTIVE,
        organizedBy,
        ngoName,
        date: new Date(date),
        address : savedAddress._id
    }
    const savedEvent =  await Event.create(newEvent);
    await User.findByIdAndUpdate(req.user._id,{
        $push: { events: savedEvent._id }
    });
    return res.status(201).json(savedEvent)
} catch(err) {
    next(err)
}
})
module.exports = router;
