// utils/formatUser.js
function formatUser(user) {
  if (!user) return null;

  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    mobileNumber: user.mobileNumber,
    skillsHave: user.skillsHave?.map(skill => ({
      _id: skill._id,
      name: skill.name
    })),
    skillsNeed: user.skillsNeed?.map(skill => ({
      _id: skill._id,
      name: skill.name
    })),
    // createdAt: user.createdAt // optional, include only if useful for client
  };
}

module.exports = { formatUser };
