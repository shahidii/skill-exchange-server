require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Skill = require('../models/Skill');

// Sample data
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Emma', 'Robert', 'Olivia', 'William', 'Ava', 'Richard', 'Isabella', 'Thomas', 'Sophia', 'Charles', 'Mia', 'Daniel', 'Charlotte', 'Matthew', 'Amelia', 'Joseph', 'Harper', 'Christopher', 'Evelyn', 'Andrew', 'Abigail', 'Joshua', 'Elizabeth', 'Ryan', 'Sofia', 'Nicholas', 'Avery', 'Alexander', 'Ella', 'Jonathan', 'Scarlett', 'Benjamin', 'Grace', 'Samuel', 'Chloe', 'Jacob', 'Victoria', 'Anthony', 'Riley', 'Kevin', 'Aria', 'Brian', 'Lily'];

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

const locations = ['New York, USA', 'London, UK', 'Tokyo, Japan', 'Paris, France', 'Berlin, Germany', 'Toronto, Canada', 'Sydney, Australia', 'Mumbai, India', 'Singapore', 'Dubai, UAE', 'San Francisco, USA', 'Los Angeles, USA', 'Chicago, USA', 'Boston, USA', 'Seattle, USA', 'Austin, USA', 'Denver, USA', 'Miami, USA', 'Barcelona, Spain', 'Amsterdam, Netherlands', 'Stockholm, Sweden', 'Copenhagen, Denmark', 'Oslo, Norway', 'Helsinki, Finland', 'Bangalore, India', 'Delhi, India', 'Hyderabad, India', 'Pune, India', 'Chennai, India', 'Kolkata, India'];

const skillsList = [
    'javascript', 'python', 'java', 'react', 'nodejs', 'angular', 'vue', 'typescript',
    'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes', 'aws', 'azure',
    'machine learning', 'data science', 'ai', 'blockchain', 'cybersecurity', 'devops',
    'ui/ux design', 'graphic design', 'video editing', 'photography', 'content writing',
    'digital marketing', 'seo', 'social media marketing', 'copywriting', 'public speaking',
    'project management', 'agile', 'scrum', 'leadership', 'business analysis',
    'accounting', 'finance', 'sales', 'customer service', 'teaching', 'mentoring',
    'music production', 'guitar', 'piano', 'singing', 'dancing', 'yoga', 'fitness training',
    'cooking', 'baking', 'gardening', 'woodworking', 'painting', 'drawing', 'sculpture'
];

const bioTemplates = [
    'Passionate {skill1} expert with {years} years of experience. Love helping others learn {skill2}.',
    'Professional {skill1} specialist. Currently exploring {skill2} and looking to exchange knowledge.',
    '{skill1} enthusiast seeking to master {skill2}. Open to skill exchange and collaboration.',
    'Experienced in {skill1}, eager to learn {skill2}. Let\'s grow together!',
    'Full-time {skill1} professional. Part-time {skill2} learner. Always ready to share and learn.',
    '{years} years in {skill1}. Now diving into {skill2}. Skill exchange is the best way to learn!',
    'Creative {skill1} practitioner. Curious about {skill2}. Let\'s exchange skills and ideas.',
    'Tech-savvy {skill1} developer. Interested in learning {skill2} from experienced practitioners.',
];

// Helper functions
function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomElements(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateBio(skill1, skill2) {
    const template = randomElement(bioTemplates);
    const years = randomInt(1, 15);
    return template.replace('{skill1}', skill1).replace('{skill2}', skill2).replace('{years}', years);
}

// Create or find skills
async function ensureSkills(skillNames) {
    const skillIds = [];
    for (const name of skillNames) {
        let skill = await Skill.findOne({ name: name.toLowerCase() });
        if (!skill) {
            skill = await Skill.create({ name: name.toLowerCase() });
        }
        skillIds.push(skill._id);
    }
    return skillIds;
}

// Generate reviews for a user
function generateReviews(count) {
    const reviews = [];
    for (let i = 0; i < count; i++) {
        reviews.push({
            user: new mongoose.Types.ObjectId(), // Random user ID
            rating: randomInt(3, 5), // 3-5 stars
            comment: randomElement([
                'Great experience! Very knowledgeable and patient.',
                'Excellent teacher. Learned a lot in a short time.',
                'Highly recommend! Very professional and helpful.',
                'Amazing skill exchange session. Will definitely connect again.',
                'Very patient and clear in explanations. Thank you!',
                'Fantastic mentor. Made complex topics easy to understand.',
                'Great communication and teaching style.',
                'Very skilled and generous with knowledge sharing.'
            ]),
            createdAt: new Date(Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000) // Random date within last 90 days
        });
    }
    return reviews;
}

// Generate accepted requests
function generateAcceptedRequests(count) {
    const requests = [];
    for (let i = 0; i < count; i++) {
        requests.push({
            user: new mongoose.Types.ObjectId(),
            skill: new mongoose.Types.ObjectId(),
            status: {
                status: 'accepted',
                message: 'Request accepted'
            },
            message: 'Looking forward to learning from you!',
            createdAt: new Date(Date.now() - randomInt(0, 60) * 24 * 60 * 60 * 1000)
        });
    }
    return requests;
}

// Main seed function
async function seedProfiles() {
    try {
        console.log('🌱 Starting profile seeding...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI_ATLAS || process.env.MONGO_URI_LOCAL);
        console.log('✅ Connected to MongoDB');

        // Clear existing users (optional - comment out if you want to keep existing users)
        // await User.deleteMany({});
        // console.log('🗑️  Cleared existing users');

        // Hash password once (same for all test users)
        const hashedPassword = await bcrypt.hash('password123', 10);

        const profiles = [];

        for (let i = 1; i <= 50; i++) {
            const firstName = randomElement(firstNames);
            const lastName = randomElement(lastNames);
            const fullName = `${firstName} ${lastName}`;

            // Generate unique email
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;

            // Generate unique mobile number (always unique to avoid index issues)
            const mobileNumber = `98765${String(10000 + i).slice(1)}`; // Generates: 9876510001, 9876510002, etc.

            // Random skills (2-5 offered, 1-3 needed, no overlap)
            const offeredCount = randomInt(2, 5);
            const neededCount = randomInt(1, 3);

            const allSkills = randomElements(skillsList, offeredCount + neededCount);
            const skillsOfferedNames = allSkills.slice(0, offeredCount);
            const skillsNeededNames = allSkills.slice(offeredCount);

            // Ensure skills exist in DB
            const skillsOfferedIds = await ensureSkills(skillsOfferedNames);
            const skillsNeededIds = await ensureSkills(skillsNeededNames);

            // Generate bio
            const bio = generateBio(skillsOfferedNames[0], skillsNeededNames[0]);

            // Random reviews (0-20)
            const reviewCount = randomInt(0, 20);
            const reviews = generateReviews(reviewCount);

            // Calculate rating based on reviews
            const rating = reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0;

            // Random accepted requests (0-15)
            const acceptedRequestsCount = randomInt(0, 15);
            const acceptedRequests = generateAcceptedRequests(acceptedRequestsCount);

            const profile = {
                fullName,
                email,
                mobileNumber, // Optional field
                password: hashedPassword,
                bio,
                location: randomElement(locations),
                skillsOffered: skillsOfferedIds,
                skillsNeeded: skillsNeededIds,
                review: reviews,
                rating: Math.round(rating * 10) / 10, // Round to 1 decimal
                requestsReceived: acceptedRequests,
                requestsSent: [],
                createdAt: new Date(Date.now() - randomInt(0, 365) * 24 * 60 * 60 * 1000) // Random date within last year
            };

            profiles.push(profile);

            // Progress indicator
            if (i % 10 === 0) {
                console.log(`📝 Generated ${i}/50 profiles...`);
            }
        }

        // Insert all profiles
        await User.insertMany(profiles);
        console.log(`✅ Successfully created 50 profiles!`);

        // Show some stats
        const totalUsers = await User.countDocuments();
        const totalSkills = await Skill.countDocuments();
        console.log(`\n📊 Database Stats:`);
        console.log(`   Total Users: ${totalUsers}`);
        console.log(`   Total Skills: ${totalSkills}`);
        console.log(`\n🔑 Test Login Credentials:`);
        console.log(`   Email: ${profiles[0].email}`);
        console.log(`   Password: password123`);
        console.log(`\n💡 All test users have password: password123`);

    } catch (error) {
        console.error('❌ Error seeding profiles:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Database connection closed');
    }
}

// Run the seed function
seedProfiles();
