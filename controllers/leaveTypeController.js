import pool from '../config/db.js';

export const getAllLeaveTypes = async (req, res) => {
    try {
        const [leaveTypes] = await pool.query(
            'SELECT * FROM leave_types WHERE is_active = TRUE ORDER BY leave_name'
        );
        res.json({ success: true, data: leaveTypes });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching leave types',
            error: error.message
        });
    }
};

export const createLeaveType = async (req, res) => {
    try {
        const { leave_code, leave_name, description, is_carry_forward, max_days_per_year } = req.body;

        const [result] = await pool.query(
            `INSERT INTO leave_types (leave_code, leave_name, description, is_carry_forward, max_days_per_year)
             VALUES (?, ?, ?, ?, ?)`,
            [leave_code, leave_name, description, is_carry_forward, max_days_per_year]
        );

        res.status(201).json({
            success: true,
            message: 'Leave type created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating leave type',
            error: error.message
        });
    }
};

export const updateLeaveType = async (req, res) => {
    try {
        const { id } = req.params;
        const { leave_name, description, is_carry_forward, max_days_per_year, is_active } = req.body;

        await pool.query(
            `UPDATE leave_types 
             SET leave_name = ?, description = ?, is_carry_forward = ?, 
                 max_days_per_year = ?, is_active = ?
             WHERE id = ?`,
            [leave_name, description, is_carry_forward, max_days_per_year, is_active, id]
        );

        res.json({
            success: true,
            message: 'Leave type updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating leave type',
            error: error.message
        });
    }
};

export const deleteLeaveType = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE leave_types SET is_active = FALSE WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Leave type deactivated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting leave type',
            error: error.message
        });
    }
};
