import mysql from 'mysql2/promise';
// const mysql = require("mysql2/promise")

let pool;

function createPool() {
    if (!pool) {
        console.log(process.env.DB_HOST)
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
            idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0
        });
        console.log('Database pool created');
        return pool;
    }
    else {
        console.log("Database pool is already Created ");
        return pool;
    }
};

// createPool()
// console.log(pool);
// const data = pool.execute("Select * from users where username = ?", ["Utkarsh"]);
// console.log(data);


export default createPool();
