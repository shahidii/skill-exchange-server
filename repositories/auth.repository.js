const mongoose = require('mongoose');
const User = require("../models/User");
const Skill = require("../models/Skill");

const createUser = (userData) => User.create(userData);
const findUserByEmail = (email) => User.findOne({ email }).populate("skillsOffered skillsNeeded").populate("requestsReceived.user", "fullName avatar").populate("requestsSent.user", "fullName avatar").populate("requestsReceived.skill", "name").populate("requestsSent.skill", "name");
const findUserByMobileNumber = (mobileNumber) => User.findOne({ mobileNumber }).populate("skillsOffered skillsNeeded").populate("requestsReceived.user", "fullName avatar").populate("requestsSent.user", "fullName avatar").populate("requestsReceived.skill", "name").populate("requestsSent.skill", "name");
const findUserById = (id) => User.findById(id).populate("skillsOffered skillsNeeded").populate("review.user", "fullName avatar").populate("requestsReceived.user", "fullName avatar").populate("requestsSent.user", "fullName avatar").populate("requestsReceived.skill", "name").populate("requestsSent.skill", "name");
const findSkillsByName = (name) => Skill.findOne({ name });
const createSkill = (skill) => Skill.create(skill);
const updateUserPasswordByEmail = (email, hashedPassword) => User.updateOne({ email }, { $set: { password: hashedPassword } });
const updateUserEmail = (currentEmail, newEmail) => User.updateOne({ email: currentEmail }, { $set: { email: newEmail } });
const updateUserById = (id, update) => User.findByIdAndUpdate(id, update, { new: true }).populate('skillsOffered skillsNeeded').populate("review.user", "fullName avatar").populate("requestsReceived.user", "fullName avatar").populate("requestsSent.user", "fullName avatar").populate("requestsReceived.skill", "name").populate("requestsSent.skill", "name");

module.exports = { createUser, findUserByEmail, findUserByMobileNumber, findUserById, findSkillsByName, createSkill, updateUserPasswordByEmail, updateUserEmail, updateUserById };