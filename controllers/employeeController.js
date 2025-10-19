// import pool from '../config/db.js';

// export const getAllEmployees = async (req, res) => {
//     try {
//         const [employees] = await pool.query(
//             `SELECT u.id, u.employee_id, u.name, u.email,
//                     e.id as emp_id, e.mobile_number, e.designation,
//                     e.date_of_birth, e.date_of_joining, e.is_active,
//                     r.role_name, r.id as role_id,
//                     d.department_name, d.id as department_id,
//                     rm.name as reporting_manager_name
//              FROM users u
//              JOIN employees e ON u.id = e.user_id
//              JOIN roles r ON e.role_id = r.id
//              LEFT JOIN departments d ON e.department_id = d.id
//              LEFT JOIN employees rme ON e.reporting_manager_id = rme.id
//              LEFT JOIN users rm ON rme.user_id = rm.id
//              WHERE e.is_active = TRUE
//              ORDER BY u.name`
//         );

//         res.json({
//             success: true,
//             data: employees
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching employees',
//             error: error.message
//         });
//     }
// };

// export const getReportingManagers = async (req, res) => {
//     try {
//         const [employees] = await pool.query(
//             `SELECT u.id, u.employee_id, u.name, u.email,
//                     e.id as emp_id, e.designation, r.role_name
//              FROM users u
//              JOIN employees e ON u.id = e.user_id
//              JOIN roles r ON e.role_id = r.id
//              WHERE r.role_name IN ('hr', 'manager', 'tl') AND e.is_active = TRUE
//              ORDER BY 
//                 CASE r.role_name 
//                     WHEN 'hr' THEN 1
//                     WHEN 'manager' THEN 2
//                     WHEN 'tl' THEN 3
//                 END, u.name`
//         );

//         res.json({
//             success: true,
//             data: employees
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching reporting managers',
//             error: error.message
//         });
//     }
// };

// export const getEmployeeById = async (req, res) => {
//     try {
//         const { id } = req.params;
        
//         const [employees] = await pool.query(
//             `SELECT u.*, e.*, r.role_name, d.department_name
//              FROM users u
//              JOIN employees e ON u.id = e.user_id
//              JOIN roles r ON e.role_id = r.id
//              LEFT JOIN departments d ON e.department_id = d.id
//              WHERE e.id = ?`,
//             [id]
//         );

//         if (employees.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Employee not found'
//             });
//         }

//         res.json({
//             success: true,
//             data: employees[0]
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching employee',
//             error: error.message
//         });
//     }
// };

// export const createEmployee = async (req, res) => {
//     const connection = await pool.getConnection();
//     try {
//         await connection.beginTransaction();

//         const {
//             employee_id, name, email, password, mobile_number,
//             role_id, department_id, reporting_manager_id,
//             date_of_birth, date_of_joining, designation
//         } = req.body;

//         // Check if user exists
//         const [existingUsers] = await connection.query(
//             'SELECT * FROM users WHERE email = ? OR employee_id = ?',
//             [email, employee_id]
//         );

//         if (existingUsers.length > 0) {
//             await connection.rollback();
//             return res.status(400).json({
//                 success: false,
//                 message: 'User already exists'
//             });
//         }

//         // Hash password
//         const bcrypt = (await import('bcryptjs')).default;
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Insert user
//         const [userResult] = await connection.query(
//             'INSERT INTO users (employee_id, name, email, password) VALUES (?, ?, ?, ?)',
//             [employee_id, name, email, hashedPassword]
//         );

//         const userId = userResult.insertId;

//         // Insert employee
//         await connection.query(
//             `INSERT INTO employees (user_id, mobile_number, role_id, department_id, 
//              reporting_manager_id, date_of_birth, date_of_joining, designation)
//              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//             [userId, mobile_number, role_id, department_id, reporting_manager_id,
//              date_of_birth, date_of_joining, designation]
//         );

//         // Get employee id
//         const [employee] = await connection.query('SELECT id FROM employees WHERE user_id = ?', [userId]);
//         const employeeId = employee[0].id;

//         // Initialize leave balances for current year
//         const currentYear = new Date().getFullYear();
//         const [leaveTypes] = await connection.query('SELECT * FROM leave_types WHERE is_active = TRUE');

//         for (const leaveType of leaveTypes) {
//             let initialBalance = 0;
//             if (leaveType.leave_code === 'CL') initialBalance = 1;
//             if (leaveType.leave_code === 'EL') initialBalance = 1;
//             if (leaveType.leave_code === 'WFH') initialBalance = 2;

//             if (initialBalance > 0) {
//                 await connection.query(
//                     `INSERT INTO leave_balances (employee_id, leave_type_id, year, credited, balance)
//                      VALUES (?, ?, ?, ?, ?)`,
//                     [employeeId, leaveType.id, currentYear, initialBalance, initialBalance]
//                 );
//             }
//         }

//         await connection.commit();

//         res.status(201).json({
//             success: true,
//             message: 'Employee created successfully'
//         });
//     } catch (error) {
//         await connection.rollback();
//         res.status(500).json({
//             success: false,
//             message: 'Error creating employee',
//             error: error.message
//         });
//     } finally {
//         connection.release();
//     }
// };

// export const updateEmployee = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const {
//             name, email, mobile_number, role_id, department_id,
//             reporting_manager_id, date_of_birth, designation, is_active,
//             employee_id, date_of_joining  // Add both fields
//         } = req.body;

//         // Get user_id from employee
//         const [employee] = await pool.query('SELECT user_id FROM employees WHERE id = ?', [id]);
        
//         if (employee.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Employee not found'
//             });
//         }

//         const userId = employee[0].user_id;

//         // Update user table (includes employee_id)
//         await pool.query(
//             'UPDATE users SET name = ?, email = ?, employee_id = ? WHERE id = ?',
//             [name, email, employee_id, userId]
//         );

//         // Update employee table (includes date_of_joining)
//         await pool.query(
//             `UPDATE employees 
//              SET mobile_number = ?, role_id = ?, department_id = ?, 
//                  reporting_manager_id = ?, date_of_birth = ?, date_of_joining = ?, 
//                  designation = ?, is_active = ?
//              WHERE id = ?`,
//             [mobile_number, role_id, department_id, reporting_manager_id, 
//              date_of_birth, date_of_joining, designation, is_active, id]
//         );

//         res.json({
//             success: true,
//             message: 'Employee updated successfully'
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error updating employee',
//             error: error.message
//         });
//     }
// };





// export const deleteEmployee = async (req, res) => {
//     const connection = await pool.getConnection();
//     try {
//         await connection.beginTransaction();

//         const { id } = req.params;

//         // Get user_id before deleting employee
//         const [employee] = await connection.query(
//             'SELECT user_id FROM employees WHERE id = ?',
//             [id]
//         );

//         if (employee.length === 0) {
//             await connection.rollback();
//             return res.status(404).json({
//                 success: false,
//                 message: 'Employee not found'
//             });
//         }

//         const userId = employee[0].user_id;

//         // Delete in proper order to avoid foreign key constraint errors

//         // 1. Delete leave applications
//         await connection.query(
//             'DELETE FROM leave_applications WHERE employee_id = ?',
//             [id]
//         );

//         // 2. Delete leave balances
//         await connection.query(
//             'DELETE FROM leave_balances WHERE employee_id = ?',
//             [id]
//         );

//         // 3. Delete attendance logs (if employee_code matches)
//         // await connection.query(
//         //     'DELETE FROM attendance_logs WHERE employee_code = (SELECT employee_id FROM users WHERE id = ?)',
//         //     [userId]
//         // );

//         // 4. Update employees who report to this employee (set reporting_manager_id to NULL)
//         await connection.query(
//             'UPDATE employees SET reporting_manager_id = NULL WHERE reporting_manager_id = ?',
//             [id]
//         );

//         // 5. Delete employee record
//         await connection.query(
//             'DELETE FROM employees WHERE id = ?',
//             [id]
//         );

//         // 6. Delete user record (final step)
//         await connection.query(
//             'DELETE FROM users WHERE id = ?',
//             [userId]
//         );

//         await connection.commit();

//         res.json({
//             success: true,
//             message: 'Employee and all related data deleted successfully'
//         });
//     } catch (error) {
//         await connection.rollback();
//         console.error('Error deleting employee:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error deleting employee',
//             error: error.message
//         });
//     } finally {
//         connection.release();
//     }
// };

import pool from '../config/db.js';

export const getAllEmployees = async (req, res) => {
    try {
        const [employees] = await pool.query(
            `SELECT u.id, u.employee_id, u.name, u.email,
                    e.id as emp_id, e.mobile_number, e.designation,
                    e.date_of_birth, e.date_of_joining, e.is_active,
                    r.role_name, r.id as role_id,
                    d.department_name, d.id as department_id,
                    rm.name as reporting_manager_name,
                    ed.id as emp_detail_id, ed.office_email, ed.badge_number,
                    ed.emergency_contact_name, ed.emergency_contact_number,
                    ed.blood_group, ed.permanent_address, ed.current_address
             FROM users u
             JOIN employees e ON u.id = e.user_id
             JOIN roles r ON e.role_id = r.id
             LEFT JOIN departments d ON e.department_id = d.id
             LEFT JOIN employees rme ON e.reporting_manager_id = rme.id
             LEFT JOIN users rm ON rme.user_id = rm.id
             LEFT JOIN employee_details ed ON e.id = ed.employee_id
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
            `SELECT u.*, e.*, r.role_name, d.department_name,
                    ed.office_email, ed.badge_number, ed.emergency_contact_name,
                    ed.emergency_contact_number, ed.blood_group, 
                    ed.permanent_address, ed.current_address
             FROM users u
             JOIN employees e ON u.id = e.user_id
             JOIN roles r ON e.role_id = r.id
             LEFT JOIN departments d ON e.department_id = d.id
             LEFT JOIN employee_details ed ON e.id = ed.employee_id
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
            date_of_birth, date_of_joining, designation,
            office_email, badge_number, emergency_contact_name,
            emergency_contact_number, blood_group, permanent_address,
            current_address
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

        // Check if badge number exists (if provided)
        if (badge_number) {
            const [existingBadge] = await connection.query(
                'SELECT * FROM employee_details WHERE badge_number = ?',
                [badge_number]
            );

            if (existingBadge.length > 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Badge number already exists'
                });
            }
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

        // Insert employee details
        await connection.query(
            `INSERT INTO employee_details 
             (employee_id, office_email, badge_number, emergency_contact_name,
              emergency_contact_number, blood_group, permanent_address, current_address)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [employeeId, office_email || null, badge_number || null, 
             emergency_contact_name || null, emergency_contact_number || null,
             blood_group || null, permanent_address || null, current_address || null]
        );

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
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const {
            name, email, mobile_number, role_id, department_id,
            reporting_manager_id, date_of_birth, designation, is_active,
            employee_id, date_of_joining,
            office_email, badge_number, emergency_contact_name,
            emergency_contact_number, blood_group, permanent_address,
            current_address
        } = req.body;

        // Get user_id from employee
        const [employee] = await connection.query('SELECT user_id FROM employees WHERE id = ?', [id]);
        
        if (employee.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const userId = employee[0].user_id;

        // Check if badge number exists (if provided and changed)
        if (badge_number) {
            const [existingBadge] = await connection.query(
                'SELECT * FROM employee_details WHERE badge_number = ? AND employee_id != ?',
                [badge_number, id]
            );

            if (existingBadge.length > 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Badge number already exists'
                });
            }
        }

        // Update user table (includes employee_id)
        await connection.query(
            'UPDATE users SET name = ?, email = ?, employee_id = ? WHERE id = ?',
            [name, email, employee_id, userId]
        );

        // Update employee table (includes date_of_joining)
        await connection.query(
            `UPDATE employees 
             SET mobile_number = ?, role_id = ?, department_id = ?, 
                 reporting_manager_id = ?, date_of_birth = ?, date_of_joining = ?, 
                 designation = ?, is_active = ?
             WHERE id = ?`,
            [mobile_number, role_id, department_id, reporting_manager_id, 
             date_of_birth, date_of_joining, designation, is_active, id]
        );

        // Update or insert employee_details
        const [existingDetails] = await connection.query(
            'SELECT id FROM employee_details WHERE employee_id = ?',
            [id]
        );

        if (existingDetails.length > 0) {
            // Update existing details
            await connection.query(
                `UPDATE employee_details 
                 SET office_email = ?, badge_number = ?, 
                     emergency_contact_name = ?, emergency_contact_number = ?,
                     blood_group = ?, permanent_address = ?, current_address = ?
                 WHERE employee_id = ?`,
                [office_email || null, badge_number || null,
                 emergency_contact_name || null, emergency_contact_number || null,
                 blood_group || null, permanent_address || null, 
                 current_address || null, id]
            );
        } else {
            // Insert new details
            await connection.query(
                `INSERT INTO employee_details 
                 (employee_id, office_email, badge_number, emergency_contact_name,
                  emergency_contact_number, blood_group, permanent_address, current_address)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, office_email || null, badge_number || null,
                 emergency_contact_name || null, emergency_contact_number || null,
                 blood_group || null, permanent_address || null, current_address || null]
            );
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Employee updated successfully'
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            success: false,
            message: 'Error updating employee',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

export const deleteEmployee = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { id } = req.params;

        // Get user_id before deleting employee
        const [employee] = await connection.query(
            'SELECT user_id FROM employees WHERE id = ?',
            [id]
        );

        if (employee.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const userId = employee[0].user_id;

        // Delete in proper order to avoid foreign key constraint errors

        // 1. Delete leave applications
        await connection.query(
            'DELETE FROM leave_applications WHERE employee_id = ?',
            [id]
        );

        // 2. Delete leave balances
        await connection.query(
            'DELETE FROM leave_balances WHERE employee_id = ?',
            [id]
        );

        // 3. Delete employee details (NEW)
        await connection.query(
            'DELETE FROM employee_details WHERE employee_id = ?',
            [id]
        );

        // 4. Delete attendance logs (if employee_code matches)
        // await connection.query(
        //     'DELETE FROM attendance_logs WHERE employee_code = (SELECT employee_id FROM users WHERE id = ?)',
        //     [userId]
        // );

        // 5. Update employees who report to this employee (set reporting_manager_id to NULL)
        await connection.query(
            'UPDATE employees SET reporting_manager_id = NULL WHERE reporting_manager_id = ?',
            [id]
        );

        // 6. Delete employee record
        await connection.query(
            'DELETE FROM employees WHERE id = ?',
            [id]
        );

        // 7. Delete user record (final step)
        await connection.query(
            'DELETE FROM users WHERE id = ?',
            [userId]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Employee and all related data deleted successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting employee:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting employee',
            error: error.message
        });
    } finally {
        connection.release();
    }
};
