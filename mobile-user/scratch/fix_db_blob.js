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
    console.log('Connected to PostgreSQL.');

    // Update clubs where avatar_image or cover_image contains 'blob:'
    const resAvatar = await client.query(
      "UPDATE clubs SET avatar_image = NULL WHERE avatar_image LIKE 'blob:%';"
    );
    console.log('Updated clubs avatar_image:', resAvatar.rowCount);

    const resCover = await client.query(
      "UPDATE clubs SET cover_image = NULL WHERE cover_image LIKE 'blob:%';"
    );
    console.log('Updated clubs cover_image:', resCover.rowCount);

    // Let's verify
    const verifyRes = await client.query("SELECT id, name, avatar_image, cover_image FROM clubs;");
    console.log('--- VERIFIED CLUBS IN DB ---');
    console.log(verifyRes.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
