const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');

router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "API Resources",
        data: {
            version: "v1",
            resources: {
                auth: "/api/auth"
            }
        }
    });
});

router.use('/auth', authRoutes);

module.exports = router;
