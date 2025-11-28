const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", required: true },
  status: { status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" }, message: { type: String, trim: true } },
  message: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});


const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  bio: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  mobileNumber: { type: String, required: true, unique: true, trim: true },
  contact: {
    businessEmail: { type: String, trim: true },
    linkedIn: { type: String, trim: true },
    instagram: { type: String, trim: true },
    links: [{
      name: { type: String, trim: true },
      url: { type: String, trim: true },
    }],
  },
  location: { type: String, trim: true },
  avatar: { type: String, trim: true },
  password: { type: String, required: true, minlength: 6 },
  skillsOffered: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
  skillsNeeded: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
  requestsReceived: [requestSchema],
  requestsSent: [requestSchema],
  review: [reviewSchema],
  rating: { type: Number, min: 0, max: 5, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
