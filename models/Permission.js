import pool from '../config/db.js';

export const getAllPermissions = async () => {
    const [permissions] = await pool.query('SELECT * FROM permissions ORDER BY permission_name');
    return permissions;
};

export const getRolePermissions = async (roleId) => {
    const [permissions] = await pool.query(
        `SELECT rp.*, m.module_name, p.permission_name
         FROM role_permissions rp
         JOIN modules m ON rp.module_id = m.id
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id = ?`,
        [roleId]
    );
    return permissions;
};
