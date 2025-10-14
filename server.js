import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import runMigration from './database/migrate.js';

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

dotenv.config();

const app = express();

// CORS Configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
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

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running', timestamp: new Date() });
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


// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;

// Start server with automatic migration
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



// Start server WITHOUT automatic migration
const startServer = async () => {
    try {
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



