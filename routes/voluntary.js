var express = require("express");
const router = express.Router();
const User = require("../models/Users");
const NGODetails = require("../models/NGODetails");
const Voluntary = require("../models/Voluntary");
const { BadRequest } = require("../utils/errors");
const loginMiddleware = require("../middlewares/auth");
const { NGO_USER, USER } = require("../utils/constants");
router.post("/admin", loginMiddleware, async (req, res, next) => {
    try {
        const {
            title,
            category,
            description,
            timeCommitment,
            ageGroup
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
        if (!Boolean(timeCommitment)) {
            throw new BadRequest("Time commitment is required");
        }
        if (!Boolean(ageGroup)) {
            throw new BadRequest("ageGroup is required");
        }
        const ngoUser = await User.findById(req.user._id);
        const newVoluntary = {
            title,
            category,
            description,
            status: "ACTIVE",
            timeCommitment,
            ageGroup,
            ngoDetailId: ngoUser.ngoDetails,
            userIdNGO: req.user._id
        }
        const voluntaryData = await Voluntary.create(newVoluntary);
        await User.findByIdAndUpdate(req.user._id, { $push: { voluntary: voluntaryData._id } });
        return res.status(201).json({ newVoluntary, message: "successful" });
    } catch (err) {
        next(err);
    }
});

router.get('/admin', loginMiddleware, async (req, res, next) => {
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
            .populate({ path: "interestedUsers", select: "name email phoneNumber" })
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

router.get('/', loginMiddleware, async (req, res, next) => {
    try {
        if (req.user.role !== USER) {
            throw new BadRequest("You are not allowed");
        }
        let page = req.query.page;
        let limit = req.query.limit;
        let filter = req.query.filter;
        let city = req.query.city;
        if (!page) {
            page = 1;
        }
        if (!limit) {
            limit = 10;
        }

        if (filter) {
            const voluntaryList = await Voluntary.find({ category: filter })
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
        }
        let voluntaryList = await Voluntary.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate("ngoDetailId")
            .populate({ path: "userIdNGO", populate: { path: "address", select: "city" } })
            .exec();
        if (city) {
            voluntaryList = voluntaryList.filter((val) => val.userIdNGO.address.city == city);
        }
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

router.put("/admin/:voluntaryId", loginMiddleware, async (req, res, next) => {
    try {
        const {
            title,
            category,
            description,
            timeCommitment,
            ageGroup
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
        if (!Boolean(timeCommitment)) {
            throw new BadRequest("Time commitment is required");
        }
        if (!Boolean(ageGroup)) {
            throw new BadRequest("ageGroup is required");
        }
        const voluntaryData = await Voluntary.findById(req.params.voluntaryId);

        voluntaryData.title = title;
        voluntaryData.description = description;
        voluntaryData.category = category;
        voluntaryData.timeCommitment = timeCommitment;
        voluntaryData.ageGroup = ageGroup;
        await voluntaryData.save();
        return res.status(200).json({ message: "Successfully updated task data" });
    } catch (err) {
        next(err);
    }
});

router.patch("/add/:voluntaryId", loginMiddleware, async (req, res, next) => {
    try {
        if (req.user.role !== USER) {
            throw new BadRequest("You are not allowed");
        }
        await Voluntary.findByIdAndUpdate(req.params.voluntaryId, { $push: { interestedUsers: req.user._id } });
        await User.findByIdAndUpdate(req.user._id, { $push: { voluntary: req.params.voluntaryId } });
        return res.status(201).json({ message: "Successfully recored your interest." })
    } catch (err) {
        next(err);
    }
});

router.patch("/remove/:voluntaryId", loginMiddleware, async (req, res, next) => {
    try {
        if (req.user.role !== USER) {
            throw new BadRequest("You are not allowed");
        }
        await Voluntary.findByIdAndUpdate(req.params.voluntaryId, { $pull: { interestedUsers: req.user._id } });
        await User.findByIdAndUpdate(req.user._id, { $pull: { voluntary: req.params.voluntaryId } });
        return res.status(201).json({ message: "Successfully removed your interest." })
    } catch (err) {
        next(err);
    }
});

router.delete("/admin/:voluntaryId", loginMiddleware, async (req, res, next) => {
    try {
        if (req.user.role !== NGO_USER) {
            throw new BadRequest("You are not allowed");
        }
        await Voluntary.findByIdAndDelete(req.params.voluntaryId);
        await User.findByIdAndUpdate(req.user._id, { $pull: { voluntary: req.params.voluntaryId } });
        return res.status(200).json("Task deleted successfully");
    } catch (err) {
        next(err);
    }
})
module.exports = router;
