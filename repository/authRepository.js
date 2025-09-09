const User = require("../model/User");
const Skill = require("../model/Skill");

const createUser = (user) => User.create(user);
const findUserByEmail = (email) => User.findOne({ email });
const findUserByMobileNumber = (mobileNumber) => User.findOne({ mobileNumber });
const findUserById = (id) => User.findById(id);
const findSkillsByName = (name) => Skill.findOne({ name });
const createSkill = (skill) => Skill.create(skill);

module.exports = { createUser , findUserByEmail , findUserByMobileNumber , findUserById , findSkillsByName , createSkill };