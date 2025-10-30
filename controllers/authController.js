import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const register = async (req, res) => {
    try {
        const {
            employee_id, name, email, password, mobile_number,
            role_id, department_id, reporting_manager_id,
            date_of_birth, date_of_joining, designation
        } = req.body;

        // Check if user exists
        const [existingUsers] = await pool.query(
            'SELECT * FROM users WHERE email = ? OR employee_id = ?',
            [email, employee_id]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [userResult] = await pool.query(
            'INSERT INTO users (employee_id, name, email, password) VALUES (?, ?, ?, ?)',
            [employee_id, name, email, hashedPassword]
        );

        const userId = userResult.insertId;

        // Insert employee
        await pool.query(
            `INSERT INTO employees (user_id, mobile_number, role_id, department_id, 
             reporting_manager_id, date_of_birth, date_of_joining, designation)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, mobile_number, role_id, department_id, reporting_manager_id,
             date_of_birth, date_of_joining, designation]
        );

        // Get employee id
        const [employee] = await pool.query('SELECT id FROM employees WHERE user_id = ?', [userId]);
        const employeeId = employee[0].id;

        // Initialize leave balances for current year
        const currentYear = new Date().getFullYear();
        const [leaveTypes] = await pool.query('SELECT * FROM leave_types WHERE is_active = TRUE');

        for (const leaveType of leaveTypes) {
            let initialBalance = 0;
            if (leaveType.leave_code === 'CL') initialBalance = 1; // 1 per month
            if (leaveType.leave_code === 'EL') initialBalance = 1; // 1 per month
            if (leaveType.leave_code === 'WFH') initialBalance = 2; // 2 per month

            await pool.query(
                `INSERT INTO leave_balances (employee_id, leave_type_id, year, opening_balance, credited, balance)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [employeeId, leaveType.id, currentYear, 0, initialBalance, initialBalance]
            );
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Get user with employee details
        const [users] = await pool.query(
            `SELECT u.*, e.id as emp_id, e.role_id, r.role_name, e.department_id,
                    e.reporting_manager_id, e.designation
             FROM users u
             LEFT JOIN employees e ON u.id = e.user_id
             LEFT JOIN roles r ON e.role_id = r.id
             WHERE u.email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Get user permissions - FIXED QUERY
        const [permissions] = await pool.query(
            `SELECT DISTINCT m.module_name, p.permission_name
             FROM role_permissions rp
             JOIN modules m ON rp.module_id = m.id
             JOIN permissions p ON rp.permission_id = p.id
             WHERE rp.role_id = ?
             ORDER BY m.module_name, p.permission_name`,
            [user.role_id]
        );

        console.log('User Role:', user.role_name);
        console.log('Permissions for role:', permissions);

        // Create token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                employee_id: user.employee_id,
                emp_id: user.emp_id,
                name: user.name,
                email: user.email,
                role_id: user.role_id,
                role_name: user.role_name,
                department_id: user.department_id,
                reporting_manager_id: user.reporting_manager_id,
                designation: user.designation
            },
            permissions
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT u.id, u.employee_id, u.name, u.email,
                    e.mobile_number, e.date_of_birth, e.date_of_joining,
                    e.designation, r.role_name, d.department_name,
                    rm.name as reporting_manager_name
             FROM users u
             LEFT JOIN employees e ON u.id = e.user_id
             LEFT JOIN roles r ON e.role_id = r.id
             LEFT JOIN departments d ON e.department_id = d.id
             LEFT JOIN employees rme ON e.reporting_manager_id = rme.id
             LEFT JOIN users rm ON rme.user_id = rm.id
             WHERE u.id = ?`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};
// Add this function to your authController.js

export const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both old and new passwords'
            });
        }

        // Get user with password
        const [users] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Check if new password is same as old password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from current password'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await pool.query(
            'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
            [hashedPassword, userId]
        );

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating password',
            error: error.message
        });
    }
};
