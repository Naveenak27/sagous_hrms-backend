import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
    const connection = await pool.getConnection();
    
    try {
        console.log('🚀 Starting database migration...');
        console.log('='.repeat(50));

        // Create tables directly in code
        await createTables(connection);
        
        // Insert seed data
        await insertSeeds(connection);

        console.log('='.repeat(50));
        console.log('🎉 Database migration completed!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        connection.release();
    }
};

const createTables = async (connection) => {
    console.log('📝 Creating tables...');
    
    const tables = [
        // 1. Users
        `CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            employee_id VARCHAR(20) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_employee_id (employee_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

        // 2. Roles
        `CREATE TABLE IF NOT EXISTS roles (
            id INT PRIMARY KEY AUTO_INCREMENT,
            role_name VARCHAR(50) UNIQUE NOT NULL,
            description VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_role_name (role_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

        // 3. Modules
        `CREATE TABLE IF NOT EXISTS modules (
            id INT PRIMARY KEY AUTO_INCREMENT,
            module_name VARCHAR(50) UNIQUE NOT NULL,
            description VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_module_name (module_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

        // 4. Permissions
        `CREATE TABLE IF NOT EXISTS permissions (
            id INT PRIMARY KEY AUTO_INCREMENT,
            permission_name VARCHAR(50) UNIQUE NOT NULL,
            description VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_permission_name (permission_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

        // 5. Departments
        `CREATE TABLE IF NOT EXISTS departments (
            id INT PRIMARY KEY AUTO_INCREMENT,
            department_name VARCHAR(100) NOT NULL,
            description VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_department_name (department_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

        // 6. Role Permissions
        `CREATE TABLE IF NOT EXISTS role_permissions (
            id INT PRIMARY KEY AUTO_INCREMENT,
            role_id INT NOT NULL,
            module_id INT NOT NULL,
            permission_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
            FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
            FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
            UNIQUE KEY unique_role_module_permission (role_id, module_id, permission_id),
            INDEX idx_role_id (role_id),
            INDEX idx_module_id (module_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

        // 7. Employees
        `CREATE TABLE IF NOT EXISTS employees (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT UNIQUE NOT NULL,
            mobile_number VARCHAR(15),
            role_id INT NOT NULL,
            department_id INT,
            reporting_manager_id INT,
            date_of_birth DATE,
            date_of_joining DATE,
            designation VARCHAR(100),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (role_id) REFERENCES roles(id),
            FOREIGN KEY (department_id) REFERENCES departments(id),
            FOREIGN KEY (reporting_manager_id) REFERENCES employees(id) ON DELETE SET NULL,
            INDEX idx_user_id (user_id),
            INDEX idx_role_id (role_id),
            INDEX idx_reporting_manager (reporting_manager_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

        // 8. Leave Types
        `CREATE TABLE IF NOT EXISTS leave_types (
            id INT PRIMARY KEY AUTO_INCREMENT,
            leave_code VARCHAR(10) UNIQUE NOT NULL,
            leave_name VARCHAR(50) NOT NULL,
            description VARCHAR(255),
            is_carry_forward BOOLEAN DEFAULT FALSE,
            max_days_per_year INT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_leave_code (leave_code)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

        // 9. Leave Balances
        `CREATE TABLE IF NOT EXISTS leave_balances (
            id INT PRIMARY KEY AUTO_INCREMENT,
            employee_id INT NOT NULL,
            leave_type_id INT NOT NULL,
            year INT NOT NULL,
            opening_balance DECIMAL(5,1) DEFAULT 0,
            credited DECIMAL(5,1) DEFAULT 0,
            used DECIMAL(5,1) DEFAULT 0,
            balance DECIMAL(5,1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
            FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
            UNIQUE KEY unique_employee_leave_year (employee_id, leave_type_id, year),
            INDEX idx_employee_year (employee_id, year)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

        // 10. Leave Applications
        `CREATE TABLE IF NOT EXISTS leave_applications (
            id INT PRIMARY KEY AUTO_INCREMENT,
            employee_id INT NOT NULL,
            leave_type_id INT NOT NULL,
            from_date DATE NOT NULL,
            to_date DATE NOT NULL,
            number_of_days DECIMAL(5,1) NOT NULL,
            reason TEXT,
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            approved_by INT,
            approved_at TIMESTAMP NULL,
            approver_comments TEXT,
            rejected_by INT,
            rejected_at TIMESTAMP NULL,
            rejection_reason TEXT,
            applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
            FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
            FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL,
            FOREIGN KEY (rejected_by) REFERENCES employees(id) ON DELETE SET NULL,
            INDEX idx_employee_id (employee_id),
            INDEX idx_status (status),
            INDEX idx_dates (from_date, to_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

        // 11. Public Holidays
        `CREATE TABLE IF NOT EXISTS public_holidays (
            id INT PRIMARY KEY AUTO_INCREMENT,
            holiday_name VARCHAR(100) NOT NULL,
            holiday_date DATE NOT NULL,
            description VARCHAR(255),
            is_mandatory BOOLEAN DEFAULT TRUE,
            year INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_holiday_date (holiday_date),
            INDEX idx_year (year),
            INDEX idx_date (holiday_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    ];

    for (let i = 0; i < tables.length; i++) {
        try {
            await connection.query(tables[i]);
            console.log(`  ✓ Table ${i + 1}/${tables.length} created`);
        } catch (error) {
            if (!error.message.includes('already exists')) {
                console.error(`  ✗ Error creating table ${i + 1}:`, error.message);
            }
        }
    }
};

const insertSeeds = async (connection) => {
    console.log('🌱 Inserting seed data...');
    
    try {
        // Insert Roles
        await connection.query(`
            INSERT IGNORE INTO roles (role_name, description) VALUES
            ('superadmin', 'Super Administrator with all permissions'),
            ('hr', 'HR Manager'),
            ('manager', 'Manager'),
            ('tl', 'Team Lead'),
            ('employee', 'Employee')
        `);
        console.log('  ✓ Roles inserted');

        // Insert Modules
        await connection.query(`
            INSERT IGNORE INTO modules (module_name, description) VALUES
            ('roles', 'Manage Roles'),
            ('employees', 'Manage Employees'),
            ('leave_types', 'Manage Leave Types'),
            ('leaves', 'Manage Leaves'),
            ('holidays', 'Manage Public Holidays'),
            ('attendance', 'Manage Attendance'),
            ('calendar', 'View Calendar'),
            ('departments', 'Manage Departments')
        `);
        console.log('  ✓ Modules inserted');

        // Insert Permissions
        await connection.query(`
            INSERT IGNORE INTO permissions (permission_name, description) VALUES
            ('create', 'Create permission'),
            ('view', 'View permission'),
            ('edit', 'Edit permission'),
            ('delete', 'Delete permission'),
            ('approve', 'Approve permission')
        `);
        console.log('  ✓ Permissions inserted');

        // Insert Departments
        await connection.query(`
            INSERT IGNORE INTO departments (department_name, description) VALUES
            ('Engineering', 'Software Development'),
            ('HR', 'Human Resources'),
            ('Sales', 'Sales and Marketing'),
            ('Finance', 'Finance and Accounts')
        `);
        console.log('  ✓ Departments inserted');

        // Insert Leave Types
        await connection.query(`
            INSERT IGNORE INTO leave_types (leave_code, leave_name, description, is_carry_forward, max_days_per_year) VALUES
            ('CL', 'Casual Leave', 'Casual Leave - Resets every year', FALSE, 12),
            ('EL', 'Earned Leave', 'Earned Leave - Can be carried forward', TRUE, 12),
            ('PL', 'Privilege Leave', 'Privilege Leave', TRUE, 15),
            ('SL', 'Sick Leave', 'Sick Leave', FALSE, 10),
            ('OD', 'On Duty', 'On Duty', FALSE, NULL),
            ('LOP', 'Loss of Pay', 'Leave without pay', FALSE, NULL),
            ('WFH', 'Work From Home', 'Work from home', FALSE, 24)
        `);
        console.log('  ✓ Leave types inserted');

        // Insert Role Permissions (HR)
        await connection.query(`
            INSERT IGNORE INTO role_permissions (role_id, module_id, permission_id) VALUES
            (2, 2, 2), (2, 2, 1), (2, 2, 3), (2, 2, 4),
            (2, 4, 2), (2, 4, 5), (2, 7, 2),
            (2, 5, 2), (2, 5, 1), (2, 5, 3), (2, 5, 4),
            (2, 3, 2), (2, 3, 1), (2, 3, 3)
        `);
        console.log('  ✓ HR permissions inserted');

        // Insert Role Permissions (Manager)
        await connection.query(`
            INSERT IGNORE INTO role_permissions (role_id, module_id, permission_id) VALUES
            (3, 2, 2), (3, 4, 2), (3, 4, 5), (3, 7, 2)
        `);
        console.log('  ✓ Manager permissions inserted');

        // Insert Role Permissions (TL)
        await connection.query(`
            INSERT IGNORE INTO role_permissions (role_id, module_id, permission_id) VALUES
            (4, 4, 2), (4, 4, 5), (4, 7, 2)
        `);
        console.log('  ✓ TL permissions inserted');

        // Insert Role Permissions (Employee)
        await connection.query(`
            INSERT IGNORE INTO role_permissions (role_id, module_id, permission_id) VALUES
            (5, 4, 2), (5, 7, 2)
        `);
        console.log('  ✓ Employee permissions inserted');

    } catch (error) {
        console.error('  ✗ Seed error:', error.message);
    }
};

export default runMigration;
