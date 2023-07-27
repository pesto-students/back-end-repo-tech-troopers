var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { BadRequest } = require("../utils/errors");
const User = require("../models/Users");
const Address = require("../models/Address");
require("dotenv").config();
/* GET users listing. */
router.get("/", function (req, res, next) {
    res.send("respond with a resource");
});


//Register users
router.post("/", async (req, res, next) => {
    const { email, password, password2, name, role, address } = req.body;
    const { addressLine1, city, state, pinCode } = address;
    try {
        let user = await User.findOne({ email });
        if (user) {
            throw new BadRequest("User already exits");
        }
        if (password !== password2) {
            throw new BadRequest("Password do not match");
        }
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
        console.log(req.body, city);
        user = new User({
            email,
            password,
            name,
            role,
        });
        const savedAddress = await Address.create(address);
        const salt = bcrypt.genSaltSync(10);
        user.password = await bcrypt.hash(password, salt);
        user.address = savedAddress._id;
        const savedUser = await user.save();
        user.address = address;
        const payload = { user: { id: savedUser._id } };
        const token = jwt.sign(payload, process.env.JWTSECRET, {
            expiresIn: 36000,
        });
        return res.status(200).json({ token });
    } catch (err) {
        next(err);
    }
});

const checkForInvalid = (val) => {
    if (Boolean(val) == false) {
        return true;
    }
    return false;
}
module.exports = router;
