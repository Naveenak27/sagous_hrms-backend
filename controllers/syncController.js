// import biometricPool from '../config/biometricDb.js';
// import pool from '../config/db.js';
// import moment from 'moment';

// // Sync all attendance data from biometric DB to main DB
// export const syncAttendanceData = async (req, res) => {
//     try {
//         console.log('🔄 Starting attendance data sync...');
//         const startTime = Date.now();

//         // Get the last synced record from main DB
//         const [lastRecord] = await pool.query(
//             'SELECT MAX(id) as last_id FROM attendance_logs'
//         );
//         const lastSyncedId = lastRecord[0]?.last_id || 0;

//         console.log(`Last synced ID: ${lastSyncedId}`);

//         // Fetch new records from biometric DB
//         const [newRecords] = await biometricPool.query(
//             'SELECT * FROM attendance_logs WHERE id > ? ORDER BY id ASC',
//             [lastSyncedId]
//         );

//         if (newRecords.length === 0) {
//             return res.json({
//                 success: true,
//                 message: 'No new records to sync',
//                 synced: 0
//             });
//         }

//         console.log(`Found ${newRecords.length} new records to sync`);

//         // Insert records into main DB
//         let syncedCount = 0;
//         for (const record of newRecords) {
//             try {
//                 await pool.query(
//                     `INSERT INTO attendance_logs 
//                     (id, employee_code, log_date_time, log_date, log_time, direction, login_type, download_date_time, created_at, updated_at)
//                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//                     [
//                         record.id,
//                         record.employee_code,
//                         record.log_date_time,
//                         record.log_date,
//                         record.log_time,
//                         record.direction,
//                         record.login_type,
//                         record.download_date_time,
//                         record.created_at,
//                         record.updated_at
//                     ]
//                 );
//                 syncedCount++;
//             } catch (error) {
//                 // Skip if duplicate
//                 if (error.code !== 'ER_DUP_ENTRY') {
//                     console.error(`Error syncing record ${record.id}:`, error.message);
//                 }
//             }
//         }

//         const endTime = Date.now();
//         const duration = ((endTime - startTime) / 1000).toFixed(2);

//         console.log(`✅ Synced ${syncedCount} records in ${duration}s`);

//         res.json({
//             success: true,
//             message: 'Attendance data synced successfully',
//             synced: syncedCount,
//             duration_seconds: duration
//         });
//     } catch (error) {
//         console.error('❌ Sync error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error syncing attendance data',
//             error: error.message
//         });
//     }
// };

// // Initial full sync (use once)
// export const fullSyncAttendance = async (req, res) => {
//     try {
//         console.log('🔄 Starting FULL attendance data sync...');
//         const startTime = Date.now();

//         // Truncate existing data (optional)
//         const { truncate } = req.query;
//         if (truncate === 'true') {
//             await pool.query('TRUNCATE TABLE attendance_logs');
//             console.log('Truncated existing attendance_logs table');
//         }

//         // Fetch ALL records from biometric DB
//         const [allRecords] = await biometricPool.query(
//             'SELECT * FROM attendance_logs ORDER BY id ASC'
//         );

//         console.log(`Found ${allRecords.length} total records to sync`);

//         // Batch insert (faster)
//         const batchSize = 500;
//         let syncedCount = 0;

//         for (let i = 0; i < allRecords.length; i += batchSize) {
//             const batch = allRecords.slice(i, i + batchSize);
            
//             const values = batch.map(record => [
//                 record.id,
//                 record.employee_code,
//                 record.log_date_time,
//                 record.log_date,
//                 record.log_time,
//                 record.direction,
//                 record.login_type,
//                 record.download_date_time,
//                 record.created_at,
//                 record.updated_at
//             ]);

//             try {
//                 await pool.query(
//                     `INSERT IGNORE INTO attendance_logs 
//                     (id, employee_code, log_date_time, log_date, log_time, direction, login_type, download_date_time, created_at, updated_at)
//                     VALUES ?`,
//                     [values]
//                 );
//                 syncedCount += batch.length;
//                 console.log(`Synced ${syncedCount}/${allRecords.length} records...`);
//             } catch (error) {
//                 console.error('Batch insert error:', error.message);
//             }
//         }

//         const endTime = Date.now();
//         const duration = ((endTime - startTime) / 1000).toFixed(2);

//         console.log(`✅ Full sync completed: ${syncedCount} records in ${duration}s`);

//         res.json({
//             success: true,
//             message: 'Full attendance sync completed',
//             total_records: allRecords.length,
//             synced: syncedCount,
//             duration_seconds: duration
//         });
//     } catch (error) {
//         console.error('❌ Full sync error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error during full sync',
//             error: error.message
//         });
//     }
// };

// // Get sync status
// export const getSyncStatus = async (req, res) => {
//     try {
//         const [bioCount] = await biometricPool.query('SELECT COUNT(*) as total FROM attendance_logs');
//         const [mainCount] = await pool.query('SELECT COUNT(*) as total FROM attendance_logs');
        
//         const [bioLastRecord] = await biometricPool.query('SELECT MAX(id) as last_id, MAX(log_date) as last_date FROM attendance_logs');
//         const [mainLastRecord] = await pool.query('SELECT MAX(id) as last_id, MAX(log_date) as last_date FROM attendance_logs');

//         const bioTotal = bioCount[0].total;
//         const mainTotal = mainCount[0].total;
//         const pending = bioTotal - mainTotal;

//         res.json({
//             success: true,
//             biometric_db: {
//                 total_records: bioTotal,
//                 last_id: bioLastRecord[0]?.last_id,
//                 last_date: bioLastRecord[0]?.last_date
//             },
//             main_db: {
//                 total_records: mainTotal,
//                 last_id: mainLastRecord[0]?.last_id,
//                 last_date: mainLastRecord[0]?.last_date
//             },
//             sync_status: {
//                 pending_records: pending,
//                 sync_percentage: ((mainTotal / bioTotal) * 100).toFixed(2) + '%',
//                 is_synced: pending === 0
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             error: error.message
//         });
//     }
// };



import biometricPool from '../config/biometricDb.js';
import pool from '../config/db.js';
import moment from 'moment';

// Sync incremental attendance data from biometric DB to main DB
// export const syncAttendanceData = async (req, res) => {
//     try {
//         console.log('🔄 Starting attendance data sync...');
//         const startTime = Date.now();

//         // Get the last synced record from main DB
//         const [lastRecord] = await pool.query(
//             'SELECT MAX(id) as last_id FROM attendance_logs'
//         );
//         const lastSyncedId = lastRecord[0]?.last_id || 0;

//         console.log(`Last synced ID: ${lastSyncedId}`);

//         // Fetch new records from biometric DB (only columns that exist in both DBs)
//         const [newRecords] = await biometricPool.query(
//             `SELECT id, employee_code, log_date_time, log_date, log_time, direction 
//              FROM attendance_logs 
//              WHERE id > ? 
//              ORDER BY id ASC`,
//             [lastSyncedId]
//         );

//         if (newRecords.length === 0) {
//             return res.json({
//                 success: true,
//                 message: 'No new records to sync',
//                 synced: 0
//             });
//         }

//         console.log(`Found ${newRecords.length} new records to sync`);

//         // Batch insert for better performance
//         const batchSize = 500;
//         let syncedCount = 0;

//         for (let i = 0; i < newRecords.length; i += batchSize) {
//             const batch = newRecords.slice(i, i + batchSize);
            
//             const values = batch.map(record => [
//                 record.id,
//                 record.employee_code,
//                 record.log_date_time,
//                 record.log_date,
//                 record.log_time,
//                 record.direction
//             ]);

//             try {
//                 await pool.query(
//                     `INSERT INTO attendance_logs 
//                     (id, employee_code, log_date_time, log_date, log_time, direction)
//                     VALUES ?`,
//                     [values]
//                 );
//                 syncedCount += batch.length;
//                 console.log(`Synced ${syncedCount}/${newRecords.length} records...`);
//             } catch (error) {
//                 // Handle individual record errors
//                 if (error.code === 'ER_DUP_ENTRY') {
//                     console.log(`Skipping duplicate records in batch ${i}-${i + batch.length}`);
//                     // Try individual inserts for this batch
//                     for (const record of batch) {
//                         try {
//                             await pool.query(
//                                 `INSERT IGNORE INTO attendance_logs 
//                                 (id, employee_code, log_date_time, log_date, log_time, direction)
//                                 VALUES (?, ?, ?, ?, ?, ?)`,
//                                 [
//                                     record.id,
//                                     record.employee_code,
//                                     record.log_date_time,
//                                     record.log_date,
//                                     record.log_time,
//                                     record.direction
//                                 ]
//                             );
//                             syncedCount++;
//                         } catch (err) {
//                             console.error(`Error syncing record ${record.id}:`, err.message);
//                         }
//                     }
//                 } else {
//                     console.error('Batch insert error:', error.message);
//                 }
//             }
//         }

//         const endTime = Date.now();
//         const duration = ((endTime - startTime) / 1000).toFixed(2);

//         console.log(`✅ Synced ${syncedCount} records in ${duration}s`);

//         res.json({
//             success: true,
//             message: 'Attendance data synced successfully',
//             synced: syncedCount,
//             total_new_records: newRecords.length,
//             duration_seconds: duration
//         });
//     } catch (error) {
//         console.error('❌ Sync error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error syncing attendance data',
//             error: error.message
//         });
//     }
// };

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

        let syncedCount = 0;
        const fetchBatchSize = 250;  // Fetch 1000 records at a time from biometric DB
        const insertBatchSize = 100;   // Insert 100 records at a time to main DB
        let currentId = lastSyncedId;
        let hasMoreRecords = true;

        while (hasMoreRecords) {
            // Fetch small batch from biometric DB
            const [newRecords] = await biometricPool.query(
                `SELECT id, employee_code, log_date_time, log_date, log_time, direction 
                 FROM attendance_logs 
                 WHERE id > ? 
                 ORDER BY id ASC 
                 LIMIT ?`,
                [currentId, fetchBatchSize]
            );

            if (newRecords.length === 0) {
                hasMoreRecords = false;
                break;
            }

            console.log(`Fetched ${newRecords.length} records from biometric DB...`);

            // Process in smaller insert batches
            for (let i = 0; i < newRecords.length; i += insertBatchSize) {
                const insertBatch = newRecords.slice(i, i + insertBatchSize);
                
                const values = insertBatch.map(record => [
                    record.id,
                    record.employee_code,
                    record.log_date_time,
                    record.log_date,
                    record.log_time,
                    record.direction
                ]);

                try {
                    await pool.query(
                        `INSERT IGNORE INTO attendance_logs 
                        (id, employee_code, log_date_time, log_date, log_time, direction)
                        VALUES ?`,
                        [values]
                    );
                    syncedCount += insertBatch.length;
                    console.log(`Synced ${syncedCount} records...`);
                } catch (error) {
                    console.error('Insert error:', error.message);
                }
            }

            // Update current ID for next iteration
            currentId = newRecords[newRecords.length - 1].id;

            // Add small delay to prevent overwhelming databases
            await new Promise(resolve => setTimeout(resolve, 100));

            // Check if we got less than fetchBatchSize (means we're at the end)
            if (newRecords.length < fetchBatchSize) {
                hasMoreRecords = false;
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

export const fullSyncAttendance = async (req, res) => {
    try {
        console.log('🔄 Starting FULL attendance data sync...');
        const startTime = Date.now();

        const { truncate } = req.query;
        if (truncate === 'true') {
            await pool.query('TRUNCATE TABLE attendance_logs');
            console.log('✓ Truncated existing attendance_logs table');
        }

        // Fetch records in smaller chunks to avoid memory issues
        const batchSize = 500;  // Reduced from 1000
        let offset = 0;
        let totalSynced = 0;
        let hasMore = true;

        while (hasMore) {
            // Fetch batch from biometric DB
            const [batch] = await biometricPool.query(
                `SELECT id, employee_code, log_date_time, log_date, log_time, direction 
                 FROM attendance_logs 
                 ORDER BY id ASC 
                 LIMIT ? OFFSET ?`,
                [batchSize, offset]
            );

            if (batch.length === 0) {
                hasMore = false;
                break;
            }

            // Insert batch into main DB
            const values = batch.map(record => [
                record.id,
                record.employee_code,
                record.log_date_time,
                record.log_date,
                record.log_time,
                record.direction
            ]);

            try {
                await pool.query(
                    `INSERT IGNORE INTO attendance_logs 
                    (id, employee_code, log_date_time, log_date, log_time, direction)
                    VALUES ?`,
                    [values]
                );
                totalSynced += batch.length;
                console.log(`Progress: ${totalSynced} records synced...`);
            } catch (error) {
                console.error(`Batch insert error at offset ${offset}:`, error.message);
            }

            offset += batchSize;

            // Add 500ms delay between batches to prevent overload
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log(`✅ Full sync completed: ${totalSynced} records in ${duration}s`);

        res.json({
            success: true,
            message: 'Full attendance sync completed',
            synced: totalSynced,
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


// Initial full sync (use once or for data reset)
// export const fullSyncAttendance = async (req, res) => {
//     try {
//         console.log('🔄 Starting FULL attendance data sync...');
//         const startTime = Date.now();

//         // Truncate existing data (optional - use with caution!)
//         const { truncate } = req.query;
//         if (truncate === 'true') {
//             await pool.query('TRUNCATE TABLE attendance_logs');
//             console.log('✓ Truncated existing attendance_logs table');
//         }

//         // Fetch ALL records from biometric DB
//         const [allRecords] = await biometricPool.query(
//             `SELECT id, employee_code, log_date_time, log_date, log_time, direction 
//              FROM attendance_logs 
//              ORDER BY id ASC`
//         );

//         if (allRecords.length === 0) {
//             return res.json({
//                 success: true,
//                 message: 'No records found in biometric database',
//                 synced: 0
//             });
//         }

//         console.log(`Found ${allRecords.length} total records to sync`);

//         // Batch insert (faster)
//         const batchSize = 1000;
//         let syncedCount = 0;
//         let errorCount = 0;

//         for (let i = 0; i < allRecords.length; i += batchSize) {
//             const batch = allRecords.slice(i, i + batchSize);
            
//             const values = batch.map(record => [
//                 record.id,
//                 record.employee_code,
//                 record.log_date_time,
//                 record.log_date,
//                 record.log_time,
//                 record.direction
//             ]);

//             try {
//                 await pool.query(
//                     `INSERT IGNORE INTO attendance_logs 
//                     (id, employee_code, log_date_time, log_date, log_time, direction)
//                     VALUES ?`,
//                     [values]
//                 );
//                 syncedCount += batch.length;
//                 const progress = ((syncedCount / allRecords.length) * 100).toFixed(1);
//                 console.log(`Progress: ${syncedCount}/${allRecords.length} (${progress}%)`);
//             } catch (error) {
//                 errorCount += batch.length;
//                 console.error(`Batch insert error at position ${i}:`, error.message);
//             }
//         }

//         const endTime = Date.now();
//         const duration = ((endTime - startTime) / 1000).toFixed(2);

//         console.log(`✅ Full sync completed: ${syncedCount} records in ${duration}s`);

//         res.json({
//             success: true,
//             message: 'Full attendance sync completed',
//             total_records: allRecords.length,
//             synced: syncedCount,
//             errors: errorCount,
//             duration_seconds: duration
//         });
//     } catch (error) {
//         console.error('❌ Full sync error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error during full sync',
//             error: error.message
//         });
//     }
// };

// Get sync status and comparison
export const getSyncStatus = async (req, res) => {
    try {
        // Get counts from both databases
        const [bioCount] = await biometricPool.query(
            'SELECT COUNT(*) as total FROM attendance_logs'
        );
        const [mainCount] = await pool.query(
            'SELECT COUNT(*) as total FROM attendance_logs'
        );
        
        // Get last records from both databases
        const [bioLastRecord] = await biometricPool.query(
            'SELECT MAX(id) as last_id, MAX(log_date) as last_date FROM attendance_logs'
        );
        const [mainLastRecord] = await pool.query(
            'SELECT MAX(id) as last_id, MAX(log_date) as last_date FROM attendance_logs'
        );

        const bioTotal = bioCount[0].total;
        const mainTotal = mainCount[0].total;
        const pending = bioTotal - mainTotal;

        res.json({
            success: true,
            biometric_db: {
                total_records: bioTotal,
                last_id: bioLastRecord[0]?.last_id || 0,
                last_date: bioLastRecord[0]?.last_date || null
            },
            main_db: {
                total_records: mainTotal,
                last_id: mainLastRecord[0]?.last_id || 0,
                last_date: mainLastRecord[0]?.last_date || null
            },
            sync_status: {
                pending_records: pending,
                sync_percentage: bioTotal > 0 ? ((mainTotal / bioTotal) * 100).toFixed(2) + '%' : '0%',
                is_synced: pending === 0,
                needs_sync: pending > 0
            }
        });
    } catch (error) {
        console.error('❌ Status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sync status',
            error: error.message
        });
    }
};

// Auto-sync for real-time updates (can be scheduled with cron)
export const autoSyncLatest = async (req, res) => {
    try {
        console.log('🔄 Auto-sync: Checking for new records...');

        // Get the last synced ID
        const [lastRecord] = await pool.query(
            'SELECT MAX(id) as last_id FROM attendance_logs'
        );
        const lastSyncedId = lastRecord[0]?.last_id || 0;

        // Fetch only new records
        const [newRecords] = await biometricPool.query(
            `SELECT id, employee_code, log_date_time, log_date, log_time, direction 
             FROM attendance_logs 
             WHERE id > ? 
             ORDER BY id ASC 
             LIMIT 1000`,
            [lastSyncedId]
        );

        if (newRecords.length === 0) {
            return res.json({
                success: true,
                message: 'Already up to date',
                synced: 0
            });
        }

        // Insert new records
        let syncedCount = 0;
        for (const record of newRecords) {
            try {
                await pool.query(
                    `INSERT INTO attendance_logs 
                    (id, employee_code, log_date_time, log_date, log_time, direction)
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        record.id,
                        record.employee_code,
                        record.log_date_time,
                        record.log_date,
                        record.log_time,
                        record.direction
                    ]
                );
                syncedCount++;
            } catch (error) {
                if (error.code !== 'ER_DUP_ENTRY') {
                    console.error(`Error syncing record ${record.id}:`, error.message);
                }
            }
        }

        console.log(`✅ Auto-sync: ${syncedCount} new records synced`);

        res.json({
            success: true,
            message: 'Auto-sync completed',
            synced: syncedCount,
            checked: newRecords.length
        });
    } catch (error) {
        console.error('❌ Auto-sync error:', error);
        res.status(500).json({
            success: false,
            message: 'Error in auto-sync',
            error: error.message
        });
    }
};

// Sync by date range (useful for specific period syncing)
export const syncByDateRange = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'start_date and end_date are required'
            });
        }

        console.log(`🔄 Syncing records from ${start_date} to ${end_date}...`);

        // Fetch records for the date range
        const [records] = await biometricPool.query(
            `SELECT id, employee_code, log_date_time, log_date, log_time, direction 
             FROM attendance_logs 
             WHERE log_date BETWEEN ? AND ? 
             ORDER BY id ASC`,
            [start_date, end_date]
        );

        if (records.length === 0) {
            return res.json({
                success: true,
                message: 'No records found for the specified date range',
                synced: 0
            });
        }

        let syncedCount = 0;
        let updatedCount = 0;

        for (const record of records) {
            try {
                const [result] = await pool.query(
                    `INSERT INTO attendance_logs 
                    (id, employee_code, log_date_time, log_date, log_time, direction)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    employee_code = VALUES(employee_code),
                    log_date_time = VALUES(log_date_time),
                    log_date = VALUES(log_date),
                    log_time = VALUES(log_time),
                    direction = VALUES(direction)`,
                    [
                        record.id,
                        record.employee_code,
                        record.log_date_time,
                        record.log_date,
                        record.log_time,
                        record.direction
                    ]
                );
                
                if (result.affectedRows === 1) {
                    syncedCount++; // New record inserted
                } else if (result.affectedRows === 2) {
                    updatedCount++; // Existing record updated
                }
            } catch (error) {
                console.error(`Error syncing record ${record.id}:`, error.message);
            }
        }

        res.json({
            success: true,
            message: 'Date range sync completed',
            total_records: records.length,
            new_records: syncedCount,
            updated_records: updatedCount,
            date_range: { start_date, end_date }
        });
    } catch (error) {
        console.error('❌ Date range sync error:', error);
        res.status(500).json({
            success: false,
            message: 'Error syncing date range',
            error: error.message
        });
    }
};
