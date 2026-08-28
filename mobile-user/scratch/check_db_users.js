const { Client } = require('pg');

async function checkUsers() {
  const client = new Client({
    connectionString: 'postgresql://localhost:5432/sporta_database'
  });
  try {
    await client.connect();
    const res = await client.query('SELECT id, email, full_name FROM users LIMIT 5');
    console.log('Users in DB:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
checkUsers();
