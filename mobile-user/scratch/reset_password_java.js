const { Client } = require('pg');

const pgClient = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'sporta_database',
  password: '123456',
  port: 5432,
});

async function main() {
  try {
    await pgClient.connect();
    console.log('Connected to PostgreSQL.');
    
    // Copy the exact hash of 'admin123' from admin account
    const adminHash = '$2a$10$Q8Msgjg9FmqGkDC8Twt7uefzfzcayx3WgUVpGzgEwMwoJnz0LZ9PG';
    
    const res = await pgClient.query(
      "UPDATE users SET password = $1 WHERE email = 'phuccpzz1234@gmail.com';",
      [adminHash]
    );
    
    console.log('Password updated to admin123 hash. Rows affected:', res.rowCount);
  } catch (err) {
    console.error('Failed to reset password:', err.message);
  } finally {
    await pgClient.end();
  }
}

main();
