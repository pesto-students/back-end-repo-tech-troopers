const express = require("express");
const router = express.Router();
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
router.post("/", loginMiddleware, async (req, res, next) => {
    try {
        const {
            category,
            imageURL,
            description,
            phoneNumber,
            email,
            address,
            name
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
        // const imageId = await saveImage(imagePath);
        const resource = {
            category,
            description,
            status: ACTIVE,
            phoneNumber,
            email,
            userId: req.user._id,
            address: savedAddress._id,
            name,
            imageURL,
        };

        const savedResource = await Resource.create(resource);
        await User.findByIdAndUpdate(req.user._id, {
            $push: { resources: savedResource._id },
        });
        return res.status(201).json({ message: "successful" });
    } catch (err) {
        next(err)
    }
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

router.get("/:userId", async (req, res) => {
    try {
        let { page, limit } = req.query;
        const { userId } = req.params;

        if (!page) {
            page = 1;
        }
        if (!limit) {
            limit = 10;
        }
        const resourceList = await Resource.find({ status: ACTIVE, userId })
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
})

router.get("/", async (req, res) => {
    try {
        let { page, limit, search, filter, city } = req.query;
        let resourceList;
        if (!page) {
            page = 1;
        }
        if (!limit) {
            limit = 10;
        }
        if (search) {
            resourceList = await Resource.find({ $text: { $search: search }, status: { $in: ["ACTIVE", "APPROVED"] } })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .populate("address")
                .exec();

        }
        else if (filter) {
            resourceList = await Resource.find({ category: filter, status: { $in: ["ACTIVE", "APPROVED"] } })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .populate("address")
                .exec();

        } else {
            resourceList = await Resource.find({ status: { $in: ["ACTIVE", "APPROVED"] } })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .populate("address")
                .exec();
        }
        resourceList = resourceList.filter(resource => {
            return resource.address.city.toLowerCase() === city.toLowerCase();
        });
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

router.patch("/:resourceId", loginMiddleware, async (req, res, next) => {
    const resourceId = req.params.resourceId;
    const {
        category,
        imageURL,
        description,
        phoneNumber,
        email,
        address,
        name
    } = req.body;

    try {
        let resource = await Resource.findById(resourceId);
        if (!resource) {
            throw new BadRequest("Resource not found");
        }

        if (description !== undefined) {
            // Update description only if it's present in the body
            resource.description = description;
        }

        if (name !== undefined) {
            // Update description only if it's present in the body
            resource.name = name;
        }

        if (phoneNumber !== undefined) {
            // Update phoneNumber only if it's present in the body
            resource.phoneNumber = phoneNumber;
        }

        if (email !== undefined) {
            // Update email only if it's present in the body
            resource.email = email;
        }

        if (category !== undefined) {
            // Update category only if it's present in the body
            resource.category = category;
        }
        console.log("here")
        if (imageURL) {
            console.log("here")
            // Update imageId if imagePath is provided
            // const imageId = await saveImage(imageURL);
            resource.imageURL = imageURL;
        }

        if (address) {
            // Update address if provided
            const { addressLine1, city, state, pinCode } = address;
            if (addressLine1 !== undefined) {
                // Update addressLine1 only if it's present in the body
                resource.address.addressLine1 = addressLine1;
            }
            if (city !== undefined) {
                // Update city only if it's present in the body
                resource.address.city = city;
            }
            if (state !== undefined) {
                // Update state only if it's present in the body
                resource.address.state = state;
            }
            if (pinCode !== undefined) {
                // Update pinCode only if it's present in the body
                resource.address.pinCode = pinCode;
            }
        }

        // Save the updated resource
        const updatedResource = await resource.save();

        return res.status(200).json({ message: "successful" });
    } catch (error) {
        next(error);
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
router.post(
    "/uploadFile",
    upload.array("image"),
    async (req, res) => {
        try {
            console.log("tst", req.files[0].path);
            const url = await saveImage(req.files[0].path)
            return res.status(201).json({ message: "Image uploaded successfully", url });
        } catch (err) {
            console.log(err);
        }
    }
);
router.delete("/:resourceId", loginMiddleware, async (req, res) => {
    try {
        console.log(req.user);
        if (req.user.role !== USER) {
            throw new BadRequest("Not allowed to delete");
        }
        const resource = await Resource.findById(req.params.resourceId);
        console.log(resource);
        if (resource.status === 'APPROVED') {
            throw new BadRequest("Not allowed to delete");

        }

        await Resource.findByIdAndUpdate(req.params.resourceId, { status: IN_ACTIVE });
        await User.findByIdAndUpdate(req.user._id, { $pull: { "resources": req.params.resourceId } });
        return res.status(200).json("Resource deleted successfully");
    } catch (err) {
        console.log(err);
    }
})

router.patch('/update-resource-status/:resourceId/:userId', async (req, res, next) => {
    const { resourceId, userId } = req.params;
    try {
        const resource = await Resource.findById(resourceId);
        if (!resource) {
            throw new BadRequest('Resource not found.');
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new BadRequest('User not found.');
        }

        resource.status = resource.status === 'APPROVED' ? 'ACTIVE' : 'APPROVED'; // Replace with the new status
        user.resources.push(resourceId);

        await resource.save();
        await user.save();


        return res.status(200).json({ message: 'Resource status updated successfully.' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
