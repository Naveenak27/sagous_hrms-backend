
import express from 'express';
import {
    getAllLeaveTypes,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType
} from '../controllers/leaveTypeController.js';
import { protect } from '../middleware/auth.js';
import { checkPermission } from '../middleware/checkPermission.js';
import pool from '../config/db.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
    try {
        // Get all leave types including inactive for admin view
        const [leaveTypes] = await pool.query(
            'SELECT * FROM leave_types ORDER BY leave_name'
        );
        res.json({ success: true, data: leaveTypes });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching leave types',
            error: error.message
        });
    }
});

router.post('/', protect, checkPermission('leave_types', 'create'), createLeaveType);
router.put('/:id', protect, checkPermission('leave_types', 'edit'), updateLeaveType);
router.delete('/:id', protect, checkPermission('leave_types', 'delete'), deleteLeaveType);

export default router;
