const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'sporta_database',
  password: '123456',
  port: 5432,
});

async function main() {
  try {
    await client.connect();
    const res = await client.query('SELECT * FROM users;');
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
