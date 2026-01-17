import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

// Configure cloudinary
import '../config/cloudinaryConfig.js';

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profile-pictures',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            {
                width: 500,
                height: 500,
                crop: 'fill',
                gravity: 'face',
                quality: 'auto',
                fetch_format: 'auto'
            }
        ]
    }
});

// File filter to validate image types
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

// Create multer upload middleware
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});
