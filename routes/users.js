var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { BadRequest } = require("../utils/errors");
const User = require("../models/Users");
const Address = require("../models/Address");
const NGODetails = require("../models/NGODetails");
require("dotenv").config();
/* GET users listing. */
router.get("/", function (req, res, next) {
    res.send("respond with a resource");
});


//Register users
router.post("/", async (req, res, next) => {
    const { email, password, confirmPassword, name, role, address } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            throw new BadRequest("User already exits");
        }
        if (password !== confirmPassword) {
            throw new BadRequest("Password do not match");
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
        user = new User({
            email,
            password,
            name,
            role,
        });
        // const savedAddress = await Address.create(address);
        const salt = bcrypt.genSaltSync(10);
        user.password = await bcrypt.hash(password, salt);
        // user.address = savedAddress._id;
        const savedUser = await user.save();
        // user.address = address;
        const payload = { user: { id: savedUser._id } };
        const token = jwt.sign(payload, process.env.JWTSECRET, {
            expiresIn: 36000,
        });
        delete savedUser["password"]
        return res.status(200).json({ token, userInfo: savedUser });
    } catch (err) {
        next(err);
    }
});

router.patch("/:userId", async (req, res, next) => {
    console.log("here")
    const { userId } = req.params;
    const { address, ngoDetails } = req.body;
    try {
        let user = await User.findById(userId);
        if (!user) {
            throw new BadRequest("User not found.");
        }

        // Update address details if provided
        if (address) {
            const { addressLine1, city, state, pinCode } = address;
            if (checkForInvalid(addressLine1) || checkForInvalid(city) || checkForInvalid(state) || checkForInvalid(pinCode)) {
                throw new BadRequest("Invalid address details.");
            }
            const updatedAddress = await Address.findByIdAndUpdate(user.address, address, { new: true });
            user.address = new Address({ ...address });
        }

        // Update NGO details if provided
        if (ngoDetails) {
            const { ngoName, registrationNumber, typeOfNGO } = ngoDetails;
            if (checkForInvalid(ngoName) || checkForInvalid(registrationNumber) || checkForInvalid(typeOfNGO)) {
                throw new BadRequest("Invalid NGO details.");
            }
            user.ngoDetails = new NGODetails({
                ...ngoDetails
            });
        }

        const updatedUser = await user.save();
        return res.status(200).json(updatedUser);
    } catch (err) {
        next(err);
    }
});

const checkForInvalid = (val) => {
    return Boolean(val) ? false : true;
}
module.exports = router;
