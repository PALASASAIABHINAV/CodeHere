// controllers/profileController.js
import Profile from "../models/Profile.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

/* -------------------------
   OWN PROFILE
--------------------------*/

// GET /api/profile
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const profile = await Profile.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    const solvedByDifficulty = await Profile.getSolvedByDifficulty(userId);
    const streakData = await Profile.updateStreak(userId);

    res.status(200).json({
      success: true,
      profile: {
        ...profile,
        solved_by_difficulty: solvedByDifficulty,
        ...streakData,
      },
    });
  } catch (err) {
    console.error("Get my profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/profile/update
export const updateProfile = async (req, res) => {
  try {
    const updated = await Profile.updateProfile(req.userId, req.body);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: updated,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/profile/password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const valid = await User.comparePassword(currentPassword, user.password);
    if (!valid) return res.status(401).json({ success: false, message: "Incorrect password" });

    const hash = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(userId, hash);

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Update password error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/profile/heatmap
export const getMyHeatmap = async (req, res) => {
  try {
    const heatmap = await Profile.getHeatmapData(req.userId);
    res.status(200).json({ success: true, heatmap });
  } catch (err) {
    console.error("Get heatmap error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------------
   PUBLIC / OTHER USERS
--------------------------*/

// GET /api/profile/:userId
export const getProfileById = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (req.params.userId === "me") {
  return res.status(400).json({
    success: false,
    message: "Use /api/profile/me instead",
  });
}


    const profile = await Profile.getProfile(userId);
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    const solved = await Profile.getSolvedByDifficulty(userId);
    const streak = await Profile.getStreak(userId);

    res.status(200).json({
      success: true,
      profile: {
        ...profile,
        solved_by_difficulty: solved,
        ...streak,
      },
    });
  } catch (err) {
    console.error("Get profile by id error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/profile/:userId/heatmap
export const getHeatmapById = async (req, res) => {
  try {
    const heatmap = await Profile.getHeatmapData(req.params.userId);
    res.status(200).json({ success: true, heatmap });
  } catch (err) {
    console.error("Get heatmap by id error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMyProfiles = async (req, res) => {
  try {
    const userId = req.userId; // from verifyToken middleware
    const profile = await Profile.getProfile(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      user: profile,
    });
  } catch (error) {
    console.error("Get my profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
