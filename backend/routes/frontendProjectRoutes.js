import express from 'express';
import {
    getAllProjects,
    getProjectBySlug,
    submitProject,
    autoSaveProject,
    createProject,
    updateProject,
    deleteProject
} from '../controllers/frontendProjectController.js';
import { verifyToken as protect, optionalAuth, isAdmin as admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getAllProjects);
router.get('/:slug', optionalAuth, getProjectBySlug);
router.post('/submit', protect, submitProject);
router.post('/autosave', protect, autoSaveProject);

// Admin Routes
router.post('/', protect, admin, createProject);
router.put('/:id', protect, admin, updateProject);
router.delete('/:id', protect, admin, deleteProject);

export default router;
