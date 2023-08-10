var express = require("express");
var router = express.Router();
const User = require("../models/Users");
const Resource = require("../models/Resource");
const Address = require("../models/Address");
const { BadRequest } = require("../utils/errors");
const loginMiddleware = require("../middlewares/auth");
const { saveImage } = require("../config/cloudinary");
const {
    phoneNumberValidation,
    checkForInvalid,
    emailValidation,
} = require("../utils/util");
const multer = require("multer");
require("dotenv").config();

const upload = multer({ dest: "uploads/" });
const { ACTIVE, USER, IN_ACTIVE } = require("../utils/constants");
router.post("/", loginMiddleware, async (req, res) => {
    const {
        category,
        imagePath,
        description,
        phoneNumber,
        email,
        address,
    } = req.body;

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
        imageId,
    };

    const savedResource = await Resource.create(resource);
    await User.findByIdAndUpdate(req.user._id, {
        $push: { resources: savedResource._id },
    });
    return res.status(201).json(savedResource);
});

router.post(
    "/upload",
    loginMiddleware,
    upload.array("image"),
    async (req, res) => {
        try {
            return res.status(201).json({ path: req.files[0].path });
        } catch (err) {
            console.log(err);
        }
    }
);

router.get("/", loginMiddleware, async (req, res) => {
    try {
        let page = req.query.page;
        let limit = req.query.limit;
        let search = req.query.search;

        if (!page) {
            page = 1;
        }
        if (!limit) {
            limit = 10;
        }
        if (search) {
            const resourceList = await Resource.find({ $text: { $search: search } })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .populate("address")
                .exec();
            const totalCount = await Resource.countDocuments();
            return res.status(200).json({
                resourceList,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
            });
        }
        const resourceList = await Resource.find({ status: ACTIVE })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate("address")
            .exec();
        const totalCount = await Resource.countDocuments();

        return res.status(200).json({
            resourceList,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    } catch (err) {
        console.log(err);
    }
});

router.put("/:resourceId", loginMiddleware, async (req, res) => {
    const {
        category,
        imagePath,
        description,
        phoneNumber,
        email,
        address,
    } = req.body;
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
    }
    const resourceData = await Resource.findById(req.params.resourceId);
    const addressId = resourceData.address;
    await Address.findByIdAndUpdate(addressId, address);
    const resource = {
        category,
        description,
        phoneNumber,
        email,
    };
    if (Boolean(imagePath)) {
        const imageId = await saveImage(imagePath);
        resource["imageId"] = imageId;
    }
    const savedResource = await Resource.findByIdAndUpdate(resourceData._id, resource);
    return res.status(200).json(savedResource);
});

router.delete("/:resourceId", loginMiddleware, async (req, res) => {
    try {
        console.log(req.user);
        if (req.user.role !== USER) {
            throw new BadRequest("Not allowed to delete");
        }
        await Resource.findByIdAndUpdate(req.params.resourceId, { status: IN_ACTIVE });
        await User.findByIdAndUpdate(req.user._id, { $pull: { "resources": req.params.resourceId } });
        return res.status(200).json("Resource deleted successfully");
    } catch (err) {
        console.log(err);
    }
})

router.post(
    "/uploadFile",
    upload.array("image"),
    async (req, res) => {
        try {
            console.log("tst", req.files[0].path);
            await saveImage(req.files[0].path)
            return res.status(201).json({ message: "Image uploaded successfully" });
        } catch (err) {
            console.log(err);
        }
    }
);
module.exports = router;
