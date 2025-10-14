import pool from '../config/db.js';

export const getAllEmployees = async (req, res) => {
    try {
        const [employees] = await pool.query(
            `SELECT u.id, u.employee_id, u.name, u.email,
                    e.id as emp_id, e.mobile_number, e.designation,
                    e.date_of_birth, e.date_of_joining, e.is_active,
                    r.role_name, r.id as role_id,
                    d.department_name, d.id as department_id,
                    rm.name as reporting_manager_name
             FROM users u
             JOIN employees e ON u.id = e.user_id
             JOIN roles r ON e.role_id = r.id
             LEFT JOIN departments d ON e.department_id = d.id
             LEFT JOIN employees rme ON e.reporting_manager_id = rme.id
             LEFT JOIN users rm ON rme.user_id = rm.id
             WHERE e.is_active = TRUE
             ORDER BY u.name`
        );

        res.json({
            success: true,
            data: employees
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employees',
            error: error.message
        });
    }
};

export const getReportingManagers = async (req, res) => {
    try {
        const [employees] = await pool.query(
            `SELECT u.id, u.employee_id, u.name, u.email,
                    e.id as emp_id, e.designation, r.role_name
             FROM users u
             JOIN employees e ON u.id = e.user_id
             JOIN roles r ON e.role_id = r.id
             WHERE r.role_name IN ('hr', 'manager', 'tl') AND e.is_active = TRUE
             ORDER BY 
                CASE r.role_name 
                    WHEN 'hr' THEN 1
                    WHEN 'manager' THEN 2
                    WHEN 'tl' THEN 3
                END, u.name`
        );

        res.json({
            success: true,
            data: employees
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching reporting managers',
            error: error.message
        });
    }
};

export const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [employees] = await pool.query(
            `SELECT u.*, e.*, r.role_name, d.department_name
             FROM users u
             JOIN employees e ON u.id = e.user_id
             JOIN roles r ON e.role_id = r.id
             LEFT JOIN departments d ON e.department_id = d.id
             WHERE e.id = ?`,
            [id]
        );

        if (employees.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.json({
            success: true,
            data: employees[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employee',
            error: error.message
        });
    }
};

export const createEmployee = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const {
            employee_id, name, email, password, mobile_number,
            role_id, department_id, reporting_manager_id,
            date_of_birth, date_of_joining, designation
        } = req.body;

        // Check if user exists
        const [existingUsers] = await connection.query(
            'SELECT * FROM users WHERE email = ? OR employee_id = ?',
            [email, employee_id]
        );

        if (existingUsers.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Hash password
        const bcrypt = (await import('bcryptjs')).default;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [userResult] = await connection.query(
            'INSERT INTO users (employee_id, name, email, password) VALUES (?, ?, ?, ?)',
            [employee_id, name, email, hashedPassword]
        );

        const userId = userResult.insertId;

        // Insert employee
        await connection.query(
            `INSERT INTO employees (user_id, mobile_number, role_id, department_id, 
             reporting_manager_id, date_of_birth, date_of_joining, designation)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, mobile_number, role_id, department_id, reporting_manager_id,
             date_of_birth, date_of_joining, designation]
        );

        // Get employee id
        const [employee] = await connection.query('SELECT id FROM employees WHERE user_id = ?', [userId]);
        const employeeId = employee[0].id;

        // Initialize leave balances for current year
        const currentYear = new Date().getFullYear();
        const [leaveTypes] = await connection.query('SELECT * FROM leave_types WHERE is_active = TRUE');

        for (const leaveType of leaveTypes) {
            let initialBalance = 0;
            if (leaveType.leave_code === 'CL') initialBalance = 1;
            if (leaveType.leave_code === 'EL') initialBalance = 1;
            if (leaveType.leave_code === 'WFH') initialBalance = 2;

            if (initialBalance > 0) {
                await connection.query(
                    `INSERT INTO leave_balances (employee_id, leave_type_id, year, credited, balance)
                     VALUES (?, ?, ?, ?, ?)`,
                    [employeeId, leaveType.id, currentYear, initialBalance, initialBalance]
                );
            }
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Employee created successfully'
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            success: false,
            message: 'Error creating employee',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, email, mobile_number, role_id, department_id,
            reporting_manager_id, date_of_birth, designation, is_active
        } = req.body;

        // Get user_id from employee
        const [employee] = await pool.query('SELECT user_id FROM employees WHERE id = ?', [id]);
        
        if (employee.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const userId = employee[0].user_id;

        // Update user
        await pool.query(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [name, email, userId]
        );

        // Update employee
        await pool.query(
            `UPDATE employees 
             SET mobile_number = ?, role_id = ?, department_id = ?, 
                 reporting_manager_id = ?, date_of_birth = ?, designation = ?, is_active = ?
             WHERE id = ?`,
            [mobile_number, role_id, department_id, reporting_manager_id, 
             date_of_birth, designation, is_active, id]
        );

        res.json({
            success: true,
            message: 'Employee updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating employee',
            error: error.message
        });
    }
};

export const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM employees WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Employee deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting employee',
            error: error.message
        });
    }
};
