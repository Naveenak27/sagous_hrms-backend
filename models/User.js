import pool from '../config/db.js';

export const findUserByEmail = async (email) => {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return users[0];
};

export const createUser = async (userData) => {
    const { employee_id, name, email, password } = userData;
    const [result] = await pool.query(
        'INSERT INTO users (employee_id, name, email, password) VALUES (?, ?, ?, ?)',
        [employee_id, name, email, password]
    );
    return result.insertId;
};

export const findUserById = async (id) => {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return users[0];
};
