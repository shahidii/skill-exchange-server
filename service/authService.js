const { generateToken } = require("../utility/jwt");
const bcrypt = require("bcrypt");
const authRepository = require("../repository/authRepository");
const { formatUser } = require("../utility/formatUser")


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

        // 

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

        // usage
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
