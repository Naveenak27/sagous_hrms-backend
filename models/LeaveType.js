import pool from '../config/db.js';

export const getAllLeaveTypes = async () => {
    const [leaveTypes] = await pool.query(
        'SELECT * FROM leave_types WHERE is_active = TRUE ORDER BY leave_name'
    );
    return leaveTypes;
};

export const findLeaveTypeById = async (id) => {
    const [leaveTypes] = await pool.query('SELECT * FROM leave_types WHERE id = ?', [id]);
    return leaveTypes[0];
};

export const createLeaveType = async (leaveTypeData) => {
    const { leave_code, leave_name, description, is_carry_forward, max_days_per_year } = leaveTypeData;
    const [result] = await pool.query(
        `INSERT INTO leave_types (leave_code, leave_name, description, is_carry_forward, max_days_per_year)
         VALUES (?, ?, ?, ?, ?)`,
        [leave_code, leave_name, description, is_carry_forward, max_days_per_year]
    );
    return result.insertId;
};
