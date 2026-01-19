import express from 'express';
import {
    getAllProjects,
    getProjectBySlug,
    submitProject,
    autoSaveProject,
} from '../controllers/frontendProjectController.js';
import { verifyToken as protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getAllProjects);
router.get('/:slug', optionalAuth, getProjectBySlug);
router.post('/submit', protect, submitProject);
router.post('/autosave', protect, autoSaveProject);

export default router;
