const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const profileRoutes = require('./profile.routes');
const aiRoutes = require('./ai.routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('../config/swagger');

// Mount Swagger Documentation
router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(swaggerSpecs, { explorer: true }));

router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "API Resources",
        data: {
            version: "v1",
            resources: {
                auth: "/api/auth",
                profiles: "/api/profiles",
            }
        }
    });
});

router.use('/auth', authRoutes);
router.use('/profiles', profileRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
