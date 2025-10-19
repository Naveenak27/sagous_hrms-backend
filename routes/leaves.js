// import express from 'express';
// import {
//     applyLeave,
//     getMyLeaves,
//     getPendingLeaves,
//     approveLeave,
//     rejectLeave,
//     getLeaveBalance,
//     getAllLeaves,
//     getLeaveBalanceWithHistory,
//     cancelLeave,
// } from '../controllers/leaveController.js';
// import { protect } from '../middleware/auth.js';
// import { checkPermission } from '../middleware/checkPermission.js';

// const router = express.Router();

// // Apply leave
// router.post('/apply', protect, applyLeave);
// router.get('/balance', getLeaveBalance);

// // NEW: Credit monthly leaves (HR/Admin only)
// router.post('/credit-monthly', getLeaveBalance);


// // Get my leaves
// router.get('/my-leaves', protect, getMyLeaves);

// // Get leave balance (current month)
// router.get('/balance', protect, getLeaveBalance);

// // Get leave balance with history (NEW)
// router.get('/balance-history', protect, getLeaveBalanceWithHistory);

// // Get pending leaves (for approvers)
// router.get('/pending', protect, getPendingLeaves);

// // Get all leaves (HR/Manager)
// router.get('/all', protect, checkPermission('leaves', 'view'), getAllLeaves);

// // Approve leave
// router.put('/:id/approve', protect, checkPermission('leaves', 'approve'), approveLeave);

// // Reject leave
// router.put('/:id/reject', protect, checkPermission('leaves', 'approve'), rejectLeave);

// // Cancel leave (employee can cancel their own pending leave) - NEW
// router.put('/:id/cancel', protect, cancelLeave);


// export default router;


import express from 'express';
import {
    applyLeave,
    getMyLeaves,
    getPendingLeaves,
    approveLeave,
    rejectLeave,
    getLeaveBalance,
    getAllLeaves,
    getLeaveBalanceWithHistory,
    cancelLeave,
} from '../controllers/leaveController.js';
import { protect } from '../middleware/auth.js';
import { checkPermission } from '../middleware/checkPermission.js';
import { creditMonthlyLeaves } from '../controllers/leaveController.js';


// Add this route

const router = express.Router();

// ========== PROTECTED ROUTES - ALL NEED AUTHENTICATION ==========
router.post('/credit-monthly', protect, checkPermission('leaves', 'manage'), creditMonthlyLeaves);


// Apply leave
router.post('/apply', protect, applyLeave);

// Get my leaves
router.get('/my-leaves', protect, getMyLeaves);

// Get leave balance (current month) - SINGLE DEFINITION WITH PROTECT
router.get('/balance', protect, getLeaveBalance);

// Get leave balance with history
router.get('/balance-history', protect, getLeaveBalanceWithHistory);

// Get pending leaves (for approvers)
router.get('/pending', protect, getPendingLeaves);

// Get all leaves (HR/Manager)
router.get('/all-leaves', protect, checkPermission('leaves', 'view'), getAllLeaves);

// Approve leave
router.put('/:id/approve', protect, checkPermission('leaves', 'approve'), approveLeave);

// Reject leave
router.put('/:id/reject', protect, checkPermission('leaves', 'approve'), rejectLeave);

// Cancel leave (employee can cancel their own pending leave)
router.put('/:id/cancel', protect, cancelLeave);

// NOTE: If you need a credit-monthly endpoint, create a proper controller function
// router.post('/credit-monthly', protect, checkPermission('leaves', 'manage'), creditMonthlyLeaves);

export default router;
