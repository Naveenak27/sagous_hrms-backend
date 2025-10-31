// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import runMigration from './database/migrate.js';
// import startLeaveBalanceCronJob from './jobs/leaveBalanceCron.js';
// import teamRoutes from './routes/teamRoutes.js';
// import mysql from 'mysql2';


// // Import routes
// import authRoutes from './routes/auth.js';
// import employeeRoutes from './routes/employees.js';
// import roleRoutes from './routes/roles.js';
// import permissionRoutes from './routes/permissions.js';
// import leaveTypeRoutes from './routes/leaveTypes.js';
// import leaveRoutes from './routes/leaves.js';
// import holidayRoutes from './routes/holidays.js';
// import calendarRoutes from './routes/calendar.js';
// import attendanceRoutes from './routes/attendance.js'
// import syncRoutes from './routes/sync.js';
// import announcementRoutes from './routes/announcements.js'
// import { getAllDepartments } from './controllers/departmentController.js';

// import logsRoutes from './routes/logs.js';
// import { initializeScheduledJobs } from './jobs/emailloginJobs.js';



// dotenv.config();

// const app = express();


// // CORS Configuration
// app.use(cors({
//     origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['https://sagous.netlify.app'],
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));


// startLeaveBalanceCronJob();


// // Initialize scheduled jobs
// initializeScheduledJobs();
// console.log('🤖 Cron jobs started successfully\n');




// // Temporary route to fetch all attendance logs from BIO database
// app.get('/api/bio/attendance-logs', async (req, res) => {
//   try {
//     const connection = mysql.createConnection({
//       host: process.env.BIO_DB_HOST,
//       port: process.env.BIO_DB_PORT,
//       user: process.env.BIO_DB_USERNAME,
//       password: process.env.BIO_DB_PASSWORD,
//       database: process.env.BIO_DB_DATABASE
//     });

//     connection.connect((err) => {
//       if (err) {
//         return res.status(500).json({ 
//           error: 'Database connection failed', 
//           details: err.message 
//         });
//       }

//       connection.query('SELECT * FROM attendance_logs', (error, results) => {
//         if (error) {
//           connection.end();
//           return res.status(500).json({ 
//             error: 'Query failed', 
//             details: error.message 
//           });
//         }

//         connection.end();
//         res.json({ 
//           success: true, 
//           count: results.length,
//           data: results
//         });
//       });
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       error: 'Server error', 
//       details: error.message 
//     });
//   }
// });




// // Temporary route to list all tables in BIO database
// app.get('/api/bio/tables', async (req, res) => {
//   try {
//     const connection = mysql.createConnection({
//       host: process.env.BIO_DB_HOST,
//       port: process.env.BIO_DB_PORT,
//       user: process.env.BIO_DB_USERNAME,
//       password: process.env.BIO_DB_PASSWORD,
//       database: process.env.BIO_DB_DATABASE
//     });

//     connection.connect((err) => {
//       if (err) {
//         return res.status(500).json({ 
//           error: 'Database connection failed', 
//           details: err.message 
//         });
//       }

//       connection.query('SHOW TABLES', (error, results) => {
//         if (error) {
//           connection.end();
//           return res.status(500).json({ 
//             error: 'Query failed', 
//             details: error.message 
//           });
//         }

//         const tables = results.map(row => Object.values(row)[0]);
        
//         connection.end();
//         res.json({ 
//           success: true, 
//           database: process.env.BIO_DB_DATABASE,
//           tables: tables,
//           count: tables.length 
//         });
//       });
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       error: 'Server error', 
//       details: error.message 
//     });
//   }
// });




// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Logging middleware
// app.use((req, res, next) => {
//     console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
//     next();
// });

// // Routes
// app.use('/api/teams', teamRoutes);
// app.use('/api/', permissionRoutes);
// app.use('/api/departments', getAllDepartments);


// app.use('/api/sync', syncRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/attendance', attendanceRoutes);
// app.use('/api/employees', employeeRoutes);
// app.use('/api/roles', roleRoutes);
// app.use('/api/permissions', permissionRoutes);
// app.use('/api/leave-types', leaveTypeRoutes);
// app.use('/api/leaves', leaveRoutes);
// app.use('/api/holidays', holidayRoutes);
// app.use('/api/calendar', calendarRoutes);
// app.use('/api/announcements', announcementRoutes);




// app.use('/api/announcements', announcementRoutes);
// app.use('/api', logsRoutes);

// // Health check
// app.get('/api/health', (req, res) => {
//     res.json({ success: true, message: 'Server is running', timestamp: new Date() });
// });
// // Temporary endpoint to create superadmin - REMOVE AFTER FIRST USE
// app.post('/api/setup/create-superadmin', async (req, res) => {
//     try {
//         const bcrypt = (await import('bcryptjs')).default;
//         const pool = (await import('./config/db.js')).default;
        
//         const { employee_id, name, email, password } = req.body;
        
//         // Check if superadmin already exists
//         const [existing] = await pool.query(
//             'SELECT u.id FROM users u JOIN employees e ON u.id = e.user_id WHERE e.role_id = 1'
//         );
        
//         if (existing.length > 0) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: 'Superadmin already exists' 
//             });
//         }
        
//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);
        
//         // Insert user
//         const [userResult] = await pool.query(
//             'INSERT INTO users (employee_id, name, email, password) VALUES (?, ?, ?, ?)',
//             [employee_id, name, email, hashedPassword]
//         );
        
//         // Insert employee with superadmin role (role_id = 1)
//         await pool.query(
//             'INSERT INTO employees (user_id, mobile_number, role_id, date_of_joining, designation, is_active) VALUES (?, ?, ?, ?, ?, ?)',
//             [userResult.insertId, '9999999999', 1, new Date(), 'System Administrator', true]
//         );
        
//         res.json({ 
//             success: true, 
//             message: 'Superadmin created successfully',
//             credentials: { email, password }
//         });
//     } catch (error) {
//         res.status(500).json({ 
//             success: false, 
//             error: error.message 
//         });
//     }
// });


// // Error handling
// app.use((err, req, res, next) => {
//     console.error('Error:', err.stack);
//     res.status(500).json({
//         success: false,
//         message: 'Something went wrong!',
//         error: process.env.NODE_ENV === 'development' ? err.message : {}
//     });
// });

// // 404 handler
// app.use((req, res) => {
//     res.status(404).json({
//         success: false,
//         message: 'Route not found'
//     });
// });

// const PORT = process.env.PORT || 5000;

// // Start server with automatic migration
// const startServer = async () => {
//     try {
//         // Run database migration
//         console.log('🔄 Checking database...');
//         await runMigration();
        
//         // Start Express server
//         app.listen(PORT, () => {
//             console.log('='.repeat(50));
//             console.log(`✅ Server running on port ${PORT}`);
//             console.log(`🌐 API URL: http://localhost:${PORT}/api`);
//             console.log(`🗄️  Database: ${process.env.DB_NAME}`);
//             console.log('='.repeat(50));
//         });
//     } catch (error) {
//         console.error('❌ Failed to start server:', error);
//         process.exit(1);
//     }
// };

// startServer();




















import express from 'express';
import dotenv from 'dotenv';
import runMigration from './database/migrate.js';
import startLeaveBalanceCronJob from './jobs/leaveBalanceCron.js';
import teamRoutes from './routes/teamRoutes.js';
import mysql from 'mysql2';

// Import routes
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import roleRoutes from './routes/roles.js';
import permissionRoutes from './routes/permissions.js';
import leaveTypeRoutes from './routes/leaveTypes.js';
import leaveRoutes from './routes/leaves.js';
import holidayRoutes from './routes/holidays.js';
import calendarRoutes from './routes/calendar.js';
import attendanceRoutes from './routes/attendance.js'
import syncRoutes from './routes/sync.js';
import announcementRoutes from './routes/announcements.js'
import { getAllDepartments } from './controllers/departmentController.js';
import logsRoutes from './routes/logs.js';
import { initializeScheduledJobs } from './jobs/emailloginJobs.js';

dotenv.config();

const app = express();

// ============================================================
// 1. Manual CORS Configuration - MUST BE FIRST
// ============================================================
app.use((req, res, next) => {
    // res.setHeader('Access-Control-Allow-Origin', 'https://sagous.netlify.app');
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    
    next();
});

// ============================================================
// 2. Body Parsing Middleware - BEFORE ROUTES
// ============================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// 3. Logging Middleware
// ============================================================
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============================================================
// 4. Initialize Cron Jobs
// ============================================================
startLeaveBalanceCronJob();
initializeScheduledJobs();
console.log('🤖 Cron jobs started successfully\n');

// ============================================================
// 5. Routes - ALL ROUTES AFTER MIDDLEWARE
// ============================================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running', timestamp: new Date() });
});

// Temporary route to fetch all attendance logs from BIO database
app.get('/api/bio/attendance-logs', async (req, res) => {
  try {
    const connection = mysql.createConnection({
      host: process.env.BIO_DB_HOST,
      port: process.env.BIO_DB_PORT,
      user: process.env.BIO_DB_USERNAME,
      password: process.env.BIO_DB_PASSWORD,
      database: process.env.BIO_DB_DATABASE
    });

    connection.connect((err) => {
      if (err) {
        return res.status(500).json({ 
          error: 'Database connection failed', 
          details: err.message 
        });
      }

      connection.query('SELECT * FROM attendance_logs', (error, results) => {
        if (error) {
          connection.end();
          return res.status(500).json({ 
            error: 'Query failed', 
            details: error.message 
          });
        }

        connection.end();
        res.json({ 
          success: true, 
          count: results.length,
          data: results
        });
      });
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
});

// Temporary route to list all tables in BIO database
app.get('/api/bio/tables', async (req, res) => {
  try {
    const connection = mysql.createConnection({
      host: process.env.BIO_DB_HOST,
      port: process.env.BIO_DB_PORT,
      user: process.env.BIO_DB_USERNAME,
      password: process.env.BIO_DB_PASSWORD,
      database: process.env.BIO_DB_DATABASE
    });

    connection.connect((err) => {
      if (err) {
        return res.status(500).json({ 
          error: 'Database connection failed', 
          details: err.message 
        });
      }

      connection.query('SHOW TABLES', (error, results) => {
        if (error) {
          connection.end();
          return res.status(500).json({ 
            error: 'Query failed', 
            details: error.message 
          });
        }

        const tables = results.map(row => Object.values(row)[0]);
        
        connection.end();
        res.json({ 
          success: true, 
          database: process.env.BIO_DB_DATABASE,
          tables: tables,
          count: tables.length 
        });
      });
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
});

// Temporary endpoint to create superadmin - REMOVE AFTER FIRST USE
app.post('/api/setup/create-superadmin', async (req, res) => {
    try {
        const bcrypt = (await import('bcryptjs')).default;
        const pool = (await import('./config/db.js')).default;
        
        const { employee_id, name, email, password } = req.body;
        
        // Check if superadmin already exists
        const [existing] = await pool.query(
            'SELECT u.id FROM users u JOIN employees e ON u.id = e.user_id WHERE e.role_id = 1'
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Superadmin already exists' 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user
        const [userResult] = await pool.query(
            'INSERT INTO users (employee_id, name, email, password) VALUES (?, ?, ?, ?)',
            [employee_id, name, email, hashedPassword]
        );
        
        // Insert employee with superadmin role (role_id = 1)
        await pool.query(
            'INSERT INTO employees (user_id, mobile_number, role_id, date_of_joining, designation, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            [userResult.insertId, '9999999999', 1, new Date(), 'System Administrator', true]
        );
        
        res.json({ 
            success: true, 
            message: 'Superadmin created successfully',
            credentials: { email, password }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Main application routes
app.use('/api/sync', syncRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/leave-types', leaveTypeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/departments', getAllDepartments);
app.use('/api', logsRoutes);

// ============================================================
// 6. Error Handling - AFTER ALL ROUTES
// ============================================================

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

app.get('/status', (req, res) => {
  res.status(200).json({ status: 'alive', time: new Date() });
});


// 404 handler - MUST BE LAST
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// ============================================================
// 7. Start Server
// ============================================================

const PORT = process.env.PORT || 5000;

// Start server with automatic migration
const startServer = async () => {
    try {
        // Run database migration
        console.log('🔄 Checking database...');
        await runMigration();
        
        // Start Express server
        app.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`🌐 API URL: http://localhost:${PORT}/api`);
            console.log(`🗄️  Database: ${process.env.DB_NAME}`);
            console.log('='.repeat(50));
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();











// // Start server WITHOUT automatic migration
// const startServer = async () => {
//     try {
//         // Start Express server
//         app.listen(PORT, () => {
//             console.log('='.repeat(50));
//             console.log(`✅ Server running on port ${PORT}`);
//             console.log(`🌐 API URL: http://localhost:${PORT}/api`);
//             console.log(`🗄️  Database: ${process.env.DB_NAME}`);
//             console.log('='.repeat(50));
//         });
//     } catch (error) {
//         console.error('❌ Failed to start server:', error);
//         process.exit(1);
//     }
// };





// import express from 'express';
// import mysql from 'mysql2/promise';
// import dotenv from 'dotenv';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Create database connection pool
// const pool = mysql.createPool({
//   host: process.env.BIO_DB_HOST,
//   port: process.env.BIO_DB_PORT,
//   user: process.env.BIO_DB_USERNAME,
//   password: process.env.BIO_DB_PASSWORD,
//   database: process.env.BIO_DB_DATABASE
// });

// // 🟢 Route 1: Get all table names
// app.get('/tables', async (req, res) => {
//   try {
//     const [rows] = await pool.query('SHOW TABLES');
//     const key = Object.keys(rows[0])[0];
//     const tables = rows.map(r => r[key]);
//     res.json({ tables });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to fetch table list' });
//   }
// });

// // 🟢 Route 2: Get table structure (columns info)
// app.get('/tables/:tableName/describe', async (req, res) => {
//   const { tableName } = req.params;
//   try {
//     const [columns] = await pool.query(`DESCRIBE \`${tableName}\``);
//     res.json({ table: tableName, columns });
//   } catch (err) {
//     console.error('Error fetching table info:', err);
//     res.status(500).json({ error: `Failed to fetch info for table ${tableName}` });
//   }
// });

// // 🟢 Route 3: Get all data from a table
// app.get('/tables/:tableName/data', async (req, res) => {
//   const { tableName } = req.params;
//   try {
//     const [rows] = await pool.query(`SELECT * FROM \`${tableName}\``);
//     res.json({ table: tableName, count: rows.length, data: rows });
//   } catch (err) {
//     console.error('Error fetching table data:', err);
//     res.status(500).json({ error: `Failed to fetch data for table ${tableName}` });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);
// });
