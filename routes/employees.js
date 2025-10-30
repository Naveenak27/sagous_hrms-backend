import express from 'express';
import {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
} from '../controllers/employeeController.js';
import { protect } from '../middleware/auth.js';
import { checkPermission } from '../middleware/checkPermission.js';

const router = express.Router();

// SPECIFIC ROUTES FIRST (before /:id routes)

// Update own reporting manager (NO permission check - employees can update their own)
router.put('/update-reporting-manager', protect, async (req, res) => {
    try {
        const { reporting_manager_id } = req.body;
        const employeeId = req.user.emp_id;

        const pool = (await import('../config/db.js')).default;
        
        await pool.query(
            'UPDATE employees SET reporting_manager_id = ? WHERE id = ?',
            [reporting_manager_id, employeeId]
        );

        res.json({
            success: true,
            message: 'Reporting manager updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating reporting manager',
            error: error.message
        });
    }
});

// Reporting managers dropdown (NO permission check)
router.get('/reporting-managers', protect, async (req, res) => {
    try {
        const pool = (await import('../config/db.js')).default;
        const [employees] = await pool.query(
            `SELECT u.id, u.employee_id, u.name, u.email,
                    e.id as emp_id, e.designation, r.role_name
             FROM users u
             JOIN employees e ON u.id = e.user_id
             JOIN roles r ON e.role_id = r.id
             WHERE r.role_name IN ('hr', 'manager', 'tl') AND e.is_active = TRUE
             ORDER BY r.role_name, u.name`
        );
        res.json({ success: true, data: employees });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching reporting managers',
            error: error.message
        });
    }
});

// Team members (NO permission check)
router.get('/my-team', protect, async (req, res) => {
    try {
        const pool = (await import('../config/db.js')).default;
        const [employees] = await pool.query(
            `SELECT u.id, u.employee_id, u.name, u.email,
                    e.id as emp_id, e.mobile_number, e.designation,
                    e.date_of_joining, r.role_name
             FROM users u
             JOIN employees e ON u.id = e.user_id
             JOIN roles r ON e.role_id = r.id
             WHERE e.reporting_manager_id = ?
             ORDER BY u.name`,
            [req.user.emp_id]
        );
        res.json({ success: true, data: employees });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching team members',
            error: error.message
        });
    }
});

// PROTECTED ROUTES (with permission checks) - AFTER specific routes
router.get('/', protect, checkPermission('employees', 'view'), getAllEmployees);
router.get('/:id', protect, checkPermission('employees', 'view'), getEmployeeById);
router.post('/', 
    protect, 
    (req, res, next) => {
        console.log('✓ After protect middleware');
        console.log('req.user exists:', !!req.user);
        console.log('req.user.role_name:', req.user?.role_name);
        next();
    },
    checkPermission('employees', 'create'),
    (req, res, next) => {
        console.log('✓ After checkPermission middleware');
        console.log('About to call createEmployee controller');
        next();
    },
    createEmployee
);
router.put('/:id', protect, checkPermission('employees', 'edit'), updateEmployee);
router.delete('/:id', protect, checkPermission('employees', 'delete'), deleteEmployee);

export default router;
