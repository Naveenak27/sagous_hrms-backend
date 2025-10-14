import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const biometricPool = mysql.createPool({
    host: process.env.BIO_DB_HOST,
    user: process.env.BIO_DB_USERNAME,
    password: process.env.BIO_DB_PASSWORD,
    database: process.env.BIO_DB_DATABASE,
    port: process.env.BIO_DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 20, // Increased from 10
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 60000, // 60 seconds
    acquireTimeout: 60000  // 60 seconds
});

biometricPool.getConnection()
    .then(connection => {
        console.log('✅ Connected to Biometric Database');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Biometric Database connection failed:', err.message);
    });

export default biometricPool;
