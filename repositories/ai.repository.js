const User = require("../models/User");
const Skill = require("../models/Skill");


const findSkillByNameRegex = (regex) => Skill.find({ name: regex }).select("_id");

const findUsersBySkillsOffered = (skillIds) => User.find({ skillsOffered: { $in: skillIds } })
    .populate("skillsOffered", "name")
    .populate("skillsNeeded", "name")
    .sort({ rating: -1, "requestsReceived.length": -1 })
    .limit(5)
    .select("fullName bio location rating avatar skillsOffered skillsNeeded requestsReceived");

const findUserByNameRegex = (regex) => User.findOne({ fullName: regex })
    .populate("skillsOffered", "name")
    .populate("skillsNeeded", "name") // Added skillsNeeded
    .populate({
        path: 'review.user',
        select: 'fullName avatar'
    })
    .select("fullName bio location rating avatar skillsOffered skillsNeeded requestsReceived review"); // Added avatar, review, etc.



module.exports = {
    findSkillByNameRegex,
    findUsersBySkillsOffered,
    findUserByNameRegex,



};
