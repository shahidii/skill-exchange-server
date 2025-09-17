const User = require("../model/User");
const Skill = require("../model/Skill");

const createUser = (userData) => User.create(userData);
const findUserByEmail = (email) => User.findOne({ email }).populate("skillsHave skillsNeed");
const findUserByMobileNumber = (mobileNumber) => User.findOne({ mobileNumber }).populate("skillsHave skillsNeed");
const findUserById = (id) => User.findById(id).populate("skillsHave skillsNeed");
const findSkillsByName = (name) => Skill.findOne({ name });
const createSkill = (skill) => Skill.create(skill);

module.exports = { createUser , findUserByEmail , findUserByMobileNumber , findUserById , findSkillsByName , createSkill };