const swaggerJsdoc = require('swagger-jsdoc');
const schemas = require('../docs/swagger.schemas');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Skill Exchange Platform API',
            version: '1.0.0',
            description: 'Backend API for the Skill Exchange Platform. Built with Node.js, Express, and MongoDB.',
            contact: {
                name: 'API Support',
                email: 'support@skillexchange.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:8080/api',
                description: 'Development Server',
            },
            {
                url: 'https://api.skillexchange.com/v1',
                description: 'Production Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: schemas,
        },
    },
    apis: ['./docs/swagger.path.js'], // Parse path file for JSDoc
};

const specs = swaggerJsdoc(options);

module.exports = specs;
