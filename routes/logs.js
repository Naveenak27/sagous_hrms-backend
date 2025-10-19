


import express from 'express';
import { 
    getAllAttendance, 
    sendDailyReport,
    sendIndividualReports  // ✅ Add this
} from '../controllers/mailattendanceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/attendance', protect, getAllAttendance);
router.post('/attendance/send-report', protect, sendDailyReport); // HR report
router.post('/attendance/send-individual-reports', protect, sendIndividualReports); // ✅ Individual reports

export default router;

