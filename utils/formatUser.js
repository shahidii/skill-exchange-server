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
            user: review.user && review.user._id ? {
                _id: review.user._id,
                fullName: review.user.fullName,
                avatar: review.user.avatar
            } : review.user,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt
        })),
        rating: user.rating,
        reviewCount: user.reviewCount, // Added for pagination
        acceptedRequestsCount: user.acceptedRequestsCount, // Added for stats
        createdAt: user.createdAt // optional, include only if useful for client
    };
}

function formatProfiles(profiles) {
    if (!profiles) return null;
    return profiles.map(user => ({
        _id: user._id,
        fullName: user.fullName,
        bio: user.bio,
        avatar: user.avatar,
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
        review: user.review?.map(review => ({
            _id: review._id,
            user: review.user && review.user._id ? {
                _id: review.user._id,
                fullName: review.user.fullName,
                avatar: review.user.avatar
            } : review.user,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt
        })),
        rating: user.rating,
        createdAt: user.createdAt,
        reviewCount: user?.reviewCount,
        acceptedRequestsCount: user?.acceptedRequestsCount
    }));
}


module.exports = { formatUser, formatProfile, formatProfiles };
