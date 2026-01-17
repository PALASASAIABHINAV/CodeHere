import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { upload } from '../middleware/uploadMiddleware.js';
import {
    uploadProfilePicture,
    deleteProfilePicture,
    getProfilePictureStatus
} from '../controllers/profilePictureController.js';

const router = express.Router();

// All routes require authentication
router.post('/upload-picture', verifyToken, upload.single('profilePicture'), uploadProfilePicture);
router.delete('/delete-picture', verifyToken, deleteProfilePicture);
router.get('/picture-status', verifyToken, getProfilePictureStatus);

export default router;
