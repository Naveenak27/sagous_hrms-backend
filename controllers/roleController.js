import pool from '../config/db.js';

export const getAllRoles = async (req, res) => {
    try {
        const [roles] = await pool.query('SELECT * FROM roles ORDER BY role_name');
        res.json({ success: true, data: roles });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching roles',
            error: error.message
        });
    }
};

export const getRolePermissions = async (req, res) => {
    try {
        const { id } = req.params;

        const [permissions] = await pool.query(
            `SELECT rp.*, m.module_name, p.permission_name
             FROM role_permissions rp
             JOIN modules m ON rp.module_id = m.id
             JOIN permissions p ON rp.permission_id = p.id
             WHERE rp.role_id = ?`,
            [id]
        );

        res.json({ success: true, data: permissions });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching role permissions',
            error: error.message
        });
    }
};

export const createRole = async (req, res) => {
    try {
        const { role_name, description } = req.body;

        const [result] = await pool.query(
            'INSERT INTO roles (role_name, description) VALUES (?, ?)',
            [role_name, description]
        );

        res.status(201).json({
            success: true,
            message: 'Role created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating role',
            error: error.message
        });
    }
};

export const updateRolePermissions = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { permissions } = req.body; // Array of {module_id, permission_id}

        // Delete existing permissions
        await connection.query('DELETE FROM role_permissions WHERE role_id = ?', [id]);

        // Insert new permissions
        if (permissions && permissions.length > 0) {
            const values = permissions.map(p => [id, p.module_id, p.permission_id]);
            await connection.query(
                'INSERT INTO role_permissions (role_id, module_id, permission_id) VALUES ?',
                [values]
            );
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Role permissions updated successfully'
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            success: false,
            message: 'Error updating role permissions',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

export const getModulesAndPermissions = async (req, res) => {
    try {
        const [modules] = await pool.query('SELECT * FROM modules ORDER BY module_name');
        const [permissions] = await pool.query('SELECT * FROM permissions ORDER BY permission_name');

        res.json({
            success: true,
            data: { modules, permissions }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching modules and permissions',
            error: error.message
        });
    }
};
