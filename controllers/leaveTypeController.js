// import pool from '../config/db.js';

// export const getAllLeaveTypes = async (req, res) => {
//     try {
//         const [leaveTypes] = await pool.query(
//             'SELECT * FROM leave_types WHERE is_active = TRUE ORDER BY leave_name'
//         );
//         res.json({ success: true, data: leaveTypes });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching leave types',
//             error: error.message
//         });
//     }
// };

// export const createLeaveType = async (req, res) => {
//     try {
//         const { leave_code, leave_name, description, is_carry_forward, max_days_per_year } = req.body;

//         const [result] = await pool.query(
//             `INSERT INTO leave_types (leave_code, leave_name, description, is_carry_forward, max_days_per_year)
//              VALUES (?, ?, ?, ?, ?)`,
//             [leave_code, leave_name, description, is_carry_forward, max_days_per_year]
//         );

//         res.status(201).json({
//             success: true,
//             message: 'Leave type created successfully',
//             data: { id: result.insertId }
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error creating leave type',
//             error: error.message
//         });
//     }
// };

// export const updateLeaveType = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { leave_name, description, is_carry_forward, max_days_per_year, is_active } = req.body;

//         await pool.query(
//             `UPDATE leave_types 
//              SET leave_name = ?, description = ?, is_carry_forward = ?, 
//                  max_days_per_year = ?, is_active = ?
//              WHERE id = ?`,
//             [leave_name, description, is_carry_forward, max_days_per_year, is_active, id]
//         );

//         res.json({
//             success: true,
//             message: 'Leave type updated successfully'
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error updating leave type',
//             error: error.message
//         });
//     }
// };

// export const deleteLeaveType = async (req, res) => {
//     try {
//         const { id } = req.params;
//         await pool.query('UPDATE leave_types SET is_active = FALSE WHERE id = ?', [id]);

//         res.json({
//             success: true,
//             message: 'Leave type deactivated successfully'
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error deleting leave type',
//             error: error.message
//         });
//     }
// };




import pool from '../config/db.js';

// Get all leave types (only active ones)
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

// Create new leave type
export const createLeaveType = async (req, res) => {
    try {
        const { leave_code, leave_name, description, is_carry_forward, max_days_per_year } = req.body;

        // Validation
        if (!leave_code || !leave_name) {
            return res.status(400).json({
                success: false,
                message: 'Leave code and name are required'
            });
        }

        // Check if leave code already exists
        const [existing] = await pool.query(
            'SELECT id FROM leave_types WHERE leave_code = ?',
            [leave_code]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Leave code already exists'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO leave_types 
             (leave_code, leave_name, description, is_carry_forward, max_days_per_year, is_active)
             VALUES (?, ?, ?, ?, ?, TRUE)`,
            [
                leave_code.toUpperCase(), 
                leave_name, 
                description || null, 
                is_carry_forward ? 1 : 0, 
                max_days_per_year || null
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Leave type created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Create leave type error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating leave type',
            error: error.message
        });
    }
};

// Update leave type
export const updateLeaveType = async (req, res) => {
    try {
        const { id } = req.params;
        const { leave_name, description, is_carry_forward, max_days_per_year, is_active } = req.body;

        // Validation
        if (!leave_name) {
            return res.status(400).json({
                success: false,
                message: 'Leave name is required'
            });
        }

        // Check if leave type exists
        const [existing] = await pool.query(
            'SELECT id FROM leave_types WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Leave type not found'
            });
        }

        await pool.query(
            `UPDATE leave_types 
             SET leave_name = ?, 
                 description = ?, 
                 is_carry_forward = ?, 
                 max_days_per_year = ?, 
                 is_active = ?
             WHERE id = ?`,
            [
                leave_name, 
                description || null, 
                is_carry_forward ? 1 : 0, 
                max_days_per_year || null, 
                is_active ? 1 : 0,
                id
            ]
        );

        res.json({
            success: true,
            message: 'Leave type updated successfully'
        });
    } catch (error) {
        console.error('Update leave type error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating leave type',
            error: error.message
        });
    }
};

// Delete leave type (soft delete)
// Delete leave type (soft delete only)
export const deleteLeaveType = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if leave type exists
        const [existing] = await pool.query(
            'SELECT id, leave_name, is_active FROM leave_types WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Leave type not found'
            });
        }

        if (!existing[0].is_active) {
            return res.status(400).json({
                success: false,
                message: 'Leave type is already deactivated'
            });
        }

        // Always soft delete
        await pool.query(
            'UPDATE leave_types SET is_active = FALSE WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Leave type deactivated successfully'
        });
    } catch (error) {
        console.error('Delete leave type error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting leave type',
            error: error.message
        });
    }
};
