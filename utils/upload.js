const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'skill-exchange/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Added webp
        // Optimization: Auto format and quality
        format: async (req, file) => 'auto', // Automatically choose best format (e.g. webp/avif)
        transformation: [
            { width: 500, height: 500, crop: 'limit' }, // Resize if too large
            { quality: 'auto' }, // Auto quality
            { fetch_format: 'auto' } // Auto format
        ]
    },
});

// File filter with MIME type checking
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        // Pass an error to the callback
        const error = new Error('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.');
        error.code = 'INVALID_FILE_TYPE';
        cb(error, false);
    }
};

// Create multer instance with configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

module.exports = upload;