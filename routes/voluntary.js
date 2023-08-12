var express = require("express");
const router = express.Router();
const User = require("../models/Users");
const NGODetails = require("../models/NGODetails");
const Voluntary = require("../models/Voluntary");
const { BadRequest } = require("../utils/errors");
const loginMiddleware = require("../middlewares/auth");
const { ACCEPTED, ACTIVE, NGO_USER, USER } = require("../utils/constants");
router.post("/admin", loginMiddleware, async (req, res, next) => {
    try {
        const {
            title,
            category,
            description,
            status,
            timeCommitment,
            ageGroup1,
            ageGroup2,
            ngoName,
            registrationNumber,
            typeOfNGO,
        } = req.body;

        if (req.user.role !== NGO_USER) {
            throw new BadRequest("You are not allowed");
        }
        if (!Boolean(title)) {
            throw new BadRequest("Title is required");
        }
        if (!Boolean(category)) {
            throw new BadRequest("Category is required");
        }
        if (!Boolean(description)) {
            throw new BadRequest("Description is required");
        }
        if (!Boolean(status)) {
            throw new BadRequest("Status is required");
        }
        if (!Boolean(timeCommitment)) {
            throw new BadRequest("Time commitment is required");
        }
        if (!Boolean(ageGroup1)) {
            throw new BadRequest("ageGroup1 is required");
        }
        if (!Boolean(ageGroup2)) {
            throw new BadRequest("ageGroup2 is required");
        }
        if (!Boolean(timeCommitment)) {
            throw new BadRequest("Time commitment is required");
        }
        if (!Boolean(ngoName)) {
            throw new BadRequest("NGO name is required");
        }
        if (!Boolean(registrationNumber)) {
            throw new BadRequest("NGO registration number is required");
        }
        if (!Boolean(typeOfNGO)) {
            throw new BadRequest("NGO type is required");
        }
        const newNgoDetail = {
            ngoName,
            registrationNumber,
            typeOfNGO
        }
        const ngoDetailData = await NGODetails.create(newNgoDetail);
        const newVoluntary = {
            title,
            category,
            description,
            status: status == ACTIVE ? ACTIVE : ACCEPTED,
            timeCommitment,
            ageGroup: [ageGroup1, ageGroup2],
            ngoDetailId: ngoDetailData._id,
            userIdNGO: req.user._id
        }
        const voluntaryData = await Voluntary.create(newVoluntary);
        await User.findByIdAndUpdate(req.user._id, { $push: { voluntary: voluntaryData._id } });
        return res.status(201).json(newVoluntary);
    } catch (err) {
        next(err);
    }
});

router.get('/admin', loginMiddleware, async(req, res, next)=>{
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
        const voluntaryList = await Voluntary.find({ userIdNGO: req.user._id })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate("ngoDetailId")
            .exec();
        const totalCount = await Voluntary.countDocuments();
        return res.status(200).json({
            voluntaryList,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    } catch(err) {
        next(err);
    }
});

router.get('/', loginMiddleware, async (req, res, next) => {
    try {
        if (req.user.role !== USER) {
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
        const voluntaryList = await Voluntary.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate("ngoDetailId")
            .exec();
        const totalCount = await Voluntary.countDocuments();
        return res.status(200).json({
            voluntaryList,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;