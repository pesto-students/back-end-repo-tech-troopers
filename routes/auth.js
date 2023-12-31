var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/Users");
const { BadRequest } = require("../utils/errors");
const auth = require("../middlewares/auth");
require("dotenv").config();

//login
router.post("/", async (req, res, next) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user.role === 'NGO_USER') {
            user.populate("address");
            user.populate("ngoDetails");
            console.log(user)
        }
        if (!user) {
            throw new BadRequest("You are not signed up");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new BadRequest("Password is wrong");
        }
        const userInfo = { ...user.toObject() };
        delete userInfo.password
        user = { ...user._doc };
        delete user["password"]
        const payload = { user };
        const token = await jwt.sign(payload, process.env.JWTSECRET, {
            expiresIn: 36000,
        });
        return res.status(200).json({ userInfo, token });
    } catch (err) {
        next(err);
    }
});
module.exports = router;
