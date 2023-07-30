var express = require("express");
var router = express.Router();
const User = require("../models/Users");
const Resource = require("../models/Resource");
const Address = require("../models/Address");
const { BadRequest } = require("../utils/errors");
const loginMiddleware = require("../middlewares/auth");
const { saveImage } = require("../config/cloudinary");
const { phoneNumberValidation, checkForInvalid, emailValidation } = require("../utils/util");
const multer = require("multer");
require("dotenv").config();

const upload = multer({ dest: "uploads/" });
const { ACTIVE } = require("../utils/constants");
router.post('/', loginMiddleware,async (req, res) => {
    const { category, imagePath, description, status, phoneNumber, email, address } = req.body;
    if(!Boolean(imagePath)) {
        throw new BadRequest("Image path is required");
    }
    if (!Boolean(description)) {
        throw new BadRequest("Description is required");
    }
    if (!Boolean(phoneNumber)) {
        throw new BadRequest("Phone Number is required");
    }
    if (!phoneNumberValidation(phoneNumber)) {
        throw new BadRequest("Enter valid phone number");
    }
    if (!Boolean(email)) {
        throw new BadRequest("Email is required");
    }
    if (!emailValidation(email)) {
        throw new BadRequest("Enter valid email");
    }
    if (address) {
        const { addressLine1, city, state, pinCode } = address;

        if (checkForInvalid(addressLine1) || checkForInvalid(city) || checkForInvalid(state) || checkForInvalid(pinCode)) {

            if (checkForInvalid(addressLine1)) {
                throw new BadRequest(`Address is required.`)
            }

            if (checkForInvalid(city)) {
                throw new BadRequest(`City is required.`)
            }

            if (checkForInvalid(state)) {
                throw new BadRequest(`State is required.`)
            }

            if (checkForInvalid(pinCode)) {
                throw new BadRequest(`Pincode is required.`)
            }
        }
    }
    const savedAddress = await Address.create(address);
    const imageId = await saveImage(imagePath);
    const resource = {
        category,
        description,
        status: ACTIVE,
        phoneNumber,
        email,
        userId: req.user._id,
        address: savedAddress._id,
        imageId
    }
    
    const savedResource = await Resource.create(resource); 
    await User.findByIdAndUpdate(req.user._id, {"$push": {resources: savedResource._id}});
    return res.status(201).json(savedResource);
});

router.post("/upload",loginMiddleware, upload.array("image"),async (req,res)=>{
    try {
    return res.status(201).json({path: req.files[0].path});
    } catch(err) {
        console.log(err);
    }
})

// list api


module.exports = router;
