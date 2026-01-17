// routes/profileRoutes.js
import express from "express";
import {
  getMyProfile,
  getProfileById,
  updateProfile,
  getMyHeatmap,
  getHeatmapById,
  updatePassword,
  getMyProfiles
} from "../controllers/profileController.js";
import { verifyToken, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * OWN PROFILE ROUTES (requires authentication)
 */
router.get("/", verifyToken, getMyProfile); // GET /api/profile
router.get("/heatmap", verifyToken, getMyHeatmap); // GET /api/profile/heatmap
router.put("/update", verifyToken, updateProfile); // PUT /api/profile/update
router.put("/password", verifyToken, updatePassword); // PUT /api/profile/password

/**
 * PUBLIC PROFILE ROUTES (other users)
 */
router.get("/me", verifyToken, getMyProfiles);  // GET /api/profile/me
router.get("/:userId", optionalAuth, getProfileById); // GET /api/profile/:userId
router.get("/:userId/heatmap", getHeatmapById); // GET /api/profile/:userId/heatmap

export default router;