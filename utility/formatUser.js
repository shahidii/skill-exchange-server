// utils/formatUser.js
function formatUser(user) {
  if (!user) return null;

  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    mobileNumber: user.mobileNumber,
    skillsOffered: user.skillsOffered?.map(skill => ({
      _id: skill._id,
      name: skill.name
    })),
    skillsNeeded: user.skillsNeeded?.map(skill => ({
      _id: skill._id,
      name: skill.name
    })),
    // createdAt: user.createdAt // optional, include only if useful for client
  };
}

function formatProfile(user) {
    if (!user) return null;
    return {
        _id: user._id,
        fullName: user.fullName,
        bio: user.bio,
        avatar: user.avatar,
        email: user.email,
        mobileNumber: user.mobileNumber,
        contact: user.contact,
        location: user.location,
        skillsOffered: user.skillsOffered?.map(skill => ({
            _id: skill._id,
            name: skill.name
        })),
        skillsNeeded: user.skillsNeeded?.map(skill => ({
            _id: skill._id,
            name: skill.name
        })),
        requestsReceived: user.requestsReceived?.map(request => ({
            _id: request._id,
            user: request.user,
            skill: request.skill,
            status: request.status,
            message: request.message,
            createdAt: request.createdAt
        })),
        requestsSent: user.requestsSent?.map(request => ({
            _id: request._id,
            user: request.user,
            skill: request.skill,
            status: request.status,
            message: request.message,
            createdAt: request.createdAt
        })),
        review: user.review?.map(review => ({
            _id: review._id,
            user: review.user,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt
        })),
        rating: user.rating,
        createdAt: user.createdAt // optional, include only if useful for client
    };
}

module.exports = { formatUser, formatProfile };
