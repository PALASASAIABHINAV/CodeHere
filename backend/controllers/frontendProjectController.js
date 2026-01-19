import FrontendProject from '../models/FrontendProject.js';
import FrontendSubmission from '../models/FrontendSubmission.js';

// @desc    Get all frontend projects
// @route   GET /api/frontend-projects
// @access  Public
export const getAllProjects = async (req, res) => {
    try {
        const userId = req.userId; // Defined if optionalAuth is used
        const projects = await FrontendProject.getAll(userId);
        res.status(200).json({
            success: true,
            count: projects.length,
            projects,
        });
    } catch (error) {
        console.error('Get frontend projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

// @desc    Get single frontend project by slug
// @route   GET /api/frontend-projects/:slug
// @access  Public
export const getProjectBySlug = async (req, res) => {
    try {
        const userId = req.userId; // Defined if optionalAuth is used
        const project = await FrontendProject.getBySlug(req.params.slug, userId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }

        res.status(200).json({
            success: true,
            project,
        });
    } catch (error) {
        console.error('Get frontend project error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

export const autoSaveProject = async (req, res) => {
    try {
        const { projectId, code } = req.body;
        await FrontendProject.saveProgress(req.userId, projectId, code);
        res.status(200).json({ success: true, message: 'Progress saved' });
    } catch (error) {
        console.error('Autosave error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Submit a frontend project
// @route   POST /api/frontend-projects/submit
// @access  Private
export const submitProject = async (req, res) => {
    const { projectId, code } = req.body;
    const userId = req.userId; // Protected route uses req.userId from verifyToken

    try {
        const submission = await FrontendSubmission.create({
            userId,
            projectId,
            code,
            status: 'completed' // Explicitly set verified completion status
        });

        res.status(201).json({
            success: true,
            message: 'Project submitted successfully',
            submission,
        });
    } catch (error) {
        console.error('Submit frontend project error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};
