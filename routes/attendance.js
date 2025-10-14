import express from 'express';
import {
    getMyAttendance,
    getAllAttendance,
    getAttendanceSummary,debugLoadAllData
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/auth.js';
import { checkPermission } from '../middleware/checkPermission.js';

const router = express.Router();

router.get('/debug/full', debugLoadAllData);
// Get my attendance (all roles)
router.get('/my-attendance', protect, getMyAttendance);

// Get all attendance (HR/Manager/Superadmin only)
router.get('/all', protect, checkPermission('attendance', 'view'), getAllAttendance);

// Get attendance summary (HR/Manager/Superadmin only)
router.get('/summary', protect, checkPermission('attendance', 'view'), getAttendanceSummary);

export default router;
