module.exports = {
    User: {
        type: 'object',
        properties: {
            _id: { type: 'string', example: '60d0fe4f5311236168a109ca' },
            fullName: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            mobileNumber: { type: 'string', example: '9876543210' },
            skillsOffered: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' }
                    }
                }
            },
            skillsNeeded: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' }
                    }
                }
            },
            createdAt: { type: 'string', format: 'date-time', example: '2023-01-01T12:00:00.000Z' },
        },
    },
    Profile: {
        allOf: [
            { $ref: '#/components/schemas/User' },
            {
                type: 'object',
                properties: {
                    bio: { type: 'string', example: 'Passionate Full Stack Developer' },
                    avatar: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/v1/avatar.jpg' },
                    location: { type: 'string', example: 'New York, USA' },
                    rating: { type: 'number', example: 4.5 },
                    contact: {
                        type: 'object',
                        properties: {
                            businessEmail: { type: 'string', example: 'contact@johndoe.com' },
                            linkedIn: { type: 'string', example: 'https://linkedin.com/in/johndoe' },
                            instagram: { type: 'string', example: 'https://instagram.com/johndoe' },
                            links: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string', example: 'Portfolio' },
                                        url: { type: 'string', example: 'https://johndoe.com' },
                                    },
                                },
                            },
                        },
                    },
                    requestsReceived: { type: 'array', items: { type: 'object' } },
                    requestsSent: { type: 'array', items: { type: 'object' } },
                    review: { type: 'array', items: { type: 'object' } },
                },
            },
        ],
    },
    Error: {
        type: 'object',
        properties: {
            success: { type: 'boolean', example: false },
            error: {
                type: 'object',
                properties: {
                    code: { type: 'string', example: 'ERROR_CODE' },
                    message: { type: 'string', example: 'Human readable error message' },
                    field: { type: 'string', example: 'fieldName' },
                },
            },
        },
    },
    Success: {
        type: 'object',
        properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' },
        },
    },
};
