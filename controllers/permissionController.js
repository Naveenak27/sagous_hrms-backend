import pool from '../config/db.js';

export const getAllPermissions = async (req, res) => {
    try {
        const [permissions] = await pool.query('SELECT * FROM permissions ORDER BY permission_name');
        res.json({ success: true, data: permissions });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching permissions',
            error: error.message
        });
    }
};

export const getAllModules = async (req, res) => {
    try {
        const [modules] = await pool.query('SELECT * FROM modules ORDER BY module_name');
        res.json({ success: true, data: modules });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching modules',
            error: error.message
        });
    }
};

export const createPermission = async (req, res) => {
    try {
        const { permission_name, description } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO permissions (permission_name, description) VALUES (?, ?)',
            [permission_name, description]
        );

        res.status(201).json({
            success: true,
            message: 'Permission created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating permission',
            error: error.message
        });
    }
};

export const createModule = async (req, res) => {
    try {
        const { module_name, description } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO modules (module_name, description) VALUES (?, ?)',
            [module_name, description]
        );

        res.status(201).json({
            success: true,
            message: 'Module created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating module',
            error: error.message
        });
    }
};
