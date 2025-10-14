import pool from '../config/db.js';

export const createLeaveApplication = async (leaveData) => {
    const { employee_id, leave_type_id, from_date, to_date, number_of_days, reason } = leaveData;
    
    const [result] = await pool.query(
        `INSERT INTO leave_applications 
        (employee_id, leave_type_id, from_date, to_date, number_of_days, reason)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [employee_id, leave_type_id, from_date, to_date, number_of_days, reason]
    );
    
    return result.insertId;
};

export const getEmployeeLeaves = async (employeeId) => {
    const [leaves] = await pool.query(
        `SELECT la.*, lt.leave_name, lt.leave_code
         FROM leave_applications la
         JOIN leave_types lt ON la.leave_type_id = lt.id
         WHERE la.employee_id = ?
         ORDER BY la.applied_date DESC`,
        [employeeId]
    );
    return leaves;
};

export const findLeaveById = async (id) => {
    const [leaves] = await pool.query('SELECT * FROM leave_applications WHERE id = ?', [id]);
    return leaves[0];
};

export const updateLeaveStatus = async (id, status, approverData) => {
    const fields = Object.keys(approverData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(approverData), status, id];
    
    await pool.query(
        `UPDATE leave_applications SET ${fields}, status = ? WHERE id = ?`,
        values
    );
};
