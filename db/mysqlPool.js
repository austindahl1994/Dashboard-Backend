import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Gracefully shut down the server and close the pool when the app is terminated
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing MySQL pool');
  pool.end((err) => {
    if (err) {
      console.error('Error closing MySQL pool:', err);
    } else {
      console.log('MySQL pool closed successfully');
    }
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing MySQL pool');
  pool.end((err) => {
    if (err) {
      console.error('Error closing MySQL pool:', err);
    } else {
      console.log('MySQL pool closed successfully');
    }
    process.exit(0);
  });
});


export default pool;
