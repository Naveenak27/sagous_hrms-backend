-- =====================================================
-- SEED DATA - MASTER DATA ONLY
-- =====================================================

-- Insert Roles (if not exists)
INSERT IGNORE INTO roles (role_name, description) VALUES
('superadmin', 'Super Administrator with all permissions'),
('hr', 'HR Manager'),
('manager', 'Manager'),
('tl', 'Team Lead'),
('employee', 'Employee');

-- Insert Modules (if not exists)
INSERT IGNORE INTO modules (module_name, description) VALUES
('roles', 'Manage Roles'),
('employees', 'Manage Employees'),
('leave_types', 'Manage Leave Types'),
('leaves', 'Manage Leaves'),
('holidays', 'Manage Public Holidays'),
('attendance', 'Manage Attendance'),
('calendar', 'View Calendar'),
('departments', 'Manage Departments');

-- Insert Permissions (if not exists)
INSERT IGNORE INTO permissions (permission_name, description) VALUES
('create', 'Create permission'),
('view', 'View permission'),
('edit', 'Edit permission'),
('delete', 'Delete permission'),
('approve', 'Approve permission');

-- Insert Default Departments (if not exists)
INSERT IGNORE INTO departments (department_name, description) VALUES
('Engineering', 'Software Development'),
('HR', 'Human Resources'),
('Sales', 'Sales and Marketing'),
('Finance', 'Finance and Accounts');

-- Insert Default Leave Types (if not exists)
INSERT IGNORE INTO leave_types (leave_code, leave_name, description, is_carry_forward, max_days_per_year) VALUES
('CL', 'Casual Leave', 'Casual Leave - Resets every year', FALSE, 12),
('EL', 'Earned Leave', 'Earned Leave - Can be carried forward', TRUE, 12),
('PL', 'Privilege Leave', 'Privilege Leave', TRUE, 15),
('SL', 'Sick Leave', 'Sick Leave', FALSE, 10),
('OD', 'On Duty', 'On Duty', FALSE, NULL),
('LOP', 'Loss of Pay', 'Leave without pay', FALSE, NULL),
('WFH', 'Work From Home', 'Work from home', FALSE, 24);

-- Set Role Permissions (HR)
INSERT IGNORE INTO role_permissions (role_id, module_id, permission_id)
SELECT 2, 2, 2 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=2 AND module_id=2 AND permission_id=2)
UNION ALL SELECT 2, 2, 1 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=2 AND module_id=2 AND permission_id=1)
UNION ALL SELECT 2, 2, 3 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=2 AND module_id=2 AND permission_id=3)
UNION ALL SELECT 2, 2, 4 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=2 AND module_id=2 AND permission_id=4)
UNION ALL SELECT 2, 4, 2 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=2 AND module_id=4 AND permission_id=2)
UNION ALL SELECT 2, 4, 5 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=2 AND module_id=4 AND permission_id=5)
UNION ALL SELECT 2, 7, 2 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=2 AND module_id=7 AND permission_id=2)
UNION ALL SELECT 2, 5, 2 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=2 AND module_id=5 AND permission_id=2)
UNION ALL SELECT 2, 5, 1 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=2 AND module_id=5 AND permission_id=1)
UNION ALL SELECT 2, 5, 3 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=2 AND module_id=5 AND permission_id=3)
UNION ALL SELECT 2, 5, 4 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=2 AND module_id=5 AND permission_id=4)
UNION ALL SELECT 2, 3, 2 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=2 AND module_id=3 AND permission_id=2)
UNION ALL SELECT 2, 3, 1 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=2 AND module_id=3 AND permission_id=1)
UNION ALL SELECT 2, 3, 3 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=2 AND module_id=3 AND permission_id=3);

-- Set Role Permissions (Manager)
INSERT IGNORE INTO role_permissions (role_id, module_id, permission_id)
SELECT 3, 2, 2 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=3 AND module_id=2 AND permission_id=2)
UNION ALL SELECT 3, 4, 2 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=3 AND module_id=4 AND permission_id=2)
UNION ALL SELECT 3, 4, 5 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=3 AND module_id=4 AND permission_id=5)
UNION ALL SELECT 3, 7, 2 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=3 AND module_id=7 AND permission_id=2);

-- Set Role Permissions (TL)
INSERT IGNORE INTO role_permissions (role_id, module_id, permission_id)
SELECT 4, 4, 2 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=4 AND module_id=4 AND permission_id=2)
UNION ALL SELECT 4, 4, 5 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=4 AND module_id=4 AND permission_id=5)
UNION ALL SELECT 4, 7, 2 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=4 AND module_id=7 AND permission_id=2);

-- Set Role Permissions (Employee)
INSERT IGNORE INTO role_permissions (role_id, module_id, permission_id)
SELECT 5, 4, 2 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=5 AND module_id=4 AND permission_id=2)
UNION ALL SELECT 5, 7, 2 WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=5 AND module_id=7 AND permission_id=2);
