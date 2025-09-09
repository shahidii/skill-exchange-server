const { generateToken } = require("../utility/jwt");
const bcrypt = require("bcrypt");
const authRepository = require("../repository/authRepository");

// Register a new user
exports.signup = async (body) => {
    try {

        const { fullName, email, password, mobileNumber, skillsHave, skillsNeed } = body;
        const existingEmail = await authRepository.findUserByEmail(email);
        const existingMobileNumber = await authRepository.findUserByMobileNumber(mobileNumber);
        if (existingEmail) {
            return { message: "User with this email already exists" };
        }
        if (existingMobileNumber) {
            return { message: "User with this mobile number already exists" };
        }
        // Checking SkillsHave array and skillsNeed array elements is unique & not same 
        if (skillsHave.length !== new Set(skillsHave).size) {
            return { message: "SkillsHave array contains duplicate elements" };
        }
        if (skillsNeed.length !== new Set(skillsNeed).size) {
            return { message: "SkillsNeed array contains duplicate elements" };
        }
        if (skillsHave.some(skill => skillsNeed.includes(skill))) {
            return { message: "SkillsHave and SkillsNeed arrays contain common elements" };
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

        const user = await authRepository.createUser({ fullName, email, password: hashedPassword, mobileNumber, skillsHave: skillsHaveIds, skillsNeed: skillsNeedIds });
        return { user };
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
            return { message: "User not found" };
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return { message: "Invalid password" };
        }
        const token = generateToken(user);
        return { user, token };
    } catch (error) {
        throw error;
    }
};
