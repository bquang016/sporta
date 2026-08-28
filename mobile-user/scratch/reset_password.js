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
    
    // Hash BCrypt for '123456' is: $2a$10$X5m461YlP8rB.K3oQp45P.j1WbU/b4uJg0G8q1dO/kCcrr1.j/H3K
    const hash = '$2a$10$X5m461YlP8rB.K3oQp45P.j1WbU/b4uJg0G8q1dO/kCcrr1.j/H3K';
    
    const res = await pgClient.query(
      "UPDATE users SET password = $1 WHERE email = 'phuccpzz1234@gmail.com';",
      [hash]
    );
    
    console.log('Password reset successfully. Rows affected:', res.rowCount);
  } catch (err) {
    console.error('Failed to reset password:', err.message);
  } finally {
    await pgClient.end();
  }
}

main();
