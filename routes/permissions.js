import express from 'express';
import { protect } from '../middleware/auth.js';
import { checkPermission } from '../middleware/checkPermission.js';

const router = express.Router();

// Get all permissions
router.get('/', protect, async (req, res) => {
    try {
        const pool = (await import('../config/db.js')).default;
        const [permissions] = await pool.query('SELECT * FROM permissions ORDER BY permission_name');
        res.json({ success: true, data: permissions });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching permissions',
            error: error.message
        });
    }
});

// Get all modules
router.get('/modules', protect, async (req, res) => {
    try {
        const pool = (await import('../config/db.js')).default;
        const [modules] = await pool.query('SELECT * FROM modules ORDER BY module_name');
        res.json({ success: true, data: modules });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching modules',
            error: error.message
        });
    }
});

export default router;
