import pool from '../config/db.js';

// Get my team (for logged-in user)
export const getMyTeam = async (req, res) => {
    try {
        const managerId = req.user.emp_id;

        const [members] = await pool.query(`
            SELECT 
                emp.id,
                u.employee_id,
                u.name,
                u.email,
                emp.mobile_number,
                emp.designation,
                dept.department_name,
                r.role_name,
                emp.date_of_joining,
                emp.reporting_manager_id
            FROM employees emp
            JOIN users u ON emp.user_id = u.id
            LEFT JOIN departments dept ON emp.department_id = dept.id
            LEFT JOIN roles r ON emp.role_id = r.id
            WHERE emp.reporting_manager_id = ? AND emp.is_active = TRUE
            ORDER BY u.name
        `, [managerId]);

        // Get manager info
        const [managerInfo] = await pool.query(`
            SELECT u.name, u.employee_id, emp.designation
            FROM employees emp
            JOIN users u ON emp.user_id = u.id
            WHERE emp.id = ?
        `, [managerId]);

        res.json({
            success: true,
            data: {
                manager: managerInfo[0] || null,
                team_members: members,
                team_size: members.length
            }
        });
    } catch (error) {
        console.error('Error in getMyTeam:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching my team',
            error: error.message
        });
    }
};

// Get team members for a specific manager
export const getTeamMembers = async (req, res) => {
    try {
        const { managerId } = req.params;

        const [members] = await pool.query(`
            SELECT 
                emp.id,
                u.employee_id,
                u.name,
                u.email,
                emp.mobile_number,
                emp.designation,
                dept.department_name,
                r.role_name,
                emp.date_of_joining
            FROM employees emp
            JOIN users u ON emp.user_id = u.id
            LEFT JOIN departments dept ON emp.department_id = dept.id
            LEFT JOIN roles r ON emp.role_id = r.id
            WHERE emp.reporting_manager_id = ? AND emp.is_active = TRUE
            ORDER BY u.name
        `, [managerId]);

        res.json({ success: true, data: members });
    } catch (error) {
        console.error('Error in getTeamMembers:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching team members',
            error: error.message
        });
    }
};

// Get all teams (grouped by reporting manager)
export const getAllTeams = async (req, res) => {
    try {
        const [teams] = await pool.query(`
            SELECT 
                manager.id as manager_id,
                manager_user.employee_id as manager_emp_id,
                manager_user.name as manager_name,
                manager.designation as manager_designation,
                dept.department_name,
                COUNT(DISTINCT emp.id) as team_size
            FROM employees manager
            JOIN users manager_user ON manager.user_id = manager_user.id
            LEFT JOIN departments dept ON manager.department_id = dept.id
            LEFT JOIN employees emp ON emp.reporting_manager_id = manager.id AND emp.is_active = TRUE
            WHERE manager.is_active = TRUE
            GROUP BY manager.id, manager_user.employee_id, manager_user.name, manager.designation, dept.department_name
            HAVING team_size > 0
            ORDER BY manager_user.name
        `);

        res.json({ success: true, data: teams });
    } catch (error) {
        console.error('Error in getAllTeams:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching teams',
            error: error.message
        });
    }
};

// Assign employee to manager (HR only)
export const assignEmployee = async (req, res) => {
    try {
        const { employee_id, reporting_manager_id } = req.body;

        await pool.query(
            'UPDATE employees SET reporting_manager_id = ? WHERE id = ?',
            [reporting_manager_id, employee_id]
        );

        res.json({
            success: true,
            message: 'Employee assigned successfully'
        });
    } catch (error) {
        console.error('Error in assignEmployee:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning employee',
            error: error.message
        });
    }
};

// Remove employee from team (HR only)
export const removeFromTeam = async (req, res) => {
    try {
        const { employee_id } = req.body;

        await pool.query(
            'UPDATE employees SET reporting_manager_id = NULL WHERE id = ?',
            [employee_id]
        );

        res.json({
            success: true,
            message: 'Employee removed from team'
        });
    } catch (error) {
        console.error('Error in removeFromTeam:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing employee',
            error: error.message
        });
    }
};
