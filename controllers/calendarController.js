import pool from '../config/db.js';
import moment from 'moment';

export const getCalendarEvents = async (req, res) => {
    try {
        const { month, year } = req.query;
        const role = req.user.role_name;
        
        let events = [];

        // Get public holidays for the month
        const [holidays] = await pool.query(
            `SELECT id, holiday_name as title, holiday_date as date, 
                    description, 'holiday' as type
             FROM public_holidays
             WHERE YEAR(holiday_date) = ? AND MONTH(holiday_date) = ?`,
            [year, month]
        );
        events = [...holidays];

        if (role === 'hr' || role === 'manager' || role === 'superadmin') {
            // Get all approved leaves
            const [leaves] = await pool.query(
                `SELECT la.id, CONCAT(u.name, ' - ', lt.leave_name) as title,
                        la.from_date as date, la.to_date, 'leave' as type, 
                        u.name as employee_name
                 FROM leave_applications la
                 JOIN employees e ON la.employee_id = e.id
                 JOIN users u ON e.user_id = u.id
                 JOIN leave_types lt ON la.leave_type_id = lt.id
                 WHERE la.status = 'approved'
                 AND ((YEAR(la.from_date) = ? AND MONTH(la.from_date) = ?)
                      OR (YEAR(la.to_date) = ? AND MONTH(la.to_date) = ?))`,
                [year, month, year, month]
            );

            // Expand multi-day leaves into individual dates
            for (const leave of leaves) {
                const start = moment(leave.date);
                const end = moment(leave.to_date);
                
                for (let m = moment(start); m.isSameOrBefore(end); m.add(1, 'days')) {
                    if (m.month() + 1 == month) {
                        events.push({
                            ...leave,
                            date: m.format('YYYY-MM-DD')
                        });
                    }
                }
            }

            // Get employee birthdays
            const [birthdays] = await pool.query(
                `SELECT e.id, CONCAT(u.name, '''s Birthday') as title,
                        DATE_FORMAT(e.date_of_birth, CONCAT(?, '-%m-%d')) as date, 
                        'birthday' as type, u.name as employee_name
                 FROM employees e
                 JOIN users u ON e.user_id = u.id
                 WHERE MONTH(e.date_of_birth) = ? AND e.date_of_birth IS NOT NULL`,
                [year, month]
            );
            events = [...events, ...birthdays];
        } else {
            // Employees see only their leaves and holidays
            const [myLeaves] = await pool.query(
                `SELECT la.id, CONCAT(lt.leave_name) as title,
                        la.from_date as date, la.to_date, 'leave' as type
                 FROM leave_applications la
                 JOIN leave_types lt ON la.leave_type_id = lt.id
                 WHERE la.employee_id = ? AND la.status = 'approved'
                 AND ((YEAR(la.from_date) = ? AND MONTH(la.from_date) = ?)
                      OR (YEAR(la.to_date) = ? AND MONTH(la.to_date) = ?))`,
                [req.user.emp_id, year, month, year, month]
            );

            for (const leave of myLeaves) {
                const start = moment(leave.date);
                const end = moment(leave.to_date);
                
                for (let m = moment(start); m.isSameOrBefore(end); m.add(1, 'days')) {
                    if (m.month() + 1 == month) {
                        events.push({
                            ...leave,
                            date: m.format('YYYY-MM-DD')
                        });
                    }
                }
            }
        }

        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching calendar events',
            error: error.message
        });
    }
};
