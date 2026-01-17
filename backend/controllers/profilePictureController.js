import pool from '../config/db.js';
import cloudinary from '../config/cloudinaryConfig.js';

// Upload/Update profile picture
export const uploadProfilePicture = async (req, res) => {
    try {
        const userId = req.userId;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Get user's current profile picture
        const userQuery = 'SELECT profile_picture_public_id, is_prime FROM users WHERE id = $1';
        const userResult = await pool.query(userQuery, [userId]);
        const user = userResult.rows[0];

        // Delete old image from Cloudinary if exists
        if (user.profile_picture_public_id) {
            try {
                await cloudinary.uploader.destroy(user.profile_picture_public_id);
            } catch (error) {
                console.error('Error deleting old image:', error);
            }
        }

        // Update database with new profile picture
        const updateQuery = `
      UPDATE users 
      SET profile_picture_url = $1,
          profile_picture_public_id = $2,
          profile_picture_uploaded_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, name, email, is_prime, profile_picture_url
    `;

        const result = await pool.query(updateQuery, [
            req.file.path,
            req.file.filename,
            userId
        ]);

        res.status(200).json({
            success: true,
            message: 'Profile picture uploaded successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Upload profile picture error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload profile picture'
        });
    }
};

// Delete profile picture
export const deleteProfilePicture = async (req, res) => {
    try {
        const userId = req.userId;

        // Get user info
        const userQuery = 'SELECT profile_picture_public_id, is_prime FROM users WHERE id = $1';
        const userResult = await pool.query(userQuery, [userId]);
        const user = userResult.rows[0];

        // Check if user is Prime
        if (user.is_prime) {
            return res.status(403).json({
                success: false,
                message: 'Prime users cannot delete their profile picture'
            });
        }

        if (!user.profile_picture_public_id) {
            return res.status(400).json({
                success: false,
                message: 'No profile picture to delete'
            });
        }

        // Delete from Cloudinary
        try {
            await cloudinary.uploader.destroy(user.profile_picture_public_id);
        } catch (error) {
            console.error('Error deleting from Cloudinary:', error);
        }

        // Update database
        const updateQuery = `
      UPDATE users 
      SET profile_picture_url = NULL,
          profile_picture_public_id = NULL,
          profile_picture_uploaded_at = NULL
      WHERE id = $1
      RETURNING id, name, email, is_prime
    `;

        const result = await pool.query(updateQuery, [userId]);

        res.status(200).json({
            success: true,
            message: 'Profile picture deleted successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Delete profile picture error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete profile picture'
        });
    }
};

// Get profile picture status
export const getProfilePictureStatus = async (req, res) => {
    try {
        const userId = req.userId;

        const query = 'SELECT is_prime, profile_picture_url FROM users WHERE id = $1';
        const result = await pool.query(query, [userId]);
        const user = result.rows[0];

        res.status(200).json({
            success: true,
            required: user.is_prime && !user.profile_picture_url,
            uploaded: !!user.profile_picture_url,
            isPrime: user.is_prime
        });
    } catch (error) {
        console.error('Get profile picture status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile picture status'
        });
    }
};
