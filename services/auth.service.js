const { generateToken } = require("../utils/jwt");
const bcrypt = require("bcrypt");
const authRepository = require("../repositories/auth.repository");
const { formatUser, formatProfile, formatProfiles } = require("../utils/formatUser")
const { sendOtpEmail } = require("../utils/otpMailer");
const { setJsonWithTtl, getJson, delKey } = require("../utils/cache");

// OTP storage handled via Redis: key `otp:<email>` -> { otp, hashedNewPassword }
const DEFAULT_OTP_TTL_SECONDS = 180; // Always 3 minutes as requested

function generateSixDigitOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function maskEmail(email) {
    if (!email || !email.includes('@')) return email;
    const [user, domain] = email.split('@');
    const maskedUser = user.length <= 2 ? user[0] + "*" : user[0] + "***" + user[user.length - 1];
    return `${maskedUser}@${domain}`;
}

// Clean text helper
function cleanText(text) {
    return (text ?? '').replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
}

// Reusable helper: map skill names (expected cleaned) to skill IDs, creating missing skills
async function getSkillIds(skills) {
    return Promise.all(
        skills.map(async (skillName) => {
            let skill = await authRepository.findSkillsByName(skillName);
            if (!skill) {
                skill = await authRepository.createSkill({ name: skillName });
            }
            return skill._id;
        })
    );
}

// Register a new user
exports.signup = async (body) => {
    try {

        const { fullName, email, password, mobileNumber, skillsOffered, skillsNeeded } = body;
        const existingEmail = await authRepository.findUserByEmail(email);
        if (existingEmail) {
            const error = new Error('Email already registered');
            error.code = 'EMAIL_EXISTS';
            error.field = 'email';
            error.statusCode = 400;
            throw error;
        }
        if (mobileNumber) { // Only validate if mobileNumber is provided
            const existingMobileNumber = await authRepository.findUserByMobileNumber(mobileNumber);
            if (existingMobileNumber) {
                const error = new Error('Mobile number already registered');
                error.code = 'NUMBER_EXISTS';
                error.field = 'mobileNumber';
                error.statusCode = 400;
                throw error;
            }
        }
        // Checking skillsOffered array and skillsNeeded array elements is unique & not same 
        if (skillsOffered.length !== new Set(skillsOffered).size) {
            const error = new Error('skillsOffered array contains duplicate elements');
            error.code = 'SKILLS_HAVE_DUPLICATE';
            error.field = 'skillsOffered';
            error.statusCode = 400;
            throw error;
        }
        if (skillsNeeded.length !== new Set(skillsNeeded).size) {
            const error = new Error('skillsNeeded array contains duplicate elements');
            error.code = 'SKILLS_NEED_DUPLICATE';
            error.field = 'skillsNeeded';
            error.statusCode = 400;
            throw error;
        }
        if (skillsOffered.some(skill => skillsNeeded.includes(skill))) {
            const error = new Error('skillsOffered and skillsNeeded arrays contain common elements');
            error.code = 'SKILLS_HAVE_AND_NEED_COMMON';
            error.field = 'skillsOffered';
            error.statusCode = 400;
            throw error;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        // check the skills already exists in database , if exists that skill not save in skill database , rather take that skill id , and store in user database
        // if that skill not exists in database , then save that skill in skill database , and take that skill id , and store in user database

        const skillsOfferedIds = await getSkillIds(skillsOffered);
        const skillsNeededIds = await getSkillIds(skillsNeeded);

        await authRepository.createUser({ fullName, email, password: hashedPassword, mobileNumber, skillsOffered: skillsOfferedIds, skillsNeeded: skillsNeededIds });
        const user = await authRepository.findUserByEmail(email);
        return { user: formatUser(user) };
    } catch (error) {
        throw error;
    }
};

// Login a user
exports.login = async (body) => {
    try {
        const { email, password } = body;
        const user = await authRepository.findUserByEmail(email);
        if (!user) {
            const error = new Error('Invalid email or password');
            error.code = 'INVALID_CREDENTIALS'
            error.statusCode = 401;
            throw error;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = new Error('Invalid email or password');
            error.code = 'INVALID_CREDENTIALS'
            error.statusCode = 401;
            throw error;
        }
        const token = generateToken(user);
        return { user: formatUser(user), token };
    } catch (error) {
        throw error;
    }
};

// Initiate reset password: validate current credentials, store hashed new password in Redis with OTP, send OTP
exports.resetPassword = async ({ email, newPassword }) => {
    try {
        if (!email || !newPassword) {
            const error = new Error('Email and New Password are required');
            error.code = 'VALIDATION_ERROR';
            error.statusCode = 400;
            throw error;
        }
        const user = await authRepository.findUserByEmail(email);
        if (!user) {
            const error = new Error('Invalid credentials');
            error.code = 'INVALID_CREDENTIALS';
            error.statusCode = 401;
            throw error;
        }
        const isMatch = await bcrypt.compare(newPassword, user.password);
        if (isMatch) {
            const error = new Error('This password has already been used');
            error.code = 'NEW_PASSWORD_SAME_AS_OLD';
            error.statusCode = 400;
            throw error;
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const otp = generateSixDigitOtp();
        const ttlSeconds = DEFAULT_OTP_TTL_SECONDS;
        // Save to Redis with TTL
        await setJsonWithTtl(`otp:${email}`, { otp, hashedNewPassword, type: 'reset_password' }, ttlSeconds);
        await sendOtpEmail({ to: email, otp, ttlSeconds });

        return { maskedEmail: maskEmail(email), otpTtlSeconds: ttlSeconds };
    } catch (error) {
        throw error;
    }
};

// Resend OTP for an ongoing reset request (requires existing Redis context)
exports.resendOtp = async ({ email }) => {
    try {
        if (!email) {
            const error = new Error('Email is required');
            error.code = 'VALIDATION_ERROR';
            error.statusCode = 400;
            throw error;
        }
        const user = await authRepository.findUserByEmail(email);
        if (!user) {
            const error = new Error('Invalid credentials');
            error.code = 'INVALID_CREDENTIALS';
            error.statusCode = 401;
            throw error;
        }
        const ctx = await getJson(`otp:${email}`);
        const otp = generateSixDigitOtp();
        const ttlSeconds = DEFAULT_OTP_TTL_SECONDS;
        await setJsonWithTtl(`otp:${email}`, { ...ctx, otp }, ttlSeconds);
        await sendOtpEmail({ to: email, otp, ttlSeconds });
        return { maskedEmail: maskEmail(email), otpTtlSeconds: ttlSeconds };
    } catch (error) {
        throw error;
    }
};

// Verify OTP and finalize reset password or update email (read + delete from Redis)
exports.verifyOtp = async ({ email, otp }) => {
    try {
        if (!email || !otp) {
            const error = new Error('Email and OTP are required');
            error.code = 'VALIDATION_ERROR';
            error.statusCode = 400;
            throw error;
        }

        const ctx = await getJson(`otp:${email}`);
        if (!ctx || ctx.otp !== otp) {
            const error = new Error('Please enter a valid 6-digit OTP');
            error.code = 'OTP_INVALID';
            error.statusCode = 400;
            throw error;
        }

        // OTP is valid; now check type Update Password or Update Email
        if (ctx.type === 'reset_password') {
            if (!ctx.hashedNewPassword) {
                const error = new Error('Missing password reset context');
                error.code = 'RESET_CONTEXT_MISSING';
                error.statusCode = 400;
                throw error;
            }
            await authRepository.updateUserPasswordByEmail(email, ctx.hashedNewPassword);
        }

        else if (ctx.type === 'update_email') {
            if (!ctx.newEmail) {
                const error = new Error('Missing email update context');
                error.code = 'UPDATE_EMAIL_CONTEXT_MISSING';
                error.statusCode = 400;
                throw error;
            }
            await authRepository.updateUserEmail(email, ctx.newEmail);
        }

        else {
            const error = new Error('Unknown OTP context');
            error.code = 'UNKNOWN_OTP_CONTEXT';
            error.statusCode = 400;
            throw error;
        }

        // Cleanup
        await delKey(`otp:${email}`);

        return true;
    } catch (error) {
        throw error;
    }
};


// Update user email
exports.updateEmail = async ({ currentEmail, newEmail }) => {
    try {
        if (!currentEmail || !newEmail) {
            const error = new Error('Email is required');
            error.code = 'VALIDATION_ERROR';
            error.statusCode = 400;
            throw error;
        }
        const user = await authRepository.findUserByEmail(currentEmail);
        if (!user) {
            const error = new Error('User not found');
            error.code = 'INVALID_CREDENTIALS';
            error.statusCode = 401;
            throw error;
        }
        const existingUser = await authRepository.findUserByEmail(newEmail);
        if (existingUser) {
            const error = new Error('This Email is already in use');
            error.code = 'EMAIL_EXISTS';
            error.statusCode = 400;
            throw error;
        }
        // Send Otp
        const otp = generateSixDigitOtp();
        const ttlSeconds = DEFAULT_OTP_TTL_SECONDS;
        await setJsonWithTtl(`otp:${currentEmail}`, { otp, newEmail, type: 'update_email' }, ttlSeconds);
        await sendOtpEmail({ to: currentEmail, otp, ttlSeconds });
        return { maskedEmail: maskEmail(currentEmail), otpTtlSeconds: ttlSeconds };
    } catch (error) {
        throw error;
    }
};

// Get user profile
exports.getProfile = async (userId, reviewSort = 'highest') => {
    try {
        let user = await authRepository.findUserById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.code = 'INVALID_CREDENTIALS';
            error.statusCode = 401;
            throw error;
        }

        // Convert to plain object to allow adding computed fields
        // This ensures properties like acceptedRequestsCount work even if not in schema
        user = user.toObject();

        // Calculate accepted requests count manually
        user.acceptedRequestsCount = user.requestsReceived
            ? user.requestsReceived.filter(r => r.status && r.status.status === 'accepted').length
            : 0;

        // Sort reviews if present (reviews are populated by repo now)
        if (user.review && user.review.length > 0) {
            // Helper to sort (duplicated from profile.service.js, effectively)
            // Ideally should be a utility but fine here for now
            const sortedReviews = [...user.review];
            switch (reviewSort) {
                case 'highest':
                    sortedReviews.sort((a, b) => b.rating - a.rating);
                    break;
                case 'lowest':
                    sortedReviews.sort((a, b) => a.rating - b.rating);
                    break;
                case 'newest':
                    sortedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
                case 'oldest':
                    sortedReviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    break;
                case 'my-review':
                    // For own profile, "my review" likely implies "Reviews I wrote" which are not in 'user.review' (those are reviews ABOUT me).
                    // But if consistent with other logic, it might mean "Reviews by me about me" (impossible).
                    // Or it means "Reviews I wrote about OTHERS".
                    // But user.review contains reviews received.
                    // So 'my-review' on own profile is practically empty or nonsensical unless I reviewed myself (blocked).
                    // We will just return empty array or ignore.
                    // Let's filter to empty to be safe/consistent with "My Review" meaning "Review by current user".
                    user.review = [];
                    break;
                default:
                    sortedReviews.sort((a, b) => b.rating - a.rating);
            }
            if (reviewSort !== 'my-review') {
                user.review = sortedReviews;
            }
        }

        return { user: formatProfile(user) };
    } catch (error) {
        throw error;
    }
};

// Update profile (partial). Only fields provided in `body` will be validated and updated
exports.updateProfile = async (userId, body) => {
    try {
        const allowedTextFields = ['fullName', 'bio', 'location'];
        const update = {};
        const updatedFields = {};

        // Clean and validate text fields
        for (const field of allowedTextFields) {
            if (body[field] !== undefined) {
                const value = cleanText(body[field]);
                if (!value) {
                    const error = new Error(`${field} is required`);
                    error.code = 'VALIDATION_ERROR';
                    error.field = field;
                    error.statusCode = 400;
                    throw error;
                }
                update[field] = value;
                updatedFields[field] = true;
            }
        }

        // Handle skills if provided
        const { skillsOffered, skillsNeeded } = body;

        if (skillsOffered || skillsNeeded) {
            // Validate arrays
            if (skillsOffered && !Array.isArray(skillsOffered)) {
                const error = new Error('skillsOffered must be an array');
                error.code = 'VALIDATION_ERROR';
                error.field = 'skillsOffered';
                error.statusCode = 400;
                throw error;
            }
            if (skillsNeeded && !Array.isArray(skillsNeeded)) {
                const error = new Error('skillsNeeded must be an array');
                error.code = 'VALIDATION_ERROR';
                error.field = 'skillsNeeded';
                error.statusCode = 400;
                throw error;
            }

            const cleanOffered = (skillsOffered || []).map(s => cleanText(s)).filter(Boolean);
            const cleanNeeded = (skillsNeeded || []).map(s => cleanText(s)).filter(Boolean);

            if (cleanOffered.length !== new Set(cleanOffered).size) {
                const error = new Error('skillsOffered array contains duplicate elements');
                error.code = 'SKILLS_HAVE_DUPLICATE';
                error.field = 'skillsOffered';
                error.statusCode = 400;
                throw error;
            }

            if (cleanNeeded.length !== new Set(cleanNeeded).size) {
                const error = new Error('skillsNeeded array contains duplicate elements');
                error.code = 'SKILLS_NEED_DUPLICATE';
                error.field = 'skillsNeeded';
                error.statusCode = 400;
                throw error;
            }

            if (cleanOffered.some(skill => cleanNeeded.includes(skill))) {
                const error = new Error('skillsOffered and skillsNeeded arrays contain common elements');
                error.code = 'SKILLS_HAVE_AND_NEED_COMMON';
                error.field = 'skillsOffered';
                error.statusCode = 400;
                throw error;
            }

            if (skillsOffered) {
                const skillsOfferedIds = await getSkillIds(cleanOffered);
                update.skillsOffered = skillsOfferedIds;
                updatedFields.skillsOffered = true;
            }

            if (skillsNeeded) {
                const skillsNeededIds = await getSkillIds(cleanNeeded);
                update.skillsNeeded = skillsNeededIds;
                updatedFields.skillsNeeded = true;
            }
        }

        if (Object.keys(update).length === 0) {
            const error = new Error('No valid fields to update');
            error.code = 'NO_UPDATE_FIELDS';
            error.statusCode = 400;
            throw error;
        }

        const updatedUser = await authRepository.updateUserById(userId, update);
        if (!updatedUser) {
            const error = new Error('User not found');
            error.code = 'USER_NOT_FOUND';
            error.statusCode = 404;
            throw error;
        }

        return { user: formatProfile(updatedUser), updatedFields };
    } catch (error) {
        throw error;
    }
};


// Update avatar
exports.updateAvatar = async (userId, avatarUrl) => {
    try {
        if (!avatarUrl) {
            const error = new Error('Avatar URL is required');
            error.code = 'VALIDATION_ERROR';
            error.field = 'avatar';
            error.statusCode = 400;
            throw error;
        }

        // Basic URL validation
        const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[-\w-.\/?:%&=]*)?$/i;
        if (!urlRegex.test(avatarUrl)) {
            const error = new Error('Invalid avatar URL format');
            error.code = 'INVALID_URL';
            error.field = 'avatar';
            error.statusCode = 400;
            throw error;
        }

        const updatedUser = await authRepository.updateUserById(userId, { avatar: avatarUrl });
        if (!updatedUser) {
            const error = new Error('User not found');
            error.code = 'USER_NOT_FOUND';
            error.statusCode = 404;
            throw error;
        }

        return { user: formatProfile(updatedUser), updatedFields: { avatar: avatarUrl } };
    } catch (error) {
        throw error;
    }
};

// Update contact (partial). Accepts body like:
// { mobileNumber, contact: { businessEmail, linkedIn, instagram, links } }
exports.updateContact = async (userId, body) => {
    try {
        const phoneRegex = /^(?:\+91)?[2-9]\d{9}$/;
        const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[-\w-.\/?:%&=]*)?$/i;

        const update = {};
        const updatedFields = {};

        if (!body || (Object.keys(body).length === 0)) {
            const error = new Error('No contact fields provided');
            error.code = 'VALIDATION_ERROR';
            error.statusCode = 400;
            throw error;
        }

        // mobileNumber may be top-level
        if (body.mobileNumber !== undefined) {
            if (typeof body.mobileNumber !== 'string') {
                const error = new Error('mobileNumber must be a string');
                error.code = 'VALIDATION_ERROR';
                error.field = 'mobileNumber';
                error.statusCode = 400;
                throw error;
            }
            const cleaned = cleanText(body.mobileNumber);
            if (!cleaned || !phoneRegex.test(cleaned)) {
                const error = new Error('Invalid mobile number format');
                error.code = 'INVALID_MOBILE';
                error.field = 'mobileNumber';
                error.statusCode = 400;
                throw error;
            }
            update.mobileNumber = cleaned;
            updatedFields.mobileNumber = cleaned;
        }

        // contact may be nested under body.contact or body.contact fields may be passed directly
        const contactSource = (body.contact && typeof body.contact === 'object') ? body.contact : body;

        // businessEmail / businessEmail (accept either key from client but store as businessEmail in DB)
        const rawBusinessEmail = contactSource.businessEmail ?? contactSource.businessEmail;
        if (rawBusinessEmail !== undefined) {
            if (typeof rawBusinessEmail !== 'string') {
                const error = new Error('businessEmail must be a string');
                error.code = 'VALIDATION_ERROR';
                error.field = 'businessEmail';
                error.statusCode = 400;
                throw error;
            }
            const cleaned = cleanText(rawBusinessEmail);
            if (!cleaned) {
                const error = new Error('businessEmail is required');
                error.code = 'VALIDATION_ERROR';
                error.field = 'businessEmail';
                error.statusCode = 400;
                throw error;
            }
            update['contact.businessEmail'] = cleaned; // note schema uses 'businessEmail'
            updatedFields.businessEmail = cleaned;
        }

        // linkedIn (accept linkedIn or linkedIn) -> store as contact.linkedIn
        const rawlinkedIn = contactSource.linkedIn ?? contactSource.linkedIn;
        if (rawlinkedIn !== undefined) {
            if (typeof rawlinkedIn !== 'string') {
                const error = new Error('linkedIn must be a string');
                error.code = 'VALIDATION_ERROR';
                error.field = 'linkedIn';
                error.statusCode = 400;
                throw error;
            }
            const cleaned = cleanText(rawlinkedIn);
            if (!cleaned) {
                const error = new Error('linkedIn is required');
                error.code = 'VALIDATION_ERROR';
                error.field = 'linkedIn';
                error.statusCode = 400;
                throw error;
            }
            if (!urlRegex.test(cleaned)) {
                const error = new Error('linkedIn must be a valid URL');
                error.code = 'VALIDATION_ERROR';
                error.field = 'linkedIn';
                error.statusCode = 400;
                throw error;
            }
            update['contact.linkedIn'] = cleaned;
            updatedFields.linkedIn = cleaned;
        }

        // Instagram
        if (contactSource.instagram !== undefined) {
            if (typeof contactSource.instagram !== 'string') {
                const error = new Error('instagram must be a string');
                error.code = 'VALIDATION_ERROR';
                error.field = 'instagram';
                error.statusCode = 400;
                throw error;
            }
            const cleaned = cleanText(contactSource.instagram);
            if (!cleaned) {
                const error = new Error('instagram is required');
                error.code = 'VALIDATION_ERROR';
                error.field = 'instagram';
                error.statusCode = 400;
                throw error;
            }
            if (!urlRegex.test(cleaned)) {
                const error = new Error('instagram must be a valid URL');
                error.code = 'VALIDATION_ERROR';
                error.field = 'instagram';
                error.statusCode = 400;
                throw error;
            }
            update['contact.instagram'] = cleaned;
            updatedFields.instagram = cleaned;
        }

        // Links array
        if (contactSource.links !== undefined) {
            if (!Array.isArray(contactSource.links)) {
                const error = new Error('links must be an array');
                error.code = 'VALIDATION_ERROR';
                error.field = 'links';
                error.statusCode = 400;
                throw error;
            }

            const cleanedLinks = contactSource.links.map((l, idx) => {
                if (!l || typeof l !== 'object') {
                    const error = new Error(`links[${idx}] must be an object with name and url`);
                    error.code = 'VALIDATION_ERROR';
                    error.field = 'links';
                    error.statusCode = 400;
                    throw error;
                }
                const name = cleanText(l.name);
                const url = cleanText(l.url);
                if (!name) {
                    const error = new Error(`links[${idx}].name is required`);
                    error.code = 'VALIDATION_ERROR';
                    error.field = 'links';
                    error.statusCode = 400;
                    throw error;
                }
                if (!url) {
                    const error = new Error(`links[${idx}].url is required`);
                    error.code = 'VALIDATION_ERROR';
                    error.field = 'links';
                    error.statusCode = 400;
                    throw error;
                }
                if (!urlRegex.test(url)) {
                    const error = new Error(`links[${idx}].url is not a valid URL`);
                    error.code = 'VALIDATION_ERROR';
                    error.field = 'links';
                    error.statusCode = 400;
                    throw error;
                }
                return { name, url };
            });

            update['contact.links'] = cleanedLinks;
            updatedFields.links = cleanedLinks;
        }

        if (Object.keys(update).length === 0) {
            const error = new Error('No valid contact fields to update');
            error.code = 'NO_UPDATE_FIELDS';
            error.statusCode = 400;
            throw error;
        }

        // use $set to avoid replacing entire subdocuments
        const updatedUser = await authRepository.updateUserById(userId, { $set: update });
        if (!updatedUser) {
            const error = new Error('User not found');
            error.code = 'USER_NOT_FOUND';
            error.statusCode = 404;
            throw error;
        }


        return { user: formatProfile(updatedUser), updatedFields };
    } catch (error) {
        throw error;
    }
};


// Update Request Status (Accept/Decline)
exports.updateRequestStatus = async (userId, requestId, status, message) => {
    try {
        const User = require("../models/User");
        if (!['accepted', 'declined'].includes(status)) {
            const error = new Error('Invalid status');
            error.statusCode = 400;
            throw error;
        }

        const currentUser = await User.findById(userId);

        // Find the request in requestsReceived
        const receivedReqHandler = currentUser.requestsReceived.id(requestId);

        if (!receivedReqHandler) {
            const error = new Error('Request not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if already responded
        if (receivedReqHandler.status.status !== 'pending') {
            const error = new Error('Request already processed');
            error.statusCode = 400;
            throw error;
        }

        // Update Receiver's copy
        receivedReqHandler.status = { status, message: message || '' };
        // We can keep 'seen' as is (receiver is acting on it, so they have seen it) or ensure it's true.
        receivedReqHandler.seen = true;

        // Find and Update Sender's copy
        const senderId = receivedReqHandler.user;
        const senderUser = await User.findById(senderId);

        if (senderUser) {
            const sentReqHandler = senderUser.requestsSent.id(requestId);
            if (sentReqHandler) {
                sentReqHandler.status = { status, message: message || '' };
                // CRITICAL: Trigger notification for sender
                sentReqHandler.seen = false;
            }
            await senderUser.save();
        }

        await currentUser.save();
        return true;
    } catch (error) {
        throw error;
    }
};

// Mark requests as seen
exports.markRequestsSeen = async (userId, type) => {
    try {
        const User = require("../models/User");
        const user = await User.findById(userId);

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        let updated = false;

        if (type === 'incoming') {
            user.requestsReceived.forEach(req => {
                if (!req.seen) {
                    req.seen = true;
                    updated = true;
                }
            });
        } else if (type === 'my') {
            user.requestsSent.forEach(req => {
                // Only mark as seen if it's NOT pending (meaning it has a reply)
                // Actually, for 'my' requests, 'seen=false' means there is an update (reply).
                // So we check !req.seen.
                if (!req.seen) {
                    req.seen = true;
                    updated = true;
                }
            });
        }

        if (updated) {
            await user.save();
        }
        return true;
    } catch (error) {
        throw error;
    }
};

// Delete or Unsend Request
exports.deleteRequest = async (userId, requestId, action) => {
    try {
        const User = require("../models/User");
        const currentUser = await User.findById(userId);

        if (!currentUser) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        if (action === 'unsend') {
            // "Unsend" logic: Remove from BOTH users.
            // Requirement: Only allowed if status is 'pending' and user is the sender.

            const sentReq = currentUser.requestsSent.id(requestId);
            if (!sentReq) {
                const error = new Error('Request not found in your sent list');
                error.statusCode = 404;
                throw error;
            }

            if (sentReq.status.status !== 'pending') {
                const error = new Error('Cannot unsend a processed request');
                error.statusCode = 400;
                throw error;
            }

            // Remove from Sender (Current User)
            currentUser.requestsSent.pull(requestId);

            // Remove from Receiver
            const receiverId = sentReq.user;
            const receiverUser = await User.findById(receiverId);
            if (receiverUser) {
                receiverUser.requestsReceived.pull(requestId);
                await receiverUser.save();
            }

            await currentUser.save();

        } else if (action === 'delete') {
            // "Delete" logic: Remove from HISTORY (Current user only).
            // Allowed if status is accepted/declined.

            // Check in Sent
            const sentReq = currentUser.requestsSent.id(requestId);
            if (sentReq) {
                if (sentReq.status.status === 'pending') {
                    const error = new Error('Cannot delete a pending request from history');
                    error.statusCode = 400;
                    throw error;
                }
                currentUser.requestsSent.pull(requestId);
            }
            // Check in Received (if not found in Sent, or maybe check both? ID should be unique)
            else {
                const receivedReq = currentUser.requestsReceived.id(requestId);
                if (receivedReq) {
                    if (receivedReq.status.status === 'pending') {
                        const error = new Error('Cannot delete a pending request from history. Accept or Decline it first.');
                        error.statusCode = 400;
                        throw error;
                    }
                    currentUser.requestsReceived.pull(requestId);
                } else {
                    const error = new Error('Request not found');
                    error.statusCode = 404;
                    throw error;
                }
            }

            await currentUser.save();
        } else {
            const error = new Error('Invalid action');
            error.statusCode = 400;
            throw error;
        }

        return true;

    } catch (error) {
        throw error;
    }
};
