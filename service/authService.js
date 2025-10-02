const { generateToken } = require("../utility/jwt");
const bcrypt = require("bcrypt");
const authRepository = require("../repository/authRepository");
const { formatUser } = require("../utility/formatUser")
const { sendOtpEmail } = require("../utility/mailer");
const { setJsonWithTtl, getJson, delKey } = require("../utility/redis");

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

// Register a new user
exports.signup = async (body) => {
    try {

        const { fullName, email, password, mobileNumber, skillsHave, skillsNeed } = body;
        const existingEmail = await authRepository.findUserByEmail(email);
        const existingMobileNumber = await authRepository.findUserByMobileNumber(mobileNumber);
        if (existingEmail) {
            const error = new Error('Email already registered');
            error.code = 'EMAIL_EXISTS';
            error.field = 'email';
            error.statusCode = 400;
            throw error;
        }
        if (existingMobileNumber) {
            const error = new Error('Mobile number already registered');
            error.code = 'NUMBER_EXISTS';
            error.field = 'mobileNumber';
            error.statusCode = 400;
            throw error;
        }
        // Checking SkillsHave array and skillsNeed array elements is unique & not same 
        if (skillsHave.length !== new Set(skillsHave).size) {
            const error = new Error('SkillsHave array contains duplicate elements');
            error.code = 'SKILLS_HAVE_DUPLICATE';
            error.field = 'skillsHave';
            error.statusCode = 400;
            throw error;
        }
        if (skillsNeed.length !== new Set(skillsNeed).size) {
            const error = new Error('SkillsNeed array contains duplicate elements');
            error.code = 'SKILLS_NEED_DUPLICATE';
            error.field = 'skillsNeed';
            error.statusCode = 400;
            throw error;
        }
        if (skillsHave.some(skill => skillsNeed.includes(skill))) {
            const error = new Error('SkillsHave and SkillsNeed arrays contain common elements');
            error.code = 'SKILLS_HAVE_AND_NEED_COMMON';
            error.field = 'skillsHave';
            error.statusCode = 400;
            throw error;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        // check the skills already exists in database , if exists that skill not save in skill database , rather take that skill id , and store in user database
        // if that skill not exists in database , then save that skill in skill database , and take that skill id , and store in user database

        async function getSkillIds(skills, authRepository) {
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

        const skillsHaveIds = await getSkillIds(skillsHave, authRepository);
        const skillsNeedIds = await getSkillIds(skillsNeed, authRepository);

        await authRepository.createUser({ fullName, email, password: hashedPassword, mobileNumber, skillsHave: skillsHaveIds, skillsNeed: skillsNeedIds });
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
        await setJsonWithTtl(`otp:${email}`, { otp, hashedNewPassword }, ttlSeconds);
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

// Verify OTP and finalize password reset (read + delete from Redis)
exports.verifyOtp = async ({ email, otp }) => {
    try {
        if (!email) {
            const error = new Error('Email is required');
            error.code = 'VALIDATION_ERROR';
            error.statusCode = 400;
            throw error;
        }
        if (!otp) {
            const error = new Error('OTP is required');
            error.code = 'VALIDATION_ERROR';
            error.statusCode = 400;
            throw error;
        }
        const ctx = await getJson(`otp:${email}`);
        if (!ctx) {
            const error = new Error('Please enter a valid 6-digit OTP');
            error.code = 'OTP_INVALID';
            error.statusCode = 400;
            throw error;
        }
        if (ctx.otp !== otp) {
            const error = new Error('Please enter a valid 6-digit OTP');
            error.code = 'OTP_INVALID';
            error.statusCode = 400;
            throw error;
        }
        // Update password
        await authRepository.updateUserPasswordByEmail(email, ctx.hashedNewPassword);
        // Clear Redis key
        await delKey(`otp:${email}`);
        return true;
    } catch (error) {
        throw error;
    }
};
