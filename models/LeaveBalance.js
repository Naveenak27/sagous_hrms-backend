import pool from '../config/db.js';




export const getEmployeeLeaveBalance = async (employeeId, year) => {
    const [balances] = await pool.query(
        `SELECT lb.*, lt.leave_name, lt.leave_code, lt.is_carry_forward
         FROM leave_balances lb
         JOIN leave_types lt ON lb.leave_type_id = lt.id
         WHERE lb.employee_id = ? AND lb.year = ?`,
        [employeeId, year]
    );
    return balances;
};

export const updateLeaveBalance = async (employeeId, leaveTypeId, year, used) => {
    await pool.query(
        `UPDATE leave_balances 
         SET used = used + ?, balance = balance - ?
         WHERE employee_id = ? AND leave_type_id = ? AND year = ?`,
        [used, used, employeeId, leaveTypeId, year]
    );
};

export const initializeLeaveBalance = async (employeeId, leaveTypeId, year, credited) => {
    await pool.query(
        `INSERT INTO leave_balances (employee_id, leave_type_id, year, credited, balance)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE credited = credited + ?, balance = balance + ?`,
        [employeeId, leaveTypeId, year, credited, credited, credited, credited]
    );
};
