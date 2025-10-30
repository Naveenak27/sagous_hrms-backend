// import pool from '../config/db.js';
// import moment from 'moment';

// export const getCalendarEvents = async (req, res) => {
//     try {
//         const { month, year } = req.query;
//         const role = req.user.role_name;
        
//         let events = [];

//         // Get public holidays for the month
//         const [holidays] = await pool.query(
//             `SELECT id, holiday_name as title, holiday_date as date, 
//                     description, 'holiday' as type
//              FROM public_holidays
//              WHERE YEAR(holiday_date) = ? AND MONTH(holiday_date) = ?`,
//             [year, month]
//         );
//         events = [...holidays];

//         if (role === 'hr' || role === 'manager' || role === 'superadmin') {
//             // Get all approved leaves
//             const [leaves] = await pool.query(
//                 `SELECT la.id, CONCAT(u.name, ' - ', lt.leave_name) as title,
//                         la.from_date as date, la.to_date, 'leave' as type, 
//                         u.name as employee_name
//                  FROM leave_applications la
//                  JOIN employees e ON la.employee_id = e.id
//                  JOIN users u ON e.user_id = u.id
//                  JOIN leave_types lt ON la.leave_type_id = lt.id
//                  WHERE la.status = 'approved'
//                  AND ((YEAR(la.from_date) = ? AND MONTH(la.from_date) = ?)
//                       OR (YEAR(la.to_date) = ? AND MONTH(la.to_date) = ?))`,
//                 [year, month, year, month]
//             );

//             // Expand multi-day leaves into individual dates
//             for (const leave of leaves) {
//                 const start = moment(leave.date);
//                 const end = moment(leave.to_date);
                
//                 for (let m = moment(start); m.isSameOrBefore(end); m.add(1, 'days')) {
//                     if (m.month() + 1 == month) {
//                         events.push({
//                             ...leave,
//                             date: m.format('YYYY-MM-DD')
//                         });
//                     }
//                 }
//             }

//             // Get employee birthdays
//             const [birthdays] = await pool.query(
//                 `SELECT e.id, CONCAT(u.name, '''s Birthday') as title,
//                         DATE_FORMAT(e.date_of_birth, CONCAT(?, '-%m-%d')) as date, 
//                         'birthday' as type, u.name as employee_name
//                  FROM employees e
//                  JOIN users u ON e.user_id = u.id
//                  WHERE MONTH(e.date_of_birth) = ? AND e.date_of_birth IS NOT NULL`,
//                 [year, month]
//             );
//             events = [...events, ...birthdays];
//         } else {
//             // Employees see only their leaves and holidays
//             const [myLeaves] = await pool.query(
//                 `SELECT la.id, CONCAT(lt.leave_name) as title,
//                         la.from_date as date, la.to_date, 'leave' as type
//                  FROM leave_applications la
//                  JOIN leave_types lt ON la.leave_type_id = lt.id
//                  WHERE la.employee_id = ? AND la.status = 'approved'
//                  AND ((YEAR(la.from_date) = ? AND MONTH(la.from_date) = ?)
//                       OR (YEAR(la.to_date) = ? AND MONTH(la.to_date) = ?))`,
//                 [req.user.emp_id, year, month, year, month]
//             );

//             for (const leave of myLeaves) {
//                 const start = moment(leave.date);
//                 const end = moment(leave.to_date);
                
//                 for (let m = moment(start); m.isSameOrBefore(end); m.add(1, 'days')) {
//                     if (m.month() + 1 == month) {
//                         events.push({
//                             ...leave,
//                             date: m.format('YYYY-MM-DD')
//                         });
//                     }
//                 }
//             }
//         }

//         res.json({
//             success: true,
//             data: events
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching calendar events',
//             error: error.message
//         });
//     }
// };



// controllers/calendarController.js
import db from '../config/db.js';

// controllers/calendarController.js

// export const getCalendarEvents = async (req, res) => {
//     try {
//         const { month, year } = req.query;
//         const userId = req.user.id; // From JWT token via protect middleware

//         // Get employee details and role
//         const [employee] = await db.query(`
//             SELECT 
//                 e.id as employee_id, 
//                 e.role_id, 
//                 r.role_name,
//                 e.reporting_manager_id
//             FROM employees e
//             JOIN users u ON e.user_id = u.id
//             JOIN roles r ON e.role_id = r.id
//             WHERE u.id = ?
//         `, [userId]);

//         if (!employee || employee.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Employee not found'
//             });
//         }

//         const currentEmployee = employee[0];
//         const roleName = currentEmployee.role_name.toUpperCase();

//         let leaveQuery = '';
//         let queryParams = [];

//         // Build query based on role
//         if (roleName === 'HR' || roleName === 'SUPER ADMIN' || roleName === 'MANAGER') {
//             // HR, Super Admin, and Manager can see ALL leaves
//             leaveQuery = `
//                 SELECT 
//                     la.id,
//                     la.employee_id,
//                     la.from_date as date,
//                     la.to_date,
//                     lt.leave_name as title,
//                     'leave' as type,
//                     u.name as employee_name,
//                     e.department_id,
//                     la.status,
//                     la.number_of_days
//                 FROM leave_applications la
//                 JOIN employees e ON la.employee_id = e.id
//                 JOIN users u ON e.user_id = u.id
//                 JOIN leave_types lt ON la.leave_type_id = lt.id
//                 WHERE MONTH(la.from_date) = ? 
//                 AND YEAR(la.from_date) = ?
//                 AND la.status = 'approved'
//                 ORDER BY la.from_date
//             `;
//             queryParams = [month, year];
            
//         } else if (roleName === 'TL') {
//             // TL can see their direct reports' leaves + their own
//             leaveQuery = `
//                 SELECT 
//                     la.id,
//                     la.employee_id,
//                     la.from_date as date,
//                     la.to_date,
//                     lt.leave_name as title,
//                     'leave' as type,
//                     u.name as employee_name,
//                     e.department_id,
//                     la.status,
//                     la.number_of_days
//                 FROM leave_applications la
//                 JOIN employees e ON la.employee_id = e.id
//                 JOIN users u ON e.user_id = u.id
//                 JOIN leave_types lt ON la.leave_type_id = lt.id
//                 WHERE MONTH(la.from_date) = ? 
//                 AND YEAR(la.from_date) = ?
//                 AND la.status = 'approved'
//                 AND (
//                     e.reporting_manager_id = ? 
//                     OR la.employee_id = ?
//                 )
//                 ORDER BY la.from_date
//             `;
//             queryParams = [month, year, currentEmployee.employee_id, currentEmployee.employee_id];
            
//         } else {
//             // Regular employees can see only their own leaves
//             leaveQuery = `
//                 SELECT 
//                     la.id,
//                     la.employee_id,
//                     la.from_date as date,
//                     la.to_date,
//                     lt.leave_name as title,
//                     'leave' as type,
//                     u.name as employee_name,
//                     e.department_id,
//                     la.status,
//                     la.number_of_days
//                 FROM leave_applications la
//                 JOIN employees e ON la.employee_id = e.id
//                 JOIN users u ON e.user_id = u.id
//                 JOIN leave_types lt ON la.leave_type_id = lt.id
//                 WHERE MONTH(la.from_date) = ? 
//                 AND YEAR(la.from_date) = ?
//                 AND la.status = 'approved'
//                 AND la.employee_id = ?
//                 ORDER BY la.from_date
//             `;
//             queryParams = [month, year, currentEmployee.employee_id];
//         }

//         // Execute leave query
//         const [leaveResults] = await db.query(leaveQuery, queryParams);

//         // Get birthdays with same role-based logic
//         let birthdayQuery = '';
//         let birthdayParams = [];

//         if (roleName === 'HR' || roleName === 'SUPER ADMIN' || roleName === 'MANAGER') {
//             // HR, Super Admin, and Manager can see ALL birthdays
//             birthdayQuery = `
//                 SELECT 
//                     e.id,
//                     e.id as employee_id,
//                     DATE_FORMAT(
//                         CONCAT(?, '-', LPAD(MONTH(e.date_of_birth), 2, '0'), '-', LPAD(DAY(e.date_of_birth), 2, '0')),
//                         '%Y-%m-%d'
//                     ) as date,
//                     NULL as to_date,
//                     CONCAT(u.name, "'s Birthday") as title,
//                     'birthday' as type,
//                     u.name as employee_name,
//                     e.department_id
//                 FROM employees e
//                 JOIN users u ON e.user_id = u.id
//                 WHERE MONTH(e.date_of_birth) = ?
//                 AND e.is_active = TRUE
//                 ORDER BY DAY(e.date_of_birth)
//             `;
//             birthdayParams = [year, month];
            
//         } else if (roleName === 'TL') {
//             // TL can see their direct reports' birthdays + their own
//             birthdayQuery = `
//                 SELECT 
//                     e.id,
//                     e.id as employee_id,
//                     DATE_FORMAT(
//                         CONCAT(?, '-', LPAD(MONTH(e.date_of_birth), 2, '0'), '-', LPAD(DAY(e.date_of_birth), 2, '0')),
//                         '%Y-%m-%d'
//                     ) as date,
//                     NULL as to_date,
//                     CONCAT(u.name, "'s Birthday") as title,
//                     'birthday' as type,
//                     u.name as employee_name,
//                     e.department_id
//                 FROM employees e
//                 JOIN users u ON e.user_id = u.id
//                 WHERE MONTH(e.date_of_birth) = ?
//                 AND e.is_active = TRUE
//                 AND (
//                     e.reporting_manager_id = ?
//                     OR e.id = ?
//                 )
//                 ORDER BY DAY(e.date_of_birth)
//             `;
//             birthdayParams = [year, month, currentEmployee.employee_id, currentEmployee.employee_id];
            
//         } else {
//             // Regular employees can see only their own birthday
//             birthdayQuery = `
//                 SELECT 
//                     e.id,
//                     e.id as employee_id,
//                     DATE_FORMAT(
//                         CONCAT(?, '-', LPAD(MONTH(e.date_of_birth), 2, '0'), '-', LPAD(DAY(e.date_of_birth), 2, '0')),
//                         '%Y-%m-%d'
//                     ) as date,
//                     NULL as to_date,
//                     CONCAT(u.name, "'s Birthday") as title,
//                     'birthday' as type,
//                     u.name as employee_name,
//                     e.department_id
//                 FROM employees e
//                 JOIN users u ON e.user_id = u.id
//                 WHERE MONTH(e.date_of_birth) = ?
//                 AND e.is_active = TRUE
//                 AND e.id = ?
//                 ORDER BY DAY(e.date_of_birth)
//             `;
//             birthdayParams = [year, month, currentEmployee.employee_id];
//         }

//         const [birthdayResults] = await db.query(birthdayQuery, birthdayParams);

//         // Combine results
//         const allEvents = [...leaveResults, ...birthdayResults];

//         res.json({
//             success: true,
//             data: allEvents,
//             role: roleName,
//             count: allEvents.length
//         });

//     } catch (error) {
//         console.error('Error fetching calendar events:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching calendar events',
//             error: error.message
//         });
//     }
// };


export const getCalendarEvents = async (req, res) => {
    try {
        const { month, year } = req.query;
        const userId = req.user.id;

        // Get employee details and role
        const [employee] = await db.query(`
            SELECT 
                e.id as employee_id, 
                e.role_id, 
                r.role_name,
                e.reporting_manager_id
            FROM employees e
            JOIN users u ON e.user_id = u.id
            JOIN roles r ON e.role_id = r.id
            WHERE u.id = ?
        `, [userId]);

        if (!employee || employee.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const currentEmployee = employee[0];
        const roleName = currentEmployee.role_name.toUpperCase();

        let leaveQuery = '';
        let queryParams = [];

        // Build query based on role
        if (roleName === 'HR' || roleName === 'SUPER ADMIN' || roleName === 'MANAGER') {
            leaveQuery = `
                SELECT 
                    la.id,
                    la.employee_id,
                    la.from_date as date,
                    la.to_date,
                    lt.leave_name as title,
                    'leave' as type,
                    u.name as employee_name,
                    e.department_id,
                    la.status,
                    la.number_of_days
                FROM leave_applications la
                JOIN employees e ON la.employee_id = e.id
                JOIN users u ON e.user_id = u.id
                JOIN leave_types lt ON la.leave_type_id = lt.id
                WHERE MONTH(la.from_date) = ? 
                AND YEAR(la.from_date) = ?
                AND la.status = 'approved'
                ORDER BY la.from_date
            `;
            queryParams = [month, year];
            
        } else if (roleName === 'TL') {
            leaveQuery = `
                SELECT 
                    la.id,
                    la.employee_id,
                    la.from_date as date,
                    la.to_date,
                    lt.leave_name as title,
                    'leave' as type,
                    u.name as employee_name,
                    e.department_id,
                    la.status,
                    la.number_of_days
                FROM leave_applications la
                JOIN employees e ON la.employee_id = e.id
                JOIN users u ON e.user_id = u.id
                JOIN leave_types lt ON la.leave_type_id = lt.id
                WHERE MONTH(la.from_date) = ? 
                AND YEAR(la.from_date) = ?
                AND la.status = 'approved'
                AND (
                    e.reporting_manager_id = ? 
                    OR la.employee_id = ?
                )
                ORDER BY la.from_date
            `;
            queryParams = [month, year, currentEmployee.employee_id, currentEmployee.employee_id];
            
        } else {
            leaveQuery = `
                SELECT 
                    la.id,
                    la.employee_id,
                    la.from_date as date,
                    la.to_date,
                    lt.leave_name as title,
                    'leave' as type,
                    u.name as employee_name,
                    e.department_id,
                    la.status,
                    la.number_of_days
                FROM leave_applications la
                JOIN employees e ON la.employee_id = e.id
                JOIN users u ON e.user_id = u.id
                JOIN leave_types lt ON la.leave_type_id = lt.id
                WHERE MONTH(la.from_date) = ? 
                AND YEAR(la.from_date) = ?
                AND la.status = 'approved'
                AND la.employee_id = ?
                ORDER BY la.from_date
            `;
            queryParams = [month, year, currentEmployee.employee_id];
        }

        const [leaveResults] = await db.query(leaveQuery, queryParams);

        // Get birthdays with same role-based logic
        let birthdayQuery = '';
        let birthdayParams = [];

        if (roleName === 'HR' || roleName === 'SUPER ADMIN' || roleName === 'MANAGER') {
            birthdayQuery = `
                SELECT 
                    e.id,
                    e.id as employee_id,
                    DATE_FORMAT(
                        CONCAT(?, '-', LPAD(MONTH(e.date_of_birth), 2, '0'), '-', LPAD(DAY(e.date_of_birth), 2, '0')),
                        '%Y-%m-%d'
                    ) as date,
                    NULL as to_date,
                    CONCAT(u.name, "'s Birthday") as title,
                    'birthday' as type,
                    u.name as employee_name,
                    e.department_id
                FROM employees e
                JOIN users u ON e.user_id = u.id
                WHERE MONTH(e.date_of_birth) = ?
                AND e.is_active = TRUE
                ORDER BY DAY(e.date_of_birth)
            `;
            birthdayParams = [year, month];
            
        } else if (roleName === 'TL') {
            birthdayQuery = `
                SELECT 
                    e.id,
                    e.id as employee_id,
                    DATE_FORMAT(
                        CONCAT(?, '-', LPAD(MONTH(e.date_of_birth), 2, '0'), '-', LPAD(DAY(e.date_of_birth), 2, '0')),
                        '%Y-%m-%d'
                    ) as date,
                    NULL as to_date,
                    CONCAT(u.name, "'s Birthday") as title,
                    'birthday' as type,
                    u.name as employee_name,
                    e.department_id
                FROM employees e
                JOIN users u ON e.user_id = u.id
                WHERE MONTH(e.date_of_birth) = ?
                AND e.is_active = TRUE
                AND (
                    e.reporting_manager_id = ?
                    OR e.id = ?
                )
                ORDER BY DAY(e.date_of_birth)
            `;
            birthdayParams = [year, month, currentEmployee.employee_id, currentEmployee.employee_id];
            
        } else {
            birthdayQuery = `
                SELECT 
                    e.id,
                    e.id as employee_id,
                    DATE_FORMAT(
                        CONCAT(?, '-', LPAD(MONTH(e.date_of_birth), 2, '0'), '-', LPAD(DAY(e.date_of_birth), 2, '0')),
                        '%Y-%m-%d'
                    ) as date,
                    NULL as to_date,
                    CONCAT(u.name, "'s Birthday") as title,
                    'birthday' as type,
                    u.name as employee_name,
                    e.department_id
                FROM employees e
                JOIN users u ON e.user_id = u.id
                WHERE MONTH(e.date_of_birth) = ?
                AND e.is_active = TRUE
                AND e.id = ?
                ORDER BY DAY(e.date_of_birth)
            `;
            birthdayParams = [year, month, currentEmployee.employee_id];
        }

        const [birthdayResults] = await db.query(birthdayQuery, birthdayParams);

        // ========== Calculate Working Hours with Holiday Deduction ==========
        
        // Get working days in the month (excluding weekends)
        const [workingDaysResult] = await db.query(`
            WITH RECURSIVE date_range AS (
                SELECT DATE(CONCAT(?, '-', LPAD(?, 2, '0'), '-01')) as date
                UNION ALL
                SELECT DATE_ADD(date, INTERVAL 1 DAY)
                FROM date_range
                WHERE MONTH(DATE_ADD(date, INTERVAL 1 DAY)) = ?
            )
            SELECT COUNT(*) as working_days
            FROM date_range
            WHERE DAYOFWEEK(date) NOT IN (1, 7)
        `, [year, month, month]);

        const workingDays = workingDaysResult[0].working_days;

        // Get number of holidays in this month (excluding weekends) from public_holidays table
        const [holidaysResult] = await db.query(`
            SELECT COUNT(*) as holiday_count
            FROM public_holidays
            WHERE MONTH(holiday_date) = ?
            AND YEAR(holiday_date) = ?
            AND DAYOFWEEK(holiday_date) NOT IN (1, 7)
        `, [month, year]);

        const holidayCount = holidaysResult[0].holiday_count;
        
        const dailyWorkingHours = 8;
        const totalExpectedHours = workingDays * dailyWorkingHours;
        const holidayHours = holidayCount * dailyWorkingHours;

        // Calculate working hours insights based on role
        let insightsQuery = '';
        let insightsParams = [];

        if (roleName === 'HR' || roleName === 'SUPER ADMIN' || roleName === 'MANAGER') {
            insightsQuery = `
                SELECT 
                    e.id as employee_id,
                    u.name as employee_name,
                    COALESCE(SUM(la.number_of_days), 0) as total_leave_days,
                    ? as working_days,
                    ? as holiday_count,
                    ? as daily_working_hours,
                    ? as total_expected_hours,
                    ? as holiday_hours,
                    (? - ? - COALESCE(SUM(la.number_of_days), 0) * ?) as actual_working_hours
                FROM employees e
                JOIN users u ON e.user_id = u.id
                LEFT JOIN leave_applications la ON e.id = la.employee_id 
                    AND MONTH(la.from_date) = ? 
                    AND YEAR(la.from_date) = ?
                    AND la.status = 'approved'
                WHERE e.is_active = TRUE
                GROUP BY e.id, u.name
                ORDER BY u.name
            `;
            insightsParams = [
                workingDays,
                holidayCount,
                dailyWorkingHours,
                totalExpectedHours,
                holidayHours,
                totalExpectedHours,
                holidayHours,
                dailyWorkingHours,
                month,
                year
            ];
            
        } else if (roleName === 'TL') {
            insightsQuery = `
                SELECT 
                    e.id as employee_id,
                    u.name as employee_name,
                    COALESCE(SUM(la.number_of_days), 0) as total_leave_days,
                    ? as working_days,
                    ? as holiday_count,
                    ? as daily_working_hours,
                    ? as total_expected_hours,
                    ? as holiday_hours,
                    (? - ? - COALESCE(SUM(la.number_of_days), 0) * ?) as actual_working_hours
                FROM employees e
                JOIN users u ON e.user_id = u.id
                LEFT JOIN leave_applications la ON e.id = la.employee_id 
                    AND MONTH(la.from_date) = ? 
                    AND YEAR(la.from_date) = ?
                    AND la.status = 'approved'
                WHERE e.is_active = TRUE
                AND (
                    e.reporting_manager_id = ?
                    OR e.id = ?
                )
                GROUP BY e.id, u.name
                ORDER BY u.name
            `;
            insightsParams = [
                workingDays,
                holidayCount,
                dailyWorkingHours,
                totalExpectedHours,
                holidayHours,
                totalExpectedHours,
                holidayHours,
                dailyWorkingHours,
                month,
                year,
                currentEmployee.employee_id,
                currentEmployee.employee_id
            ];
            
        } else {
            insightsQuery = `
                SELECT 
                    e.id as employee_id,
                    u.name as employee_name,
                    COALESCE(SUM(la.number_of_days), 0) as total_leave_days,
                    ? as working_days,
                    ? as holiday_count,
                    ? as daily_working_hours,
                    ? as total_expected_hours,
                    ? as holiday_hours,
                    (? - ? - COALESCE(SUM(la.number_of_days), 0) * ?) as actual_working_hours
                FROM employees e
                JOIN users u ON e.user_id = u.id
                LEFT JOIN leave_applications la ON e.id = la.employee_id 
                    AND MONTH(la.from_date) = ? 
                    AND YEAR(la.from_date) = ?
                    AND la.status = 'approved'
                WHERE e.is_active = TRUE
                AND e.id = ?
                GROUP BY e.id, u.name
            `;
            insightsParams = [
                workingDays,
                holidayCount,
                dailyWorkingHours,
                totalExpectedHours,
                holidayHours,
                totalExpectedHours,
                holidayHours,
                dailyWorkingHours,
                month,
                year,
                currentEmployee.employee_id
            ];
        }

        const [insightsResults] = await db.query(insightsQuery, insightsParams);

        // Combine results
        const allEvents = [...leaveResults, ...birthdayResults];

        res.json({
            success: true,
            data: allEvents,
            role: roleName,
            count: allEvents.length,
            insights: {
                month: month,
                year: year,
                working_days: workingDays,
                holiday_count: holidayCount,
                daily_working_hours: dailyWorkingHours,
                total_expected_hours: totalExpectedHours,
                holiday_hours: holidayHours,
                net_working_hours: totalExpectedHours - holidayHours,
                employees: insightsResults
            }
        });

    } catch (error) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching calendar events',
            error: error.message
        });
    }
};
