import pool from '../config/db.js';

export const getAllHolidays = async (req, res) => {
    try {
        const { year } = req.query;
        const [holidays] = await pool.query(
            'SELECT * FROM public_holidays WHERE year = ? ORDER BY holiday_date',
            [year || new Date().getFullYear()]
        );
        res.json({ success: true, data: holidays });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching holidays',
            error: error.message
        });
    }
};

export const createHoliday = async (req, res) => {
    try {
        const { holiday_name, holiday_date, description, is_mandatory } = req.body;
        const year = new Date(holiday_date).getFullYear();

        const [result] = await pool.query(
            `INSERT INTO public_holidays (holiday_name, holiday_date, description, is_mandatory, year)
             VALUES (?, ?, ?, ?, ?)`,
            [holiday_name, holiday_date, description, is_mandatory, year]
        );

        res.status(201).json({
            success: true,
            message: 'Holiday created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating holiday',
            error: error.message
        });
    }
};

export const updateHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const { holiday_name, holiday_date, description, is_mandatory } = req.body;
        const year = new Date(holiday_date).getFullYear();

        await pool.query(
            `UPDATE public_holidays 
             SET holiday_name = ?, holiday_date = ?, description = ?, is_mandatory = ?, year = ?
             WHERE id = ?`,
            [holiday_name, holiday_date, description, is_mandatory, year, id]
        );

        res.json({
            success: true,
            message: 'Holiday updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating holiday',
            error: error.message
        });
    }
};

export const deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM public_holidays WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Holiday deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting holiday',
            error: error.message
        });
    }
};
