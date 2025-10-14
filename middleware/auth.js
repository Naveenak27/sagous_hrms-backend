import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const [users] = await pool.query(
            `SELECT u.id, u.employee_id, u.name, u.email, 
                    e.id as emp_id, e.role_id, r.role_name, e.department_id, e.reporting_manager_id
             FROM users u
             LEFT JOIN employees e ON u.id = e.user_id
             LEFT JOIN roles r ON e.role_id = r.id
             WHERE u.id = ?`,
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};
