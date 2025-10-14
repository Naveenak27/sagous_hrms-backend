import pool from '../config/db.js';

export const createEmployee = async (employeeData) => {
    const {
        user_id, mobile_number, role_id, department_id,
        reporting_manager_id, date_of_birth, date_of_joining, designation
    } = employeeData;

    const [result] = await pool.query(
        `INSERT INTO employees 
        (user_id, mobile_number, role_id, department_id, reporting_manager_id, 
         date_of_birth, date_of_joining, designation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, mobile_number, role_id, department_id, reporting_manager_id,
         date_of_birth, date_of_joining, designation]
    );

    return result.insertId;
};

export const findEmployeeByUserId = async (userId) => {
    const [employees] = await pool.query('SELECT * FROM employees WHERE user_id = ?', [userId]);
    return employees[0];
};

export const getAllEmployees = async () => {
    const [employees] = await pool.query(
        `SELECT e.*, u.name, u.email, u.employee_id, r.role_name
         FROM employees e
         JOIN users u ON e.user_id = u.id
         JOIN roles r ON e.role_id = r.id
         ORDER BY u.name`
    );
    return employees;
};
