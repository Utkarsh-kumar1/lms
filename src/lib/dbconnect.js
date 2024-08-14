import mysql from 'mysql2/promise';

let pool;

function CreateConnection() {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            idleTimeout: 60000,
            queueLimit: 0
        });
        // console.log('Database pool created');
    }
    return pool;
}

export default CreateConnection;
