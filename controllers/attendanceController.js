import biometricPool from '../config/biometricDb.js';
import pool from '../config/db.js';
import moment from 'moment';

// Get attendance for a specific employee - SIMPLE VERSION
export const getMyAttendance = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const employeeCode = req.user.employee_id;

        const startDate = start_date || moment().startOf('month').format('YYYY-MM-DD');
        const endDate = end_date || moment().endOf('month').format('YYYY-MM-DD');

        // Simple query: Get all punches
        
        const [logs] = await pool.query(
            `SELECT id, log_date, log_time, direction, log_date_time
             FROM attendance_logs 
             WHERE employee_code = ? 
             AND log_date BETWEEN ? AND ?
             ORDER BY id ASC`,
            [employeeCode, startDate, endDate]
        );

        // Process logs simply
        const processedData = processLogsSimple(logs);

        res.json({
            success: true,
            data: processedData,
            employee_code: employeeCode
        });
    } catch (error) {
        console.error('Attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance',
            error: error.message
        });
    }
};

// Get all attendance - SIMPLE VERSION
export const getAllAttendance = async (req, res) => {
    try {
        const { start_date, end_date, employee_code } = req.query;
        const role = req.user.role_name;

        if (!['hr', 'manager', 'superadmin'].includes(role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view all attendance'
            });
        }

        const startDate = start_date || moment().startOf('month').format('YYYY-MM-DD');
        const endDate = end_date || moment().endOf('month').format('YYYY-MM-DD');

        let query = `SELECT employee_code, id, log_date, log_time, direction, log_date_time
                     FROM attendance_logs 
                     WHERE log_date BETWEEN ? AND ?`;
        let params = [startDate, endDate];

        if (employee_code) {
            query += ` AND employee_code = ?`;
            params.push(employee_code);
        }

        query += ` ORDER BY employee_code, id ASC`;

        const [logs] = await pool.query(query, params);

        // Group by employee
        const groupedByEmployee = {};
        logs.forEach(log => {
            if (!groupedByEmployee[log.employee_code]) {
                groupedByEmployee[log.employee_code] = [];
            }
            groupedByEmployee[log.employee_code].push(log);
        });

        // Process each employee
        let allProcessedData = [];
        for (const empCode in groupedByEmployee) {
            const empLogs = groupedByEmployee[empCode];
            const processedLogs = processLogsSimple(empLogs);
            allProcessedData = allProcessedData.concat(
                processedLogs.map(log => ({
                    ...log,
                    employee_code: empCode
                }))
            );
        }

        // Enrich with employee details
        const employeeCodes = Object.keys(groupedByEmployee);
        const employeeDetails = await getEmployeeDetails(employeeCodes);

        const enrichedData = allProcessedData.map(record => ({
            ...record,
            employee_name: employeeDetails[record.employee_code]?.name || 'Unknown',
            designation: employeeDetails[record.employee_code]?.designation || 'N/A',
            department: employeeDetails[record.employee_code]?.department_name || 'N/A'
        }));

        res.json({
            success: true,
            data: enrichedData,
            count: enrichedData.length
        });
    } catch (error) {
        console.error('Attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance',
            error: error.message
        });
    }
};

// Get attendance summary
export const getAttendanceSummary = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date || moment().format('YYYY-MM-DD');
        const role = req.user.role_name;

        if (!['hr', 'manager', 'superadmin'].includes(role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission'
            });
        }

        const [
            [totalEmployees],
            [presentEmployees],
            [lateArrivals]
        ] = await Promise.all([
            pool.query('SELECT COUNT(*) as total FROM employees WHERE is_active = TRUE'),
            biometricPool.query(
                `SELECT COUNT(DISTINCT employee_code) as present 
                 FROM attendance_logs 
                 WHERE log_date = ?`,
                [targetDate]
            ),
            biometricPool.query(
                `SELECT COUNT(DISTINCT employee_code) as late 
                 FROM attendance_logs 
                 WHERE log_date = ? 
                 AND direction = 'in' 
                 AND TIME(log_time) > '09:30:00'`,
                [targetDate]
            )
        ]);

        const total = totalEmployees[0].total;
        const present = presentEmployees[0].present;
        const absent = total - present;
        const late = lateArrivals[0].late;

        res.json({
            success: true,
            data: {
                total_employees: total,
                present: present,
                absent: absent,
                late: late,
                on_time: present - late,
                date: targetDate
            }
        });
    } catch (error) {
        console.error('Summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching summary',
            error: error.message
        });
    }
};

// SIMPLE LOGIC: Process logs by date - First IN, First OUT only

// CORRECTED: Process logs by date - Handle duplicate IN/OUT properly
function processLogsSimple(logs) {
    const groupedByDate = {};

    // Group all logs by date
    logs.forEach(log => {
        const date = moment(log.log_date).format('YYYY-MM-DD');
        
        if (!groupedByDate[date]) {
            groupedByDate[date] = {
                date: date,
                allPunches: []
            };
        }

        groupedByDate[date].allPunches.push({
            id: log.id,
            time: log.log_time,
            direction: log.direction,
            timestamp: log.log_date_time
        });
    });

    // Process each date
    const result = [];
    for (const date in groupedByDate) {
        const dayData = groupedByDate[date];
        
        // Sort by ID (original order from database)
        dayData.allPunches.sort((a, b) => a.id - b.id);

        // CORRECTED LOGIC: Filter consecutive duplicates
        const cleanedPunches = [];
        let lastDirection = null;

        dayData.allPunches.forEach(punch => {
            // If this punch has same direction as last one, skip it (duplicate)
            if (punch.direction === lastDirection) {
                console.log(`Duplicate ${punch.direction} punch ignored: ${punch.time} on ${date}`);
                return; // Skip this punch
            }
            
            // Add punch and update last direction
            cleanedPunches.push(punch);
            lastDirection = punch.direction;
        });

        // Now separate INs and OUTs from cleaned punches
        const allIns = [];
        const allOuts = [];

        cleanedPunches.forEach(punch => {
            if (punch.direction === 'in') {
                allIns.push(punch);
            } else if (punch.direction === 'out') {
                allOuts.push(punch);
            }
        });

        // Create pairs: 1st IN → 1st OUT, 2nd IN → 2nd OUT
        const pairs = [];
        const maxPairs = Math.max(allIns.length, allOuts.length);
        
        for (let i = 0; i < maxPairs; i++) {
            const inPunch = allIns[i];
            const outPunch = allOuts[i];
            
            const duration = calculateSimpleDuration(date, inPunch?.time, outPunch?.time);
            
            pairs.push({
                in: inPunch ? inPunch.time : null,
                out: outPunch ? outPunch.time : null,
                duration: duration
            });
        }

        // Calculate total hours from all pairs
        let totalMinutes = 0;
        pairs.forEach(pair => {
            if (pair.duration && pair.duration > 0) {
                totalMinutes += pair.duration;
            }
        });

        result.push({
            date: date,
            first_in: allIns[0]?.time || null,
            last_out: allOuts[allOuts.length - 1]?.time || null,
            pairs: pairs,
            total_hours: (totalMinutes / 60).toFixed(2),
            punch_count: cleanedPunches.length,
            raw_punch_count: dayData.allPunches.length
        });
    }

    // Sort by date descending
    result.sort((a, b) => new Date(b.date) - new Date(a.date));

    return result;
}


// SIMPLE duration calculation
function calculateSimpleDuration(date, inTime, outTime) {
    if (!inTime || !outTime) return null;

    try {
        // Create full datetime for accurate calculation
        const inDateTime = moment(`${date} ${inTime}`, 'YYYY-MM-DD HH:mm:ss');
        const outDateTime = moment(`${date} ${outTime}`, 'YYYY-MM-DD HH:mm:ss');

        // Calculate difference in minutes
        const duration = outDateTime.diff(inDateTime, 'minutes');

        return duration > 0 ? duration : null;
    } catch (error) {
        console.error('Duration calculation error:', error);
        return null;
    }
}

// Helper: Get employee details
async function getEmployeeDetails(employeeCodes) {
    if (employeeCodes.length === 0) return {};

    const placeholders = employeeCodes.map(() => '?').join(',');
    const [employees] = await pool.query(
        `SELECT u.employee_id, u.name, e.designation, d.department_name
         FROM users u
         JOIN employees e ON u.id = e.user_id
         LEFT JOIN departments d ON e.department_id = d.id
         WHERE u.employee_id IN (${placeholders})`,
        employeeCodes
    );

    const employeeMap = {};
    employees.forEach(emp => {
        employeeMap[emp.employee_id] = emp;
    });

    return employeeMap;
}







// import pool from '../config/db.js';
// import moment from 'moment';

// // Get attendance for a specific employee
// export const getMyAttendance = async (req, res) => {
//     try {
//         const { start_date, end_date } = req.query;
//         const employeeCode = req.user.employee_id;

//         const startDate = start_date || moment().startOf('month').format('YYYY-MM-DD');
//         const endDate = end_date || moment().endOf('month').format('YYYY-MM-DD');

//         // Query from MAIN DB attendance_logs table
//         const [logs] = await pool.query(
//             `SELECT id, log_date, log_time, direction, log_date_time
//              FROM attendance_logs 
//              WHERE employee_code = ? 
//              AND log_date BETWEEN ? AND ?
//              ORDER BY id ASC`,
//             [employeeCode, startDate, endDate]
//         );

//         const processedData = processLogsSimple(logs);

//         res.json({
//             success: true,
//             data: processedData,
//             employee_code: employeeCode
//         });
//     } catch (error) {
//         console.error('Attendance error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching attendance',
//             error: error.message
//         });
//     }
// };

// // Get all attendance
// export const getAllAttendance = async (req, res) => {
//     try {
//         const { start_date, end_date, employee_code } = req.query;
//         const role = req.user.role_name;

//         if (!['hr', 'manager', 'superadmin'].includes(role)) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'You do not have permission to view all attendance'
//             });
//         }

//         const startDate = start_date || moment().startOf('month').format('YYYY-MM-DD');
//         const endDate = end_date || moment().endOf('month').format('YYYY-MM-DD');

//         let query = `SELECT employee_code, id, log_date, log_time, direction, log_date_time
//                      FROM attendance_logs 
//                      WHERE log_date BETWEEN ? AND ?`;
//         let params = [startDate, endDate];

//         if (employee_code) {
//             query += ` AND employee_code = ?`;
//             params.push(employee_code);
//         }

//         query += ` ORDER BY employee_code, id ASC`;

//         // Query from MAIN DB
//         const [logs] = await pool.query(query, params);

//         const groupedByEmployee = {};
//         logs.forEach(log => {
//             if (!groupedByEmployee[log.employee_code]) {
//                 groupedByEmployee[log.employee_code] = [];
//             }
//             groupedByEmployee[log.employee_code].push(log);
//         });

//         let allProcessedData = [];
//         for (const empCode in groupedByEmployee) {
//             const empLogs = groupedByEmployee[empCode];
//             const processedLogs = processLogsSimple(empLogs);
//             allProcessedData = allProcessedData.concat(
//                 processedLogs.map(log => ({
//                     ...log,
//                     employee_code: empCode
//                 }))
//             );
//         }

//         const employeeCodes = Object.keys(groupedByEmployee);
//         const employeeDetails = await getEmployeeDetails(employeeCodes);

//         const enrichedData = allProcessedData.map(record => ({
//             ...record,
//             employee_name: employeeDetails[record.employee_code]?.name || 'Unknown',
//             designation: employeeDetails[record.employee_code]?.designation || 'N/A',
//             department: employeeDetails[record.employee_code]?.department_name || 'N/A'
//         }));

//         res.json({
//             success: true,
//             data: enrichedData,
//             count: enrichedData.length
//         });
//     } catch (error) {
//         console.error('Attendance error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching attendance',
//             error: error.message
//         });
//     }
// };

// // Get attendance summary
// export const getAttendanceSummary = async (req, res) => {
//     try {
//         const { date } = req.query;
//         const targetDate = date || moment().format('YYYY-MM-DD');
//         const role = req.user.role_name;

//         if (!['hr', 'manager', 'superadmin'].includes(role)) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'You do not have permission'
//             });
//         }

//         // Query from MAIN DB
//         const [
//             [totalEmployees],
//             [presentEmployees],
//             [lateArrivals]
//         ] = await Promise.all([
//             pool.query('SELECT COUNT(*) as total FROM employees WHERE is_active = TRUE'),
//             pool.query(
//                 `SELECT COUNT(DISTINCT employee_code) as present 
//                  FROM attendance_logs 
//                  WHERE log_date = ?`,
//                 [targetDate]
//             ),
//             pool.query(
//                 `SELECT COUNT(DISTINCT employee_code) as late 
//                  FROM attendance_logs 
//                  WHERE log_date = ? 
//                  AND direction = 'in' 
//                  AND TIME(log_time) > '09:30:00'`,
//                 [targetDate]
//             )
//         ]);

//         const total = totalEmployees[0].total;
//         const present = presentEmployees[0].present;
//         const absent = total - present;
//         const late = lateArrivals[0].late;

//         res.json({
//             success: true,
//             data: {
//                 total_employees: total,
//                 present: present,
//                 absent: absent,
//                 late: late,
//                 on_time: present - late,
//                 date: targetDate
//             }
//         });
//     } catch (error) {
//         console.error('Summary error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching summary',
//             error: error.message
//         });
//     }
// };

// // DEBUG: View raw attendance data
// export const debugAttendanceData = async (req, res) => {
//     try {
//         const { employee_code, date, limit = 50 } = req.query;

//         let query = 'SELECT * FROM attendance_logs WHERE 1=1';
//         let params = [];

//         if (employee_code) {
//             query += ' AND employee_code = ?';
//             params.push(employee_code);
//         }

//         if (date) {
//             query += ' AND log_date = ?';
//             params.push(date);
//         }

//         query += ' ORDER BY id ASC LIMIT ?';
//         params.push(parseInt(limit));

//         // Query from MAIN DB
//         const [logs] = await pool.query(query, params);

//         res.json({
//             success: true,
//             count: logs.length,
//             data: logs
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             error: error.message
//         });
//     }
// };

// // DEBUG: View processed attendance
// export const debugProcessedAttendance = async (req, res) => {
//     try {
//         const { employee_code, start_date, end_date } = req.query;

//         if (!employee_code) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'employee_code is required'
//             });
//         }

//         const startDate = start_date || moment().startOf('month').format('YYYY-MM-DD');
//         const endDate = end_date || moment().endOf('month').format('YYYY-MM-DD');

//         // Query from MAIN DB
//         const [logs] = await pool.query(
//             `SELECT id, log_date, log_time, direction, log_date_time
//              FROM attendance_logs 
//              WHERE employee_code = ? 
//              AND log_date BETWEEN ? AND ?
//              ORDER BY id ASC`,
//             [employee_code, startDate, endDate]
//         );

//         const processed = processLogsSimple(logs);

//         res.json({
//             success: true,
//             employee_code: employee_code,
//             date_range: { start: startDate, end: endDate },
//             raw_data: {
//                 count: logs.length,
//                 logs: logs
//             },
//             processed_data: processed
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             error: error.message
//         });
//     }
// };

// // DEBUG: View ALL data from database
// export const debugViewAllData = async (req, res) => {
//     try {
//         const { page = 1, limit = 100, employee_code, date } = req.query;
//         const offset = (parseInt(page) - 1) * parseInt(limit);

//         let countQuery = 'SELECT COUNT(*) as total FROM attendance_logs';
//         let dataQuery = 'SELECT * FROM attendance_logs';
//         let whereConditions = [];
//         let params = [];
//         let countParams = [];

//         if (employee_code) {
//             whereConditions.push('employee_code = ?');
//             params.push(employee_code);
//             countParams.push(employee_code);
//         }

//         if (date) {
//             whereConditions.push('log_date = ?');
//             params.push(date);
//             countParams.push(date);
//         }

//         if (whereConditions.length > 0) {
//             const whereClause = ' WHERE ' + whereConditions.join(' AND ');
//             countQuery += whereClause;
//             dataQuery += whereClause;
//         }

//         // Query from MAIN DB
//         const [countResult] = await pool.query(countQuery, countParams);
//         const totalRecords = countResult[0].total;

//         dataQuery += ' ORDER BY id ASC LIMIT ? OFFSET ?';
//         params.push(parseInt(limit), offset);

//         const [data] = await pool.query(dataQuery, params);

//         const uniqueEmployees = [...new Set(data.map(d => d.employee_code))];
//         const dates = data.map(d => d.log_date);
//         const minDate = dates.length > 0 ? moment(Math.min(...dates.map(d => new Date(d)))).format('YYYY-MM-DD') : null;
//         const maxDate = dates.length > 0 ? moment(Math.max(...dates.map(d => new Date(d)))).format('YYYY-MM-DD') : null;

//         res.json({
//             success: true,
//             pagination: {
//                 current_page: parseInt(page),
//                 per_page: parseInt(limit),
//                 total_records: totalRecords,
//                 total_pages: Math.ceil(totalRecords / parseInt(limit))
//             },
//             summary: {
//                 total_records_in_db: totalRecords,
//                 unique_employees: uniqueEmployees.length,
//                 employee_codes: uniqueEmployees,
//                 date_range: {
//                     from: minDate,
//                     to: maxDate
//                 }
//             },
//             data: data
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             error: error.message
//         });
//     }
// };

// // DEBUG: Get database statistics
// export const debugDatabaseStats = async (req, res) => {
//     try {
//         // Query from MAIN DB
//         const [totalRecords] = await pool.query('SELECT COUNT(*) as total FROM attendance_logs');
//         const [uniqueEmployees] = await pool.query('SELECT COUNT(DISTINCT employee_code) as count FROM attendance_logs');
//         const [dateRange] = await pool.query(
//             'SELECT MIN(log_date) as first_date, MAX(log_date) as last_date FROM attendance_logs'
//         );
//         const [employeeStats] = await pool.query(
//             `SELECT employee_code, 
//                     COUNT(*) as total_punches,
//                     MIN(log_date) as first_punch_date,
//                     MAX(log_date) as last_punch_date
//              FROM attendance_logs 
//              GROUP BY employee_code 
//              ORDER BY total_punches DESC`
//         );
//         const [dateStats] = await pool.query(
//             `SELECT log_date, COUNT(*) as punch_count
//              FROM attendance_logs 
//              GROUP BY log_date 
//              ORDER BY log_date DESC 
//              LIMIT 30`
//         );
//         const [directionStats] = await pool.query(
//             `SELECT direction, COUNT(*) as count 
//              FROM attendance_logs 
//              GROUP BY direction`
//         );

//         res.json({
//             success: true,
//             database_stats: {
//                 total_records: totalRecords[0].total,
//                 unique_employees: uniqueEmployees[0].count,
//                 date_range: {
//                     first_date: dateRange[0].first_date,
//                     last_date: dateRange[0].last_date
//                 },
//                 direction_distribution: directionStats
//             },
//             employee_statistics: employeeStats,
//             recent_date_statistics: dateStats
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             error: error.message
//         });
//     }
// };

// // DEBUG: Load ALL data at once
// export const debugLoadAllData = async (req, res) => {
//     try {
//         const { employee_code, date } = req.query;

//         let query = 'SELECT * FROM attendance_logs';
//         let params = [];
//         let whereConditions = [];

//         if (employee_code) {
//             whereConditions.push('employee_code = ?');
//             params.push(employee_code);
//         }

//         if (date) {
//             whereConditions.push('log_date = ?');
//             params.push(date);
//         }

//         if (whereConditions.length > 0) {
//             query += ' WHERE ' + whereConditions.join(' AND ');
//         }

//         query += ' ORDER BY id ASC';

//         console.log('Loading all data...');
//         const startTime = Date.now();

//         // Query from MAIN DB
//         const [data] = await pool.query(query, params);

//         const endTime = Date.now();
//         const loadTime = ((endTime - startTime) / 1000).toFixed(2);

//         const uniqueEmployees = [...new Set(data.map(d => d.employee_code))];
//         const uniqueDates = [...new Set(data.map(d => moment(d.log_date).format('YYYY-MM-DD')))];
        
//         const inCount = data.filter(d => d.direction === 'in').length;
//         const outCount = data.filter(d => d.direction === 'out').length;

//         res.json({
//             success: true,
//             metadata: {
//                 total_records: data.length,
//                 unique_employees: uniqueEmployees.length,
//                 unique_dates: uniqueDates.length,
//                 direction_stats: {
//                     in: inCount,
//                     out: outCount
//                 },
//                 load_time_seconds: loadTime,
//                 filters_applied: {
//                     employee_code: employee_code || 'none',
//                     date: date || 'none'
//                 }
//             },
//             data: data
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             error: error.message,
//             message: 'Failed to load all data'
//         });
//     }
// };

// // Process logs by date - Handle duplicate IN/OUT
// function processLogsSimple(logs) {
//     const groupedByDate = {};

//     logs.forEach(log => {
//         const date = moment(log.log_date).format('YYYY-MM-DD');
        
//         if (!groupedByDate[date]) {
//             groupedByDate[date] = {
//                 date: date,
//                 allPunches: []
//             };
//         }

//         groupedByDate[date].allPunches.push({
//             id: log.id,
//             time: log.log_time,
//             direction: log.direction,
//             timestamp: log.log_date_time
//         });
//     });

//     const result = [];
//     for (const date in groupedByDate) {
//         const dayData = groupedByDate[date];
        
//         dayData.allPunches.sort((a, b) => a.id - b.id);

//         // Filter consecutive duplicates
//         const cleanedPunches = [];
//         let lastDirection = null;

//         dayData.allPunches.forEach(punch => {
//             if (punch.direction === lastDirection) {
//                 return; // Skip duplicate
//             }
//             cleanedPunches.push(punch);
//             lastDirection = punch.direction;
//         });

//         const allIns = [];
//         const allOuts = [];

//         cleanedPunches.forEach(punch => {
//             if (punch.direction === 'in') {
//                 allIns.push(punch);
//             } else if (punch.direction === 'out') {
//                 allOuts.push(punch);
//             }
//         });

//         const pairs = [];
//         const maxPairs = Math.max(allIns.length, allOuts.length);
        
//         for (let i = 0; i < maxPairs; i++) {
//             const inPunch = allIns[i];
//             const outPunch = allOuts[i];
            
//             const duration = calculateSimpleDuration(date, inPunch?.time, outPunch?.time);
            
//             pairs.push({
//                 in: inPunch ? inPunch.time : null,
//                 out: outPunch ? outPunch.time : null,
//                 duration: duration
//             });
//         }

//         let totalMinutes = 0;
//         pairs.forEach(pair => {
//             if (pair.duration && pair.duration > 0) {
//                 totalMinutes += pair.duration;
//             }
//         });

//         result.push({
//             date: date,
//             first_in: allIns[0]?.time || null,
//             last_out: allOuts[allOuts.length - 1]?.time || null,
//             pairs: pairs,
//             total_hours: (totalMinutes / 60).toFixed(2),
//             punch_count: cleanedPunches.length,
//             raw_punch_count: dayData.allPunches.length
//         });
//     }

//     result.sort((a, b) => new Date(b.date) - new Date(a.date));

//     return result;
// }

// // Calculate duration
// function calculateSimpleDuration(date, inTime, outTime) {
//     if (!inTime || !outTime) return null;

//     try {
//         const inDateTime = moment(`${date} ${inTime}`, 'YYYY-MM-DD HH:mm:ss');
//         const outDateTime = moment(`${date} ${outTime}`, 'YYYY-MM-DD HH:mm:ss');
//         const duration = outDateTime.diff(inDateTime, 'minutes');
//         return duration > 0 ? duration : null;
//     } catch (error) {
//         console.error('Duration calculation error:', error);
//         return null;
//     }
// }

// // Get employee details
// async function getEmployeeDetails(employeeCodes) {
//     if (employeeCodes.length === 0) return {};

//     const placeholders = employeeCodes.map(() => '?').join(',');
//     const [employees] = await pool.query(
//         `SELECT u.employee_id, u.name, e.designation, d.department_name
//          FROM users u
//          JOIN employees e ON u.id = e.user_id
//          LEFT JOIN departments d ON e.department_id = d.id
//          WHERE u.employee_id IN (${placeholders})`,
//         employeeCodes
//     );

//     const employeeMap = {};
//     employees.forEach(emp => {
//         employeeMap[emp.employee_id] = emp;
//     });

//     return employeeMap;
// }
