const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  mobileNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  skillsHave: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
  skillsNeed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
  image : { type: String },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
