// routes/adminRoutes.js
import express from 'express';
import {
  getAllUsers,
  updateUserRole,
  togglePrime,
  deleteUser,
  createProblem,
  updateProblem,
  deleteProblem,
  getStats
} from '../controllers/adminController.js';
import { verifyToken } from '../middleware/auth.js';
import { verifyAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(verifyToken);
router.use(verifyAdmin);

// User management
router.get('/users', getAllUsers);
router.put('/users/:userId/role', updateUserRole);
router.put('/users/:userId/prime', togglePrime);
router.delete('/users/:userId', deleteUser);

// Problem management
router.post('/problems', createProblem);
router.put('/problems/:problemId', updateProblem);
router.delete('/problems/:problemId', deleteProblem);

// Stats
router.get('/stats', getStats);

export default router;