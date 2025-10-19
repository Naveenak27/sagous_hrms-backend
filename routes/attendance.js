// // import express from 'express';
// // import {
// //     getMyAttendance,
// //     getAllAttendance,
// //     getAttendanceSummary,
// // } from '../controllers/attendanceController.js';
// // import { protect } from '../middleware/auth.js';
// // import { checkPermission } from '../middleware/checkPermission.js';

// // const router = express.Router();

// // // Get my attendance (all roles)
// // router.get('/my-attendance', protect, getMyAttendance);

// // // Get all attendance (HR/Manager/Superadmin only)
// // router.get('/all', protect, checkPermission('attendance', 'view'), getAllAttendance);

// // // Get attendance summary (HR/Manager/Superadmin only)
// // router.get('/summary', protect, checkPermission('attendance', 'view'), getAttendanceSummary);

// // export default router;




// import express from 'express';
// import {
//     getMyAttendance,
//     getAllAttendance,
//     getAttendanceSummary,
// } from '../controllers/attendanceController.js';
// import {
//     syncAttendanceData,
//     fullSyncAttendance,
//     getSyncStatus,
//     autoSyncLatest,
//     syncByDateRange
// } from '../controllers/syncController.js';
// import { protect } from '../middleware/auth.js';
// import { checkPermission } from '../middleware/checkPermission.js';

// const router = express.Router();

// // ============================================
// // ATTENDANCE ROUTES
// // ============================================

// // Get my attendance (all roles)
// router.get('/my-attendance', protect, getMyAttendance);

// // Get all attendance (HR/Manager/Superadmin only)
// router.get('/all', protect, checkPermission('attendance', 'view'), getAllAttendance);

// // Get attendance summary (HR/Manager/Superadmin only)
// router.get('/summary', protect, checkPermission('attendance', 'view'), getAttendanceSummary);

// // ============================================
// // SYNC ROUTES (HR/Manager/Superadmin only)
// // ============================================

// // Get sync status
// router.get('/sync/status', protect, checkPermission('attendance', 'view'), getSyncStatus);

// // Incremental sync (sync only new records)
// router.post('/sync', protect, checkPermission('attendance', 'view'), syncAttendanceData);

// // Full sync (sync all records - use ?truncate=true to clear first)
// router.post('/sync/full', protect, checkPermission('attendance', 'view'), fullSyncAttendance);

// // Auto sync latest records (for scheduled tasks)
// router.post('/sync/auto', protect, checkPermission('attendance', 'view'), autoSyncLatest);

// // Sync by date range (use ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD)
// router.post('/sync/range', protect, checkPermission('attendance', 'view'), syncByDateRange);

// export default router;









import express from 'express';
import {
    getMyAttendance,
    getAllAttendance,
    getAttendanceSummary,
    updateAttendanceHours ,getFullEmployeeAttendanceDetails
 // Add this
} from '../controllers/attendanceController.js';
import {
    syncAttendanceData,
    fullSyncAttendance,
    getSyncStatus,
    autoSyncLatest,
    syncByDateRange
} from '../controllers/syncController.js';
import { protect } from '../middleware/auth.js';
import { checkPermission } from '../middleware/checkPermission.js';

const router = express.Router();

// ============================================
// ATTENDANCE ROUTES
// ============================================

// Get my attendance (all roles)
router.get('/my-attendance', protect, getMyAttendance);



router.get('/full-employee-attendance', protect, getFullEmployeeAttendanceDetails);


// Get all attendance (HR/Manager/Superadmin only)
router.get('/all', protect, checkPermission('attendance', 'view'), getAllAttendance);

// Get attendance summary (HR/Manager/Superadmin only)
router.get('/summary', protect, checkPermission('attendance', 'view'), getAttendanceSummary);

// Edit attendance hours (HR/Manager/Superadmin only) - NEW ROUTE
router.put('/edit', protect, checkPermission('attendance', 'view'), updateAttendanceHours);

// ============================================
// SYNC ROUTES (HR/Manager/Superadmin only)
// ============================================

// Get sync status
router.get('/sync/status', protect, checkPermission('attendance', 'view'), getSyncStatus);

// Incremental sync (sync only new records)
router.post('/sync', protect, checkPermission('attendance', 'view'), syncAttendanceData);

// Full sync (sync all records - use ?truncate=true to clear first)
router.post('/sync/full', protect, checkPermission('attendance', 'view'), fullSyncAttendance);

// Auto sync latest records (for scheduled tasks)
router.post('/sync/auto', protect, checkPermission('attendance', 'view'), autoSyncLatest);

// Sync by date range (use ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD)
router.post('/sync/range', protect, checkPermission('attendance', 'view'), syncByDateRange);

export default router;

