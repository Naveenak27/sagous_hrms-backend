import express from 'express';
import { syncAttendanceData, fullSyncAttendance, getSyncStatus } from '../controllers/syncController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Sync new records only
router.post('/attendance', protect, syncAttendanceData);

// Full sync (initial import)
router.post('/attendance/full', protect, fullSyncAttendance);

// Get sync status
router.get('/status', protect, getSyncStatus);

export default router;
