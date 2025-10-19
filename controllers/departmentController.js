import pool from '../config/db.js';

export const getAllDepartments = async (req, res) => {
    try {
        const [departments] = await pool.query(
            'SELECT * FROM departments ORDER BY department_name'
        );
        res.json({ success: true, data: departments });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching departments',
            error: error.message
        });
    }
};

export const createDepartment = async (req, res) => {
    try {
        const { department_name, description } = req.body;

        // Check if department already exists
        const [existing] = await pool.query(
            'SELECT id FROM departments WHERE department_name = ?',
            [department_name]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Department already exists'
            });
        }

        const [result] = await pool.query(
            'INSERT INTO departments (department_name, description) VALUES (?, ?)',
            [department_name, description || null]
        );

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating department',
            error: error.message
        });
    }
};

export const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { department_name, description, is_active } = req.body;

        await pool.query(
            `UPDATE departments 
             SET department_name = ?, description = ?, is_active = ?
             WHERE id = ?`,
            [department_name, description, is_active, id]
        );

        res.json({
            success: true,
            message: 'Department updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating department',
            error: error.message
        });
    }
};

export const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        // Soft delete - set is_active to false
        await pool.query(
            'UPDATE departments SET is_active = FALSE WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Department deactivated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deactivating department',
            error: error.message
        });
    }
};
