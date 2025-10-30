// import cron from 'node-cron';
// import pool from '../config/db.js';
// import moment from 'moment';

// /**
//  * Credit leaves for a specific employee, year, and month
//  */
// const creditLeavesForEmployee = async (employeeId, leaveTypeId, leaveType, year, month) => {
//     const connection = await pool.getConnection();
//     try {
//         await connection.beginTransaction();

//         // Check if balance already exists for this month
//         const [existing] = await connection.query(
//             `SELECT id FROM leave_balances 
//              WHERE employee_id = ? AND leave_type_id = ? AND year = ? AND month = ?`,
//             [employeeId, leaveTypeId, year, month]
//         );

//         if (existing.length > 0) {
//             console.log(`Balance already exists for employee ${employeeId}, leave type ${leaveTypeId}, ${year}-${month}`);
//             await connection.commit();
//             return false;
//         }

//         // Calculate monthly credit
//         const monthlyCredit = leaveType.max_days_per_year 
//             ? Math.round((leaveType.max_days_per_year / 12) * 10) / 10 
//             : 1; // Default 1 per month if unlimited

//         // Get previous month's balance for carry forward
//         let carriedForward = 0;
//         if (leaveType.is_carry_forward) {
//             const prevMonth = month === 1 ? 12 : month - 1;
//             const prevYear = month === 1 ? year - 1 : year;

//             const [prevBalance] = await connection.query(
//                 `SELECT balance FROM leave_balances 
//                  WHERE employee_id = ? AND leave_type_id = ? AND year = ? AND month = ?`,
//                 [employeeId, leaveTypeId, prevYear, prevMonth]
//             );

//             if (prevBalance.length > 0) {
//                 carriedForward = prevBalance[0].balance;
//             }
//         }

//         const openingBalance = carriedForward;
//         const totalBalance = openingBalance + monthlyCredit;

//         // Insert new balance record
//         await connection.query(
//             `INSERT INTO leave_balances 
//              (employee_id, leave_type_id, year, month, opening_balance, carried_forward, credited, used, balance)
//              VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
//             [employeeId, leaveTypeId, year, month, openingBalance, carriedForward, monthlyCredit, totalBalance]
//         );

//         await connection.commit();
//         console.log(`✓ Credited ${monthlyCredit} leaves to employee ${employeeId}, leave type ${leaveTypeId}`);
//         return true;

//     } catch (error) {
//         await connection.rollback();
//         console.error(`Error crediting leaves for employee ${employeeId}:`, error.message);
//         return false;
//     } finally {
//         connection.release();
//     }
// };

// /**
//  * Credit monthly leaves for all active employees
//  */
// export const creditMonthlyLeavesForAll = async () => {
//     console.log('\n========================================');
//     console.log('🚀 AUTO-CREDIT MONTHLY LEAVES STARTED');
//     console.log('========================================');
    
//     const startTime = Date.now();
//     const currentYear = moment().year();
//     const currentMonth = moment().month() + 1;

//     console.log(`📅 Crediting leaves for: ${currentYear}-${String(currentMonth).padStart(2, '0')}`);
//     console.log(`⏰ Time: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);

//     try {
//         // Get all active employees
//         const [employees] = await pool.query(
//             `SELECT id, user_id FROM employees WHERE is_active = TRUE`
//         );

//         // Get employee names for logging
//         const [employeeDetails] = await pool.query(
//             `SELECT e.id, u.name, u.employee_id 
//              FROM employees e 
//              JOIN users u ON e.user_id = u.id 
//              WHERE e.is_active = TRUE`
//         );

//         // Get all active leave types
//         const [leaveTypes] = await pool.query(
//             `SELECT id, leave_code, leave_name, max_days_per_year, is_carry_forward 
//              FROM leave_types WHERE is_active = TRUE`
//         );

//         console.log(`\n👥 Active Employees: ${employees.length}`);
//         console.log(`📋 Leave Types: ${leaveTypes.length}`);
//         console.log('\nProcessing...\n');

//         let totalCredited = 0;
//         let employeesProcessed = 0;

//         for (const emp of employees) {
//             const empDetail = employeeDetails.find(e => e.id === emp.id);
//             let empCredits = 0;

//             for (const leaveType of leaveTypes) {
//                 const credited = await creditLeavesForEmployee(
//                     emp.id, 
//                     leaveType.id, 
//                     leaveType, 
//                     currentYear, 
//                     currentMonth
//                 );
                
//                 if (credited) {
//                     empCredits++;
//                     totalCredited++;
//                 }
//             }

//             if (empCredits > 0) {
//                 employeesProcessed++;
//                 console.log(`✅ ${empDetail?.name || emp.id} (${empDetail?.employee_id}) - ${empCredits} leave types credited`);
//             }
//         }

//         const duration = ((Date.now() - startTime) / 1000).toFixed(2);

//         console.log('\n========================================');
//         console.log('✅ AUTO-CREDIT COMPLETED SUCCESSFULLY');
//         console.log('========================================');
//         console.log(`📊 Total Records Created: ${totalCredited}`);
//         console.log(`👥 Employees Processed: ${employeesProcessed}/${employees.length}`);
//         console.log(`⏱️  Duration: ${duration}s`);
//         console.log('========================================\n');

//         return {
//             success: true,
//             totalCredited,
//             employeesProcessed,
//             totalEmployees: employees.length,
//             year: currentYear,
//             month: currentMonth,
//             duration
//         };

//     } catch (error) {
//         console.error('\n❌ ERROR IN AUTO-CREDIT:', error);
//         return {
//             success: false,
//             error: error.message
//         };
//     }
// };

// /**
//  * Initialize cron job to run on 25th of every month at 00:01 AM
//  */
// export const startLeaveBalanceCronJob = () => {
//     // Run on 25th of every month at 00:01 AM
//     cron.schedule('1 0 25 * *', async () => {
//         console.log('\n🔔 CRON JOB TRIGGERED - Monthly Leave Credit');
//         await creditMonthlyLeavesForAll();
//     }, {
//         timezone: "Asia/Kolkata"
//     });

//     console.log('✅ Leave Balance Cron Job Initialized');
//     console.log('📅 Scheduled to run on 25th of every month at 00:01 AM IST');
    
//     // 🔥 RUN IMMEDIATELY ON SERVER START
//     console.log('\n🚀 Running credit job immediately for testing...\n');
//     creditMonthlyLeavesForAll();
// };
// /**
//  * Check if current month needs crediting (runs on server start)
//  */
// const checkAndCreditIfNeeded = async () => {
//     const currentDate = moment();
//     const currentDay = currentDate.date();
//     const currentYear = currentDate.year();
//     const currentMonth = currentDate.month() + 1;

//     // If today is 25th or later, check if current month is already credited
//     if (currentDay >= 25) {
//         console.log('\n🔍 Checking if current month leaves are credited...');
        
//         const [existing] = await pool.query(
//             `SELECT COUNT(*) as count FROM leave_balances 
//              WHERE year = ? AND month = ?
//              LIMIT 1`,
//             [currentYear, currentMonth]
//         );

//         if (existing[0].count === 0) {
//             console.log('⚠️  Current month not credited yet. Auto-crediting now...');
//             await creditMonthlyLeavesForAll();
//         } else {
//             console.log('✓ Current month already credited.');
//         }
//     }
// };

// export default startLeaveBalanceCronJob;



import cron from 'node-cron';
import pool from '../config/db.js';
import moment from 'moment';

/**
 * Credit leaves for a specific employee, year, and month
 */
/**
 * Credit leaves for a specific employee, year, and month
 */
const creditLeavesForEmployee = async (employeeId, leaveTypeId, leaveType, year, month) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Check if balance already exists for this month
        const [existing] = await connection.query(
            `SELECT id FROM leave_balances 
             WHERE employee_id = ? AND leave_type_id = ? AND year = ? AND month = ?`,
            [employeeId, leaveTypeId, year, month]
        );

        if (existing.length > 0) {
            console.log(`Balance already exists for employee ${employeeId}, leave type ${leaveTypeId}, ${year}-${month}`);
            await connection.commit();
            return false;
        }

        // ========== SEPARATE VARIABLES ==========
        
        // 1. Calculate monthly credit
        // If max_days_per_year is NULL = Unlimited, so credit 0 (track usage only)
        let creditedDays = 0;
        let isUnlimited = false;
        
        if (leaveType.max_days_per_year === null || leaveType.max_days_per_year === 'NULL') {
            // NULL means unlimited - don't credit days, just track usage
            creditedDays = 0;
            isUnlimited = true;
        } else {
            // Calculate monthly credit from annual allowance
            creditedDays = Math.round((leaveType.max_days_per_year / 12) * 10) / 10;
        }

        // 2. Get previous month's balance for carry forward
        let carriedForwardDays = 0;
        let openingBalanceDays = 0;
        
        if (leaveType.is_carry_forward === 1) {
            const prevMonth = month === 1 ? 12 : month - 1;
            const prevYear = month === 1 ? year - 1 : year;

            const [prevBalance] = await connection.query(
                `SELECT balance FROM leave_balances 
                 WHERE employee_id = ? AND leave_type_id = ? AND year = ? AND month = ?`,
                [employeeId, leaveTypeId, prevYear, prevMonth]
            );

            if (prevBalance.length > 0) {
                carriedForwardDays = prevBalance[0].balance;
                openingBalanceDays = carriedForwardDays;
            }
        }

        // 3. Calculate used days (initially 0 for new month)
        let usedDays = 0;

        // 4. Calculate total available balance
        // For unlimited leaves, balance will be 999999 or a large number
        let totalAvailableBalance = 0;
        if (isUnlimited) {
            totalAvailableBalance = 999999; // Represent unlimited
        } else {
            totalAvailableBalance = openingBalanceDays + creditedDays - usedDays;
        }

        // 5. Store employee and leave type info
        let employeeIdValue = employeeId;
        let leaveTypeIdValue = leaveTypeId;
        let yearValue = year;
        let monthValue = month;
        let leaveTypeName = leaveType.leave_name;
        let leaveTypeCode = leaveType.leave_code;

        // ========== LOG ALL VARIABLES ==========
        console.log('\n--- Leave Credit Calculation ---');
        console.log(`Employee ID: ${employeeIdValue}`);
        console.log(`Leave Type: ${leaveTypeCode} - ${leaveTypeName}`);
        console.log(`Leave Type ID: ${leaveTypeIdValue}`);
        console.log(`Year: ${yearValue}`);
        console.log(`Month: ${monthValue}`);
        console.log(`Is Unlimited: ${isUnlimited ? 'YES' : 'NO'}`);
        console.log(`Max Days Per Year: ${leaveType.max_days_per_year ?? 'UNLIMITED'}`);
        console.log(`Opening Balance: ${openingBalanceDays}`);
        console.log(`Carried Forward: ${carriedForwardDays}`);
        console.log(`Credited: ${creditedDays}`);
        console.log(`Used: ${usedDays}`);
        console.log(`Available Balance: ${isUnlimited ? 'UNLIMITED' : totalAvailableBalance}`);
        console.log('-------------------------------\n');

        // ========== INSERT WITH SEPARATE VARIABLES ==========
        await connection.query(
            `INSERT INTO leave_balances 
             (employee_id, leave_type_id, year, month, opening_balance, carried_forward, credited, used, balance)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                employeeIdValue,
                leaveTypeIdValue,
                yearValue,
                monthValue,
                openingBalanceDays,
                carriedForwardDays,
                creditedDays,
                usedDays,
                totalAvailableBalance
            ]
        );

        await connection.commit();
        console.log(`✓ Credited ${isUnlimited ? 'UNLIMITED' : creditedDays} leaves to employee ${employeeIdValue}, leave type ${leaveTypeCode}`);
        return true;

    } catch (error) {
        await connection.rollback();
        console.error(`Error crediting leaves for employee ${employeeId}:`, error.message);
        return false;
    } finally {
        connection.release();
    }
};

/**
 * Credit monthly leaves for all active employees
 */
export const creditMonthlyLeavesForAll = async () => {
    console.log('\n========================================');
    console.log('🚀 AUTO-CREDIT MONTHLY LEAVES STARTED');
    console.log('========================================');
    
    const startTime = Date.now();
    const currentYear = moment().year();
    const currentMonth = moment().month() + 1;

    console.log(`📅 Crediting leaves for: ${currentYear}-${String(currentMonth).padStart(2, '0')}`);
    console.log(`⏰ Time: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);

    try {
        // Get all active employees
        const [employees] = await pool.query(
            `SELECT id, user_id FROM employees WHERE is_active = TRUE`
        );

        // Get employee names for logging
        const [employeeDetails] = await pool.query(
            `SELECT e.id, u.name, u.employee_id 
             FROM employees e 
             JOIN users u ON e.user_id = u.id 
             WHERE e.is_active = TRUE`
        );

        // Get all active leave types
        const [leaveTypes] = await pool.query(
            `SELECT id, leave_code, leave_name, max_days_per_year, is_carry_forward 
             FROM leave_types WHERE is_active = TRUE`
        );

        console.log(`\n👥 Active Employees: ${employees.length}`);
        console.log(`📋 Leave Types: ${leaveTypes.length}`);
        console.log('\nProcessing...\n');

        let totalCredited = 0;
        let employeesProcessed = 0;

        for (const emp of employees) {
            const empDetail = employeeDetails.find(e => e.id === emp.id);
            let empCredits = 0;

            for (const leaveType of leaveTypes) {
                const credited = await creditLeavesForEmployee(
                    emp.id, 
                    leaveType.id, 
                    leaveType, 
                    currentYear, 
                    currentMonth
                );
                
                if (credited) {
                    empCredits++;
                    totalCredited++;
                }
            }

            if (empCredits > 0) {
                employeesProcessed++;
                console.log(`✅ ${empDetail?.name || emp.id} (${empDetail?.employee_id}) - ${empCredits} leave types credited`);
            }
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('\n========================================');
        console.log('✅ AUTO-CREDIT COMPLETED SUCCESSFULLY');
        console.log('========================================');
        console.log(`📊 Total Records Created: ${totalCredited}`);
        console.log(`👥 Employees Processed: ${employeesProcessed}/${employees.length}`);
        console.log(`⏱️  Duration: ${duration}s`);
        console.log('========================================\n');

        return {
            success: true,
            totalCredited,
            employeesProcessed,
            totalEmployees: employees.length,
            year: currentYear,
            month: currentMonth,
            duration
        };

    } catch (error) {
        console.error('\n❌ ERROR IN AUTO-CREDIT:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Initialize cron job to run on 25th of every month at 00:01 AM
 */
export const startLeaveBalanceCronJob = () => {
    // Run on 25th of every month at 00:01 AM IST
    cron.schedule('03 14 28 * *', async () => {
        console.log('\n🔔 CRON JOB TRIGGERED - Monthly Leave Credit');
        await creditMonthlyLeavesForAll();
    }, {
        timezone: "Asia/Kolkata"
    });

    console.log('✅ Leave Balance Cron Job Initialized');
    console.log('📅 Scheduled to run on 25th of every month at 00:01 AM IST');
};

export default startLeaveBalanceCronJob;
