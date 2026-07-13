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
    console.log('--- CONNECTED TO POSTGRES ---');
    
    const res = await client.query('SELECT * FROM club_members;');
    console.log('--- ALL CLUB MEMBERS IN DB ---');
    console.log(res.rows);

  } catch (err) {
    console.error('Database query error:', err);
  } finally {
    await client.end();
  }
}

main();
