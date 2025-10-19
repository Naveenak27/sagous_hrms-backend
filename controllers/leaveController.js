// import pool from '../config/db.js';
// import moment from 'moment';

// export const applyLeave = async (req, res) => {
//     const connection = await pool.getConnection();
//     try {
//         await connection.beginTransaction();

//         const { leave_type_id, from_date, to_date, reason } = req.body;
//         const employee_id = req.user.emp_id;

//         // Calculate number of days
//         const start = moment(from_date);
//         const end = moment(to_date);
//         const number_of_days = end.diff(start, 'days') + 1;

//         // Check leave balance
//         const currentYear = new Date().getFullYear();
//         const [balance] = await connection.query(
//             `SELECT balance FROM leave_balances 
//              WHERE employee_id = ? AND leave_type_id = ? AND year = ?`,
//             [employee_id, leave_type_id, currentYear]
//         );

//         if (balance.length === 0 || balance[0].balance < number_of_days) {
//             await connection.rollback();
//             return res.status(400).json({
//                 success: false,
//                 message: 'Insufficient leave balance'
//             });
//         }

//         // Check for overlapping leaves
//         const [overlapping] = await connection.query(
//             `SELECT * FROM leave_applications
//              WHERE employee_id = ? AND status != 'rejected'
//              AND ((from_date BETWEEN ? AND ?) OR (to_date BETWEEN ? AND ?))`,
//             [employee_id, from_date, to_date, from_date, to_date]
//         );

//         if (overlapping.length > 0) {
//             await connection.rollback();
//             return res.status(400).json({
//                 success: false,
//                 message: 'Leave already applied for this period'
//             });
//         }

//         // Insert leave application
//         const [result] = await connection.query(
//             `INSERT INTO leave_applications 
//              (employee_id, leave_type_id, from_date, to_date, number_of_days, reason, status)
//              VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
//             [employee_id, leave_type_id, from_date, to_date, number_of_days, reason]
//         );

//         await connection.commit();

//         res.status(201).json({
//             success: true,
//             message: 'Leave application submitted successfully',
//             data: { id: result.insertId }
//         });
//     } catch (error) {
//         await connection.rollback();
//         res.status(500).json({
//             success: false,
//             message: 'Error applying leave',
//             error: error.message
//         });
//     } finally {
//         connection.release();
//     }
// };

// export const getMyLeaves = async (req, res) => {
//     try {
//         const [leaves] = await pool.query(
//             `SELECT la.*, lt.leave_name, lt.leave_code,
//                     approver.name as approver_name,
//                     rejector.name as rejector_name
//              FROM leave_applications la
//              JOIN leave_types lt ON la.leave_type_id = lt.id
//              LEFT JOIN employees e_approver ON la.approved_by = e_approver.id
//              LEFT JOIN users approver ON e_approver.user_id = approver.id
//              LEFT JOIN employees e_rejector ON la.rejected_by = e_rejector.id
//              LEFT JOIN users rejector ON e_rejector.user_id = rejector.id
//              WHERE la.employee_id = ?
//              ORDER BY la.applied_date DESC`,
//             [req.user.emp_id]
//         );

//         res.json({
//             success: true,
//             data: leaves
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching leaves',
//             error: error.message
//         });
//     }
// };

// export const getPendingLeaves = async (req, res) => {
//     try {
//         const role = req.user.role_name;
//         const emp_id = req.user.emp_id;

//         let query = '';
//         let params = [];

//         if (role === 'hr' || role === 'superadmin') {
//             // HR and Superadmin can see all pending leaves
//             query = `SELECT la.*, lt.leave_name, lt.leave_code, 
//                             u.name as employee_name, u.employee_id,
//                             rm.name as reporting_manager_name
//                      FROM leave_applications la
//                      JOIN leave_types lt ON la.leave_type_id = lt.id
//                      JOIN employees e ON la.employee_id = e.id
//                      JOIN users u ON e.user_id = u.id
//                      LEFT JOIN employees rme ON e.reporting_manager_id = rme.id
//                      LEFT JOIN users rm ON rme.user_id = rm.id
//                      WHERE la.status = 'pending'
//                      ORDER BY la.applied_date ASC`;
//         } else if (role === 'tl' || role === 'manager') {
//             // TL and Manager can see leaves of their reportees
//             query = `SELECT la.*, lt.leave_name, lt.leave_code, 
//                             u.name as employee_name, u.employee_id
//                      FROM leave_applications la
//                      JOIN leave_types lt ON la.leave_type_id = lt.id
//                      JOIN employees e ON la.employee_id = e.id
//                      JOIN users u ON e.user_id = u.id
//                      WHERE e.reporting_manager_id = ? AND la.status = 'pending'
//                      ORDER BY la.applied_date ASC`;
//             params = [emp_id];
//         } else {
//             return res.json({ success: true, data: [] });
//         }

//         const [leaves] = await pool.query(query, params);

//         res.json({
//             success: true,
//             data: leaves
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching pending leaves',
//             error: error.message
//         });
//     }
// };

// export const approveLeave = async (req, res) => {
//     const connection = await pool.getConnection();
//     try {
//         await connection.beginTransaction();

//         const { id } = req.params;
//         const { comments } = req.body;
//         const approver_id = req.user.emp_id;
//         const approver_role = req.user.role_name;

//         // Get leave application
//         const [leaves] = await connection.query(
//             `SELECT la.*, e.reporting_manager_id 
//              FROM leave_applications la
//              JOIN employees e ON la.employee_id = e.id
//              WHERE la.id = ?`,
//             [id]
//         );

//         if (leaves.length === 0) {
//             await connection.rollback();
//             return res.status(404).json({
//                 success: false,
//                 message: 'Leave application not found'
//             });
//         }

//         const leave = leaves[0];

//         // Check authorization
//         const canApprove = 
//             approver_role === 'hr' || 
//             approver_role === 'superadmin' ||
//             (leave.reporting_manager_id && leave.reporting_manager_id === approver_id);

//         if (!canApprove) {
//             await connection.rollback();
//             return res.status(403).json({
//                 success: false,
//                 message: 'You are not authorized to approve this leave'
//             });
//         }

//         if (leave.status !== 'pending') {
//             await connection.rollback();
//             return res.status(400).json({
//                 success: false,
//                 message: 'Leave has already been processed'
//             });
//         }

//         // Approve the leave
//         await connection.query(
//             `UPDATE leave_applications 
//              SET status = 'approved', 
//                  approved_by = ?, 
//                  approved_at = NOW(), 
//                  approver_comments = ?
//              WHERE id = ?`,
//             [approver_id, comments || null, id]
//         );

//         // Deduct from leave balance
//         const currentYear = new Date().getFullYear();
//         await connection.query(
//             `UPDATE leave_balances 
//              SET used = used + ?, balance = balance - ?
//              WHERE employee_id = ? AND leave_type_id = ? AND year = ?`,
//             [leave.number_of_days, leave.number_of_days, leave.employee_id, leave.leave_type_id, currentYear]
//         );

//         await connection.commit();

//         res.json({
//             success: true,
//             message: 'Leave approved successfully'
//         });
//     } catch (error) {
//         await connection.rollback();
//         res.status(500).json({
//             success: false,
//             message: 'Error approving leave',
//             error: error.message
//         });
//     } finally {
//         connection.release();
//     }
// };

// export const rejectLeave = async (req, res) => {
//     const connection = await pool.getConnection();
//     try {
//         await connection.beginTransaction();

//         const { id } = req.params;
//         const { rejection_reason } = req.body;
//         const rejector_id = req.user.emp_id;
//         const rejector_role = req.user.role_name;

//         const [leaves] = await connection.query(
//             `SELECT la.*, e.reporting_manager_id 
//              FROM leave_applications la
//              JOIN employees e ON la.employee_id = e.id
//              WHERE la.id = ?`,
//             [id]
//         );

//         if (leaves.length === 0) {
//             await connection.rollback();
//             return res.status(404).json({
//                 success: false,
//                 message: 'Leave application not found'
//             });
//         }

//         const leave = leaves[0];

//         const canReject = 
//             rejector_role === 'hr' || 
//             rejector_role === 'superadmin' ||
//             (leave.reporting_manager_id && leave.reporting_manager_id === rejector_id);

//         if (!canReject) {
//             await connection.rollback();
//             return res.status(403).json({
//                 success: false,
//                 message: 'You are not authorized to reject this leave'
//             });
//         }

//         if (leave.status !== 'pending') {
//             await connection.rollback();
//             return res.status(400).json({
//                 success: false,
//                 message: 'Leave has already been processed'
//             });
//         }

//         await connection.query(
//             `UPDATE leave_applications 
//              SET status = 'rejected', 
//                  rejected_by = ?, 
//                  rejected_at = NOW(), 
//                  rejection_reason = ?
//              WHERE id = ?`,
//             [rejector_id, rejection_reason || 'No reason provided', id]
//         );

//         await connection.commit();

//         res.json({
//             success: true,
//             message: 'Leave rejected successfully'
//         });
//     } catch (error) {
//         await connection.rollback();
//         res.status(500).json({
//             success: false,
//             message: 'Error rejecting leave',
//             error: error.message
//         });
//     } finally {
//         connection.release();
//     }
// };

// export const getLeaveBalance = async (req, res) => {
//     try {
//         const currentYear = new Date().getFullYear();
//         const [balances] = await pool.query(
//             `SELECT lb.*, lt.leave_name, lt.leave_code
//              FROM leave_balances lb
//              JOIN leave_types lt ON lb.leave_type_id = lt.id
//              WHERE lb.employee_id = ? AND lb.year = ?`,
//             [req.user.emp_id, currentYear]
//         );

//         res.json({
//             success: true,
//             data: balances
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching leave balance',
//             error: error.message
//         });
//     }
// };

// export const getAllLeaves = async (req, res) => {
//     try {
//         const [leaves] = await pool.query(
//             `SELECT la.*, lt.leave_name, lt.leave_code, 
//                     u.name as employee_name, u.employee_id,
//                     approver.name as approver_name,
//                     rejector.name as rejector_name
//              FROM leave_applications la
//              JOIN leave_types lt ON la.leave_type_id = lt.id
//              JOIN employees e ON la.employee_id = e.id
//              JOIN users u ON e.user_id = u.id
//              LEFT JOIN employees e_approver ON la.approved_by = e_approver.id
//              LEFT JOIN users approver ON e_approver.user_id = approver.id
//              LEFT JOIN employees e_rejector ON la.rejected_by = e_rejector.id
//              LEFT JOIN users rejector ON e_rejector.user_id = rejector.id
//              ORDER BY la.applied_date DESC`
//         );

//         res.json({
//             success: true,
//             data: leaves
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching leaves',
//             error: error.message
//         });
//     }
// };




import pool from '../config/db.js';
import { sendLeaveApprovalEmail, sendLeaveRejectionEmail, sendLeaveApplicationNotification } from '../utils/emailService.js';
import moment from 'moment';

import { creditMonthlyLeavesForAll } from '../jobs/leaveBalanceCron.js';

// Manual trigger for HR/Admin



// export const applyLeave = async (req, res) => {
//     const connection = await pool.getConnection();
//     try {
//         await connection.beginTransaction();

//         const { leave_type_id, from_date, to_date, reason, is_half_day } = req.body;
//         const employee_id = req.user.emp_id;

//         // Calculate number of days
//         const start = moment(from_date);
//         const end = moment(to_date);
//         let number_of_days = end.diff(start, 'days') + 1;

//         if (is_half_day) {
//             number_of_days = 0.5;
//         }

//         // Check leave balance from the MONTH OF THE LEAVE (not current month)
//         const leaveYear = moment(from_date).year();
//         const leaveMonth = moment(from_date).month() + 1;

//         const [balance] = await connection.query(
//             `SELECT balance FROM leave_balances 
//              WHERE employee_id = ? AND leave_type_id = ? AND year = ? AND month = ?`,
//             [employee_id, leave_type_id, leaveYear, leaveMonth]
//         );

//         if (balance.length === 0 || balance[0].balance < number_of_days) {
//             await connection.rollback();
//             return res.status(400).json({
//                 success: false,
//                 message: 'Insufficient leave balance for the selected period',
//                 available: balance[0]?.balance || 0,
//                 required: number_of_days
//             });
//         }

//         // Check for overlapping leaves (exclude cancelled and rejected)
//         const [overlapping] = await connection.query(
//             `SELECT * FROM leave_applications
//              WHERE employee_id = ? AND status IN ('pending', 'approved')
//              AND ((from_date BETWEEN ? AND ?) OR (to_date BETWEEN ? AND ?) 
//                   OR (? BETWEEN from_date AND to_date) OR (? BETWEEN from_date AND to_date))`,
//             [employee_id, from_date, to_date, from_date, to_date, from_date, to_date]
//         );

//         if (overlapping.length > 0) {
//             await connection.rollback();
//             return res.status(400).json({
//                 success: false,
//                 message: 'Leave already applied for this period'
//             });
//         }

//         // Insert leave application (balance will be deducted ONLY on approval)
//         const [result] = await connection.query(
//             `INSERT INTO leave_applications 
//              (employee_id, leave_type_id, from_date, to_date, number_of_days, is_half_day, reason, status)
//              VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
//             [employee_id, leave_type_id, from_date, to_date, number_of_days, is_half_day || false, reason]
//         );

//         await connection.commit();

//         res.status(201).json({
//             success: true,
//             message: 'Leave application submitted successfully. Balance will be deducted upon approval.',
//             data: { id: result.insertId }
//         });
//     } catch (error) {
//         await connection.rollback();
//         res.status(500).json({
//             success: false,
//             message: 'Error applying leave',
//             error: error.message
//         });
//     } finally {
//         connection.release();
//     }
// };


// Updated applyLeave function
export const applyLeave = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { leave_type_id, from_date, to_date, reason, is_half_day, od_start_time, od_end_time, od_hours } = req.body;
        const employee_id = req.user.emp_id;

        // Get leave type to check if it's OD
        const [leaveType] = await connection.query(
            'SELECT leave_code FROM leave_types WHERE id = ?',
            [leave_type_id]
        );

        const isOverDuty = leaveType[0]?.leave_code?.toUpperCase() === 'OD';

        // Calculate number of days
        const start = moment(from_date);
        const end = moment(to_date);
        let number_of_days = end.diff(start, 'days') + 1;

        if (is_half_day) {
            number_of_days = 0.5;
        } else if (isOverDuty) {
            number_of_days = 0; // OD doesn't consume leave days
        }

        // For non-OD leaves, check leave balance
        if (!isOverDuty) {
            const leaveYear = moment(from_date).year();
            const leaveMonth = moment(from_date).month() + 1;

            const [balance] = await connection.query(
                `SELECT balance FROM leave_balances 
                 WHERE employee_id = ? AND leave_type_id = ? AND year = ? AND month = ?`,
                [employee_id, leave_type_id, leaveYear, leaveMonth]
            );

            if (balance.length === 0 || balance[0].balance < number_of_days) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient leave balance for the selected period',
                    available: balance[0]?.balance || 0,
                    required: number_of_days
                });
            }

            // Check for overlapping leaves
            const [overlapping] = await connection.query(
                `SELECT * FROM leave_applications
                 WHERE employee_id = ? AND status IN ('pending', 'approved')
                 AND ((from_date BETWEEN ? AND ?) OR (to_date BETWEEN ? AND ?) 
                      OR (? BETWEEN from_date AND to_date) OR (? BETWEEN from_date AND to_date))`,
                [employee_id, from_date, to_date, from_date, to_date, from_date, to_date]
            );

            if (overlapping.length > 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Leave already applied for this period'
                });
            }
        }

        // Insert leave application
        const [result] = await connection.query(
            `INSERT INTO leave_applications 
             (employee_id, leave_type_id, from_date, to_date, number_of_days, is_half_day, 
              od_start_time, od_end_time, od_hours, reason, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [employee_id, leave_type_id, from_date, to_date, number_of_days, is_half_day || false, 
             od_start_time || null, od_end_time || null, od_hours || null, reason]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: isOverDuty 
                ? 'Over Duty application submitted successfully' 
                : 'Leave application submitted successfully. Balance will be deducted upon approval.',
            data: { id: result.insertId }
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            success: false,
            message: 'Error applying leave',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Updated approveLeave function - WITH OD ATTENDANCE EDIT








// export const getMyLeaves = async (req, res) => {
//     try {
//         const [leaves] = await pool.query(
//             `SELECT la.*, 
//                     lt.leave_name, 
//                     lt.leave_code,
//                     approver.name as approver_name,
//                     rejector.name as rejector_name,
//                     rm.name as reporting_manager_name
//              FROM leave_applications la
//              JOIN leave_types lt ON la.leave_type_id = lt.id
//              JOIN employees e ON la.employee_id = e.id
//              LEFT JOIN employees e_approver ON la.approved_by = e_approver.id
//              LEFT JOIN users approver ON e_approver.user_id = approver.id
//              LEFT JOIN employees e_rejector ON la.rejected_by = e_rejector.id
//              LEFT JOIN users rejector ON e_rejector.user_id = rejector.id
//              LEFT JOIN employees rme ON e.reporting_manager_id = rme.id
//              LEFT JOIN users rm ON rme.user_id = rm.id
//              WHERE la.employee_id = ?
//              ORDER BY la.applied_date DESC`,
//             [req.user.emp_id]
//         );

//         res.json({
//             success: true,
//             data: leaves
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching leaves',
//             error: error.message
//         });
//     }
// };


// export const getPendingLeaves = async (req, res) => {
//     try {
//         const role = req.user.role_name;
//         const emp_id = req.user.emp_id;

//         let query = '';
//         let params = [];

//         if (role === 'hr' || role === 'superadmin') {
//             query = `SELECT la.*, lt.leave_name, lt.leave_code, 
//                             u.name as employee_name, u.employee_id,
//                             rm.name as reporting_manager_name
//                      FROM leave_applications la
//                      JOIN leave_types lt ON la.leave_type_id = lt.id
//                      JOIN employees e ON la.employee_id = e.id
//                      JOIN users u ON e.user_id = u.id
//                      LEFT JOIN employees rme ON e.reporting_manager_id = rme.id
//                      LEFT JOIN users rm ON rme.user_id = rm.id
//                      WHERE la.status = 'pending'
//                      ORDER BY la.applied_date ASC`;
//         } else if (role === 'tl' || role === 'manager') {
//             query = `SELECT la.*, lt.leave_name, lt.leave_code, 
//                             u.name as employee_name, u.employee_id
//                      FROM leave_applications la
//                      JOIN leave_types lt ON la.leave_type_id = lt.id
//                      JOIN employees e ON la.employee_id = e.id
//                      JOIN users u ON e.user_id = u.id
//                      WHERE e.reporting_manager_id = ? AND la.status = 'pending'
//                      ORDER BY la.applied_date ASC`;
//             params = [emp_id];
//         } else {
//             return res.json({ success: true, data: [] });
//         }

//         const [leaves] = await pool.query(query, params);

//         res.json({
//             success: true,
//             data: leaves
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching pending leaves',
//             error: error.message
//         });
//     }
// };


export const approveLeave = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { comments } = req.body;
        const approver_id = req.user.emp_id;
        const approver_role = req.user.role_name;

        // Get leave application with employee details
        const [leaves] = await connection.query(
            `SELECT la.*, e.reporting_manager_id, e.user_id,
                    lt.leave_name, lt.leave_code,
                    emp_user.email as employee_email,
                    emp_user.name as employee_name,
                    emp_user.employee_id as emp_employee_id
             FROM leave_applications la
             JOIN employees e ON la.employee_id = e.id
             JOIN leave_types lt ON la.leave_type_id = lt.id
             JOIN users emp_user ON e.user_id = emp_user.id
             WHERE la.id = ?`,
            [id]
        );

        if (leaves.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Leave application not found'
            });
        }

        const leave = leaves[0];

        // Check authorization
        const canApprove = 
            approver_role === 'hr' || 
            approver_role === 'superadmin' ||
            (leave.reporting_manager_id && leave.reporting_manager_id === approver_id);

        if (!canApprove) {
            await connection.rollback();
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to approve this leave'
            });
        }

        if (leave.status !== 'pending') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Leave has already been processed'
            });
        }

        // Check if it's Over Duty
        const isOverDuty = leave.leave_code?.toUpperCase() === 'OD';

        // Approve the leave
        await connection.query(
            `UPDATE leave_applications 
             SET status = 'approved', 
                 approved_by = ?, 
                 approved_at = NOW(), 
                 approver_comments = ?
             WHERE id = ?`,
            [approver_id, comments || null, id]
        );

if (isOverDuty && leave.od_hours) {
    const odDate = moment(leave.from_date).format('YYYY-MM-DD');
    const employeeCode = leave.emp_employee_id;

    console.log('🔍 DEBUG OD Approval:');
    console.log('Employee Code:', employeeCode);
    console.log('OD Date:', odDate);
    console.log('OD Hours to Add:', leave.od_hours);

    // Get all punch logs
    const [punchLogs] = await connection.query(
        `SELECT id, log_date, log_time, direction, log_date_time
         FROM attendance_logs 
         WHERE employee_code = ? AND log_date = ?
         ORDER BY id ASC`,
        [employeeCode, odDate]
    );

    console.log('📋 Punch Logs Found:', punchLogs.length);

    // Calculate actual worked hours - handle all punch pairs
    let actualWorkedHours = 0;
    let inPunch = null;
    
    for (let i = 0; i < punchLogs.length; i++) {
        const log = punchLogs[i];
        const isIn = log.direction === 1 || log.direction === '1' || log.direction === 'in';
        const isOut = log.direction === 0 || log.direction === '0' || log.direction === 'out';
        
        if (isIn && !inPunch) {
            // Found an IN punch
            inPunch = log;
        } else if (isOut && inPunch) {
            // Found an OUT punch with a previous IN punch
            const inTime = moment(inPunch.log_date_time);
            const outTime = moment(log.log_date_time);
            const hoursDiff = outTime.diff(inTime, 'hours', true);
            actualWorkedHours += hoursDiff;
            console.log(`⏱️ IN ${inTime.format('HH:mm')} → OUT ${outTime.format('HH:mm')} = ${hoursDiff.toFixed(2)}h`);
            inPunch = null; // Reset for next pair
        }
    }

    console.log('💼 Total Actual Worked Hours:', actualWorkedHours.toFixed(2));

    // Check existing edited record
    const [existing] = await connection.query(
        `SELECT id, old_hours, new_hours, reason FROM attendance_edited 
         WHERE employee_code = ? AND date = ?`,
        [employeeCode, odDate]
    );

    if (existing.length > 0) {
        // Update existing record - ADD OD hours
        const currentNewHours = parseFloat(existing[0].new_hours);
        const updatedHours = currentNewHours + parseFloat(leave.od_hours);
        
        await connection.query(
            `UPDATE attendance_edited 
             SET new_hours = ?, 
                 reason = CONCAT(IFNULL(reason, ''), ' | OD +', ?, 'h: ', ?), 
                 modified_by = ?, 
                 modified_at = NOW()
             WHERE id = ?`,
            [updatedHours, leave.od_hours, comments || 'Over Duty', approver_id, existing[0].id]
        );

        console.log(`✅ UPDATED: ${currentNewHours}h + ${leave.od_hours}h = ${updatedHours}h`);
    } else {
        // Insert new record - actual hours + OD hours
        const newTotalHours = actualWorkedHours + parseFloat(leave.od_hours);
        
        await connection.query(
            `INSERT INTO attendance_edited 
             (employee_code, date, old_hours, new_hours, reason, modified_by, modified_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
                employeeCode, 
                odDate, 
                actualWorkedHours.toFixed(2),
                newTotalHours.toFixed(2),
                `OD Approved +${leave.od_hours}h: ${comments || 'Over Duty'}`, 
                approver_id
            ]
        );

        console.log(`✅ INSERTED: actual=${actualWorkedHours.toFixed(2)}h + OD=${leave.od_hours}h = total=${newTotalHours.toFixed(2)}h`);
    }
}
        
        
        
        
        
        else {
            // Deduct from leave balance for regular leaves
            const leaveDate = moment(leave.from_date);
            const leaveYear = leaveDate.year();
            const leaveMonth = leaveDate.month() + 1;

            await connection.query(
                `UPDATE leave_balances 
                 SET used = used + ?, balance = balance - ?
                 WHERE employee_id = ? AND leave_type_id = ? AND year = ? AND month = ?`,
                [leave.number_of_days, leave.number_of_days, leave.employee_id, leave.leave_type_id, leaveYear, leaveMonth]
            );
        }

        await connection.commit();

        // Send approval email
        const employeeData = {
            email: leave.employee_email,
            name: leave.employee_name
        };

        const leaveData = {
            leave_name: leave.leave_name,
            from_date: leave.from_date,
            to_date: leave.to_date,
            number_of_days: leave.number_of_days,
            is_half_day: leave.is_half_day,
            od_hours: leave.od_hours,
            approver_comments: comments
        };

        const approverData = {
            name: req.user.name
        };

        sendLeaveApprovalEmail(employeeData, leaveData, approverData).catch(err => {
            console.error('Failed to send approval email:', err);
        });

        res.json({
            success: true,
            message: isOverDuty 
                ? `Over Duty approved: ${leave.od_hours} hours added to attendance` 
                : 'Leave approved successfully and notification email sent'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error approving leave:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving leave',
            error: error.message
        });
    } finally {
        connection.release();
    }
};



export const rejectLeave = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { rejection_reason } = req.body;
        const rejector_id = req.user.emp_id;
        const rejector_role = req.user.role_name;

        // Get leave application with employee details
        const [leaves] = await connection.query(
            `SELECT la.*, e.reporting_manager_id,
                    lt.leave_name, lt.leave_code,
                    emp_user.email as employee_email,
                    emp_user.name as employee_name
             FROM leave_applications la
             JOIN employees e ON la.employee_id = e.id
             JOIN leave_types lt ON la.leave_type_id = lt.id
             JOIN users emp_user ON e.user_id = emp_user.id
             WHERE la.id = ?`,
            [id]
        );

        if (leaves.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Leave application not found'
            });
        }

        const leave = leaves[0];

        const canReject = 
            rejector_role === 'hr' || 
            rejector_role === 'superadmin' ||
            (leave.reporting_manager_id && leave.reporting_manager_id === rejector_id);

        if (!canReject) {
            await connection.rollback();
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to reject this leave'
            });
        }

        if (leave.status !== 'pending') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Leave has already been processed'
            });
        }

        await connection.query(
            `UPDATE leave_applications 
             SET status = 'rejected', 
                 rejected_by = ?, 
                 rejected_at = NOW(), 
                 rejection_reason = ?
             WHERE id = ?`,
            [rejector_id, rejection_reason || 'No reason provided', id]
        );

        await connection.commit();

        // Send rejection email
        const employeeData = {
            email: leave.employee_email,
            name: leave.employee_name
        };

        const leaveData = {
            leave_name: leave.leave_name,
            from_date: leave.from_date,
            to_date: leave.to_date,
            number_of_days: leave.number_of_days,
            rejection_reason: rejection_reason || 'No reason provided'
        };

        const rejectorData = {
            name: req.user.name
        };

        // Send email (don't wait for it)
        sendLeaveRejectionEmail(employeeData, leaveData, rejectorData).catch(err => {
            console.error('Failed to send rejection email:', err);
        });

        res.json({
            success: true,
            message: 'Leave rejected successfully and notification email sent'
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            success: false,
            message: 'Error rejecting leave',
            error: error.message
        });
    } finally {
        connection.release();
    }
};


// export const approveLeave = async (req, res) => {
//     const connection = await pool.getConnection();
//     try {
//         await connection.beginTransaction();

//         const { id } = req.params;
//         const { comments } = req.body;
//         const approver_id = req.user.emp_id;
//         const approver_role = req.user.role_name;

//         // Get leave application
//         const [leaves] = await connection.query(
//             `SELECT la.*, e.reporting_manager_id 
//              FROM leave_applications la
//              JOIN employees e ON la.employee_id = e.id
//              WHERE la.id = ?`,
//             [id]
//         );

//         if (leaves.length === 0) {
//             await connection.rollback();
//             return res.status(404).json({
//                 success: false,
//                 message: 'Leave application not found'
//             });
//         }

//         const leave = leaves[0];

//         // Check authorization
//         const canApprove = 
//             approver_role === 'hr' || 
//             approver_role === 'superadmin' ||
//             (leave.reporting_manager_id && leave.reporting_manager_id === approver_id);

//         if (!canApprove) {
//             await connection.rollback();
//             return res.status(403).json({
//                 success: false,
//                 message: 'You are not authorized to approve this leave'
//             });
//         }

//         if (leave.status !== 'pending') {
//             await connection.rollback();
//             return res.status(400).json({
//                 success: false,
//                 message: 'Leave has already been processed'
//             });
//         }

//         // Approve the leave
//         await connection.query(
//             `UPDATE leave_applications 
//              SET status = 'approved', 
//                  approved_by = ?, 
//                  approved_at = NOW(), 
//                  approver_comments = ?
//              WHERE id = ?`,
//             [approver_id, comments || null, id]
//         );

//         // Deduct from leave balance (from CURRENT MONTH when leave was applied)
//         const leaveDate = moment(leave.from_date);
//         const leaveYear = leaveDate.year();
//         const leaveMonth = leaveDate.month() + 1;

//         await connection.query(
//             `UPDATE leave_balances 
//              SET used = used + ?, balance = balance - ?
//              WHERE employee_id = ? AND leave_type_id = ? AND year = ? AND month = ?`,
//             [leave.number_of_days, leave.number_of_days, leave.employee_id, leave.leave_type_id, leaveYear, leaveMonth]
//         );

//         await connection.commit();

//         res.json({
//             success: true,
//             message: 'Leave approved successfully'
//         });
//     } catch (error) {
//         await connection.rollback();
//         res.status(500).json({
//             success: false,
//             message: 'Error approving leave',
//             error: error.message
//         });
//     } finally {
//         connection.release();
//     }
// };

// export const rejectLeave = async (req, res) => {
//     const connection = await pool.getConnection();
//     try {
//         await connection.beginTransaction();

//         const { id } = req.params;
//         const { rejection_reason } = req.body;
//         const rejector_id = req.user.emp_id;
//         const rejector_role = req.user.role_name;

//         const [leaves] = await connection.query(
//             `SELECT la.*, e.reporting_manager_id 
//              FROM leave_applications la
//              JOIN employees e ON la.employee_id = e.id
//              WHERE la.id = ?`,
//             [id]
//         );

//         if (leaves.length === 0) {
//             await connection.rollback();
//             return res.status(404).json({
//                 success: false,
//                 message: 'Leave application not found'
//             });
//         }

//         const leave = leaves[0];

//         const canReject = 
//             rejector_role === 'hr' || 
//             rejector_role === 'superadmin' ||
//             (leave.reporting_manager_id && leave.reporting_manager_id === rejector_id);

//         if (!canReject) {
//             await connection.rollback();
//             return res.status(403).json({
//                 success: false,
//                 message: 'You are not authorized to reject this leave'
//             });
//         }

//         if (leave.status !== 'pending') {
//             await connection.rollback();
//             return res.status(400).json({
//                 success: false,
//                 message: 'Leave has already been processed'
//             });
//         }

//         await connection.query(
//             `UPDATE leave_applications 
//              SET status = 'rejected', 
//                  rejected_by = ?, 
//                  rejected_at = NOW(), 
//                  rejection_reason = ?
//              WHERE id = ?`,
//             [rejector_id, rejection_reason || 'No reason provided', id]
//         );

//         await connection.commit();

//         res.json({
//             success: true,
//             message: 'Leave rejected successfully'
//         });
//     } catch (error) {
//         await connection.rollback();
//         res.status(500).json({
//             success: false,
//             message: 'Error rejecting leave',
//             error: error.message
//         });
//     } finally {
//         connection.release();
//     }
// };




export const getLeaveBalance = async (req, res) => {
    try {
        const currentYear = moment().year();
        const currentMonth = moment().month() + 1;

        // DEBUG: Check what we're searching for
        console.log('====== DEBUG getLeaveBalance ======');
        console.log('req.user:', req.user);
        console.log('req.user.emp_id:', req.user.emp_id);
        console.log('Searching for Year:', currentYear, 'Month:', currentMonth);

        const [balances] = await pool.query(
            `SELECT lb.*, lt.leave_name, lt.leave_code, lt.is_carry_forward
             FROM leave_balances lb
             JOIN leave_types lt ON lb.leave_type_id = lt.id
             WHERE lb.employee_id = ? AND lb.year = ? AND lb.month = ?
             ORDER BY lt.leave_code`,
            [req.user.emp_id, currentYear, currentMonth]
        );

        console.log('Query returned:', balances.length, 'records');
        console.log('Balances:', balances);

        res.json({
            success: true,
            data: balances,
            year: currentYear,
            month: currentMonth
        });
    } catch (error) {
        console.error('Error in getLeaveBalance:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leave balance',
            error: error.message
        });
    }
};


export const creditMonthlyLeaves = async (req, res) => {
    try {
        const result = await creditMonthlyLeavesForAll();
        
        if (result.success) {
            res.json({
                success: true,
                message: `Monthly leaves credited successfully! ${result.totalCredited} records created for ${result.employeesProcessed} employees.`,
                data: result
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error crediting monthly leaves',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Manual credit error:', error);
        res.status(500).json({
            success: false,
            message: 'Error crediting monthly leaves',
            error: error.message
        });
    }
};




export const getAllLeaves = async (req, res) => {
    try {
        const [leaves] = await pool.query(
            `SELECT la.*, lt.leave_name, lt.leave_code, 
                    u.name as employee_name, u.employee_id,
                    approver.name as approver_name,
                    rejector.name as rejector_name
             FROM leave_applications la
             JOIN leave_types lt ON la.leave_type_id = lt.id
             JOIN employees e ON la.employee_id = e.id
             JOIN users u ON e.user_id = u.id
             LEFT JOIN employees e_approver ON la.approved_by = e_approver.id
             LEFT JOIN users approver ON e_approver.user_id = approver.id
             LEFT JOIN employees e_rejector ON la.rejected_by = e_rejector.id
             LEFT JOIN users rejector ON e_rejector.user_id = rejector.id
             ORDER BY la.applied_date DESC`
        );

        res.json({
            success: true,
            data: leaves
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching leaves',
            error: error.message
        });
    }
};

// NEW: Get leave balance with history
export const getLeaveBalanceWithHistory = async (req, res) => {
    try {
        const currentYear = moment().year();
        const currentMonth = moment().month() + 1;
        const employee_id = req.user.emp_id;

        // Get current month balance
        const [currentBalance] = await pool.query(
            `SELECT lb.*, lt.leave_name, lt.leave_code, lt.is_carry_forward
             FROM leave_balances lb
             JOIN leave_types lt ON lb.leave_type_id = lt.id
             WHERE lb.employee_id = ? AND lb.year = ? AND lb.month = ?
             ORDER BY lt.leave_code`,
            [employee_id, currentYear, currentMonth]
        );

        // Get history for current year
        const [history] = await pool.query(
            `SELECT lb.month, lt.leave_code, lt.leave_name, 
                    lb.opening_balance, lb.carried_forward, lb.credited, lb.used, lb.balance
             FROM leave_balances lb
             JOIN leave_types lt ON lb.leave_type_id = lt.id
             WHERE lb.employee_id = ? AND lb.year = ?
             ORDER BY lb.month DESC, lt.leave_code`,
            [employee_id, currentYear]
        );

        res.json({
            success: true,
            current_balance: currentBalance,
            history: history,
            year: currentYear,
            month: currentMonth
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching leave balance',
            error: error.message
        });
    }
};

// NEW: Cancel leave (if status is pending)
export const cancelLeave = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const employee_id = req.user.emp_id;

        const [leaves] = await connection.query(
            `SELECT * FROM leave_applications WHERE id = ? AND employee_id = ?`,
            [id, employee_id]
        );

        if (leaves.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Leave application not found'
            });
        }

        const leave = leaves[0];

        // Only pending or approved leaves can be cancelled
        if (!['pending', 'approved'].includes(leave.status)) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'This leave cannot be cancelled'
            });
        }

        // If leave was approved, return the balance
        if (leave.status === 'approved') {
            const leaveYear = moment(leave.from_date).year();
            const leaveMonth = moment(leave.from_date).month() + 1;

            await connection.query(
                `UPDATE leave_balances 
                 SET used = used - ?, balance = balance + ?
                 WHERE employee_id = ? AND leave_type_id = ? AND year = ? AND month = ?`,
                [leave.number_of_days, leave.number_of_days, leave.employee_id, leave.leave_type_id, leaveYear, leaveMonth]
            );
        }

        await connection.query(
            `UPDATE leave_applications 
             SET status = 'cancelled', cancelled_at = NOW() 
             WHERE id = ?`,
            [id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: leave.status === 'approved' 
                ? 'Leave cancelled and balance restored' 
                : 'Leave cancelled successfully'
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            success: false,
            message: 'Error cancelling leave',
            error: error.message
        });
    } finally {
        connection.release();
    }
};




export const getMyLeaves = async (req, res) => {
    try {
        const [leaves] = await pool.query(
            `SELECT la.*, 
                    lt.leave_name, 
                    lt.leave_code,
                    approver.name as approver_name,
                    rejector.name as rejector_name,
                    rm.name as reporting_manager_name
             FROM leave_applications la
             JOIN leave_types lt ON la.leave_type_id = lt.id
             JOIN employees e ON la.employee_id = e.id
             LEFT JOIN employees e_approver ON la.approved_by = e_approver.id
             LEFT JOIN users approver ON e_approver.user_id = approver.id
             LEFT JOIN employees e_rejector ON la.rejected_by = e_rejector.id
             LEFT JOIN users rejector ON e_rejector.user_id = rejector.id
             LEFT JOIN employees rme ON e.reporting_manager_id = rme.id
             LEFT JOIN users rm ON rme.user_id = rm.id
             WHERE la.employee_id = ?
             ORDER BY la.applied_date DESC`,
            [req.user.emp_id]
        );

        res.json({
            success: true,
            data: leaves
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching leaves',
            error: error.message
        });
    }
};

export const getPendingLeaves = async (req, res) => {
    try {
        const role = req.user.role_name;
        const emp_id = req.user.emp_id;

        let query = '';
        let params = [];

        if (role === 'hr' || role === 'superadmin') {
            query = `SELECT la.*, lt.leave_name, lt.leave_code, 
                            u.name as employee_name, u.employee_id,
                            rm.name as reporting_manager_name
                     FROM leave_applications la
                     JOIN leave_types lt ON la.leave_type_id = lt.id
                     JOIN employees e ON la.employee_id = e.id
                     JOIN users u ON e.user_id = u.id
                     LEFT JOIN employees rme ON e.reporting_manager_id = rme.id
                     LEFT JOIN users rm ON rme.user_id = rm.id
                     WHERE la.status = 'pending'
                     ORDER BY la.applied_date ASC`;
        } else if (role === 'tl' || role === 'manager') {
            query = `SELECT la.*, lt.leave_name, lt.leave_code, 
                            u.name as employee_name, u.employee_id
                     FROM leave_applications la
                     JOIN leave_types lt ON la.leave_type_id = lt.id
                     JOIN employees e ON la.employee_id = e.id
                     JOIN users u ON e.user_id = u.id
                     WHERE e.reporting_manager_id = ? AND la.status = 'pending'
                     ORDER BY la.applied_date ASC`;
            params = [emp_id];
        } else {
            return res.json({ success: true, data: [] });
        }

        const [leaves] = await pool.query(query, params);

        res.json({
            success: true,
            data: leaves
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching pending leaves',
            error: error.message
        });
    }
};

