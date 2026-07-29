const { Client } = require('pg');

async function checkClubMembers() {
  const client = new Client({
    connectionString: 'postgresql://localhost:5432/sporta_database'
  });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT cm.id, cm.club_id, c.name as club_name, cm.user_id, u.email, cm.status, cm.role 
      FROM club_members cm
      JOIN clubs c ON cm.club_id = c.id
      JOIN users u ON cm.user_id = u.id
    `);
    console.log('Club Memberships:');
    res.rows.forEach(row => {
      console.log(`ClubMember: id=${row.id}, club="${row.club_name}" (id=${row.club_id}), user="${row.email}" (id=${row.user_id}), status=${row.status}, role=${row.role}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
checkClubMembers();
