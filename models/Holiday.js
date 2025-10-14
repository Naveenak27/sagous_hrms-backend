import pool from '../config/db.js';

export const getAllHolidays = async (year) => {
    const [holidays] = await pool.query(
        'SELECT * FROM public_holidays WHERE year = ? ORDER BY holiday_date',
        [year]
    );
    return holidays;
};

export const createHoliday = async (holidayData) => {
    const { holiday_name, holiday_date, description, is_mandatory, year } = holidayData;
    
    const [result] = await pool.query(
        `INSERT INTO public_holidays (holiday_name, holiday_date, description, is_mandatory, year)
         VALUES (?, ?, ?, ?, ?)`,
        [holiday_name, holiday_date, description, is_mandatory, year]
    );
    
    return result.insertId;
};

export const findHolidayById = async (id) => {
    const [holidays] = await pool.query('SELECT * FROM public_holidays WHERE id = ?', [id]);
    return holidays[0];
};

export const updateHoliday = async (id, holidayData) => {
    const { holiday_name, holiday_date, description, is_mandatory, year } = holidayData;
    
    await pool.query(
        `UPDATE public_holidays 
         SET holiday_name = ?, holiday_date = ?, description = ?, is_mandatory = ?, year = ?
         WHERE id = ?`,
        [holiday_name, holiday_date, description, is_mandatory, year, id]
    );
};

export const deleteHoliday = async (id) => {
    await pool.query('DELETE FROM public_holidays WHERE id = ?', [id]);
};
