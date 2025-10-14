import pool from '../config/db.js';

// Credit monthly leaves to all employees
export const creditMonthlyLeaves = async () => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const currentYear = new Date().getFullYear();
        
        // Get all active employees
        const [employees] = await connection.query(
            'SELECT id FROM employees WHERE is_active = TRUE'
        );

        // Get leave types
        const [leaveTypes] = await connection.query(
            'SELECT * FROM leave_types WHERE is_active = TRUE'
        );

        for (const employee of employees) {
            for (const leaveType of leaveTypes) {
                let creditAmount = 0;
                
                if (leaveType.leave_code === 'CL') creditAmount = 1; // 1 CL per month
                if (leaveType.leave_code === 'EL') creditAmount = 1; // 1 EL per month
                if (leaveType.leave_code === 'WFH') creditAmount = 2; // 2 WFH per month

                if (creditAmount > 0) {
                    await connection.query(
                        `INSERT INTO leave_balances (employee_id, leave_type_id, year, credited, balance)
                         VALUES (?, ?, ?, ?, ?)
                         ON DUPLICATE KEY UPDATE 
                         credited = credited + ?, balance = balance + ?`,
                        [employee.id, leaveType.id, currentYear, creditAmount, creditAmount,
                         creditAmount, creditAmount]
                    );
                }
            }
        }

        await connection.commit();
        console.log('Monthly leaves credited successfully');
    } catch (error) {
        await connection.rollback();
        console.error('Error crediting monthly leaves:', error);
        throw error;
    } finally {
        connection.release();
    }
};

// Reset casual leaves at year start
export const resetCasualLeaves = async () => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        // Get CL leave type
        const [clType] = await connection.query(
            "SELECT id FROM leave_types WHERE leave_code = 'CL'"
        );

        if (clType.length > 0) {
            // Reset CL balance to 0 for previous year
            await connection.query(
                `UPDATE leave_balances 
                 SET balance = 0 
                 WHERE leave_type_id = ? AND year = ?`,
                [clType[0].id, previousYear]
            );
        }

        // Carry forward EL and other carry-forward leaves
        const [carryForwardTypes] = await connection.query(
            'SELECT id FROM leave_types WHERE is_carry_forward = TRUE'
        );

        for (const leaveType of carryForwardTypes) {
            // Get previous year balances
            const [balances] = await connection.query(
                `SELECT employee_id, balance 
                 FROM leave_balances 
                 WHERE leave_type_id = ? AND year = ?`,
                [leaveType.id, previousYear]
            );

            for (const balance of balances) {
                if (balance.balance > 0) {
                    await connection.query(
                        `INSERT INTO leave_balances 
                        (employee_id, leave_type_id, year, opening_balance, balance)
                        VALUES (?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE 
                        opening_balance = opening_balance + ?, balance = balance + ?`,
                        [balance.employee_id, leaveType.id, currentYear, balance.balance, balance.balance,
                         balance.balance, balance.balance]
                    );
                }
            }
        }

        await connection.commit();
        console.log('Yearly leave reset completed successfully');
    } catch (error) {
        await connection.rollback();
        console.error('Error resetting yearly leaves:', error);
        throw error;
    } finally {
        connection.release();
    }
};
