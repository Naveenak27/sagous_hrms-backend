import pool from '../config/db.js';

export const getAllRoles = async () => {
    const [roles] = await pool.query('SELECT * FROM roles ORDER BY role_name');
    return roles;
};

export const findRoleById = async (id) => {
    const [roles] = await pool.query('SELECT * FROM roles WHERE id = ?', [id]);
    return roles[0];
};

export const createRole = async (roleData) => {
    const { role_name, description } = roleData;
    const [result] = await pool.query(
        'INSERT INTO roles (role_name, description) VALUES (?, ?)',
        [role_name, description]
    );
    return result.insertId;
};
