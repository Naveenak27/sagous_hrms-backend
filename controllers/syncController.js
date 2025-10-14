import biometricPool from '../config/biometricDb.js';
import pool from '../config/db.js';
import moment from 'moment';

// Sync all attendance data from biometric DB to main DB
export const syncAttendanceData = async (req, res) => {
    try {
        console.log('🔄 Starting attendance data sync...');
        const startTime = Date.now();

        // Get the last synced record from main DB
        const [lastRecord] = await pool.query(
            'SELECT MAX(id) as last_id FROM attendance_logs'
        );
        const lastSyncedId = lastRecord[0]?.last_id || 0;

        console.log(`Last synced ID: ${lastSyncedId}`);

        // Fetch new records from biometric DB
        const [newRecords] = await biometricPool.query(
            'SELECT * FROM attendance_logs WHERE id > ? ORDER BY id ASC',
            [lastSyncedId]
        );

        if (newRecords.length === 0) {
            return res.json({
                success: true,
                message: 'No new records to sync',
                synced: 0
            });
        }

        console.log(`Found ${newRecords.length} new records to sync`);

        // Insert records into main DB
        let syncedCount = 0;
        for (const record of newRecords) {
            try {
                await pool.query(
                    `INSERT INTO attendance_logs 
                    (id, employee_code, log_date_time, log_date, log_time, direction, login_type, download_date_time, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        record.id,
                        record.employee_code,
                        record.log_date_time,
                        record.log_date,
                        record.log_time,
                        record.direction,
                        record.login_type,
                        record.download_date_time,
                        record.created_at,
                        record.updated_at
                    ]
                );
                syncedCount++;
            } catch (error) {
                // Skip if duplicate
                if (error.code !== 'ER_DUP_ENTRY') {
                    console.error(`Error syncing record ${record.id}:`, error.message);
                }
            }
        }

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log(`✅ Synced ${syncedCount} records in ${duration}s`);

        res.json({
            success: true,
            message: 'Attendance data synced successfully',
            synced: syncedCount,
            duration_seconds: duration
        });
    } catch (error) {
        console.error('❌ Sync error:', error);
        res.status(500).json({
            success: false,
            message: 'Error syncing attendance data',
            error: error.message
        });
    }
};

// Initial full sync (use once)
export const fullSyncAttendance = async (req, res) => {
    try {
        console.log('🔄 Starting FULL attendance data sync...');
        const startTime = Date.now();

        // Truncate existing data (optional)
        const { truncate } = req.query;
        if (truncate === 'true') {
            await pool.query('TRUNCATE TABLE attendance_logs');
            console.log('Truncated existing attendance_logs table');
        }

        // Fetch ALL records from biometric DB
        const [allRecords] = await biometricPool.query(
            'SELECT * FROM attendance_logs ORDER BY id ASC'
        );

        console.log(`Found ${allRecords.length} total records to sync`);

        // Batch insert (faster)
        const batchSize = 500;
        let syncedCount = 0;

        for (let i = 0; i < allRecords.length; i += batchSize) {
            const batch = allRecords.slice(i, i + batchSize);
            
            const values = batch.map(record => [
                record.id,
                record.employee_code,
                record.log_date_time,
                record.log_date,
                record.log_time,
                record.direction,
                record.login_type,
                record.download_date_time,
                record.created_at,
                record.updated_at
            ]);

            try {
                await pool.query(
                    `INSERT IGNORE INTO attendance_logs 
                    (id, employee_code, log_date_time, log_date, log_time, direction, login_type, download_date_time, created_at, updated_at)
                    VALUES ?`,
                    [values]
                );
                syncedCount += batch.length;
                console.log(`Synced ${syncedCount}/${allRecords.length} records...`);
            } catch (error) {
                console.error('Batch insert error:', error.message);
            }
        }

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log(`✅ Full sync completed: ${syncedCount} records in ${duration}s`);

        res.json({
            success: true,
            message: 'Full attendance sync completed',
            total_records: allRecords.length,
            synced: syncedCount,
            duration_seconds: duration
        });
    } catch (error) {
        console.error('❌ Full sync error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during full sync',
            error: error.message
        });
    }
};

// Get sync status
export const getSyncStatus = async (req, res) => {
    try {
        const [bioCount] = await biometricPool.query('SELECT COUNT(*) as total FROM attendance_logs');
        const [mainCount] = await pool.query('SELECT COUNT(*) as total FROM attendance_logs');
        
        const [bioLastRecord] = await biometricPool.query('SELECT MAX(id) as last_id, MAX(log_date) as last_date FROM attendance_logs');
        const [mainLastRecord] = await pool.query('SELECT MAX(id) as last_id, MAX(log_date) as last_date FROM attendance_logs');

        const bioTotal = bioCount[0].total;
        const mainTotal = mainCount[0].total;
        const pending = bioTotal - mainTotal;

        res.json({
            success: true,
            biometric_db: {
                total_records: bioTotal,
                last_id: bioLastRecord[0]?.last_id,
                last_date: bioLastRecord[0]?.last_date
            },
            main_db: {
                total_records: mainTotal,
                last_id: mainLastRecord[0]?.last_id,
                last_date: mainLastRecord[0]?.last_date
            },
            sync_status: {
                pending_records: pending,
                sync_percentage: ((mainTotal / bioTotal) * 100).toFixed(2) + '%',
                is_synced: pending === 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
