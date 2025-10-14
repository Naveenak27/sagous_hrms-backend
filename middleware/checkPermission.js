import pool from '../config/db.js';

export const checkPermission = (moduleName, permissionName) => {
    return async (req, res, next) => {
        try {
            // Superadmin has all permissions
            if (req.user.role_name === 'superadmin') {
                return next();
            }

            const [permissions] = await pool.query(
                `SELECT rp.* FROM role_permissions rp
                 JOIN modules m ON rp.module_id = m.id
                 JOIN permissions p ON rp.permission_id = p.id
                 WHERE rp.role_id = ? AND m.module_name = ? AND p.permission_name = ?`,
                [req.user.role_id, moduleName, permissionName]
            );

            if (permissions.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to perform this action'
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error checking permissions',
                error: error.message
            });
        }
    };
};
