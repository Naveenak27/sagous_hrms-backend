import express from 'express';
import {
    getAllLeaveTypes,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType
} from '../controllers/leaveTypeController.js';
import { protect } from '../middleware/auth.js';
import { checkPermission } from '../middleware/checkPermission.js';

const router = express.Router();

// Get all active leave types (all authenticated users can view)
router.get('/', protect, getAllLeaveTypes);

// Create leave type (HR/Admin only)
router.post('/', protect, checkPermission('leave_types', 'create'), createLeaveType);

// Update leave type (HR/Admin only)
router.put('/:id', protect, checkPermission('leave_types', 'edit'), updateLeaveType);

// Delete leave type (HR/Admin only)
router.delete('/:id', protect, checkPermission('leave_types', 'delete'), deleteLeaveType);

export default router;
