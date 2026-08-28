async function test() {
  const { Client } = require('pg');
  const pgClient = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'sporta_database',
    password: '123456',
    port: 5432,
  });
  
  try {
    await pgClient.connect();
    
    console.log('--- LOGGING IN AS ADMIN (hoàng phúc ngô) ---');
    const loginRes = await fetch('http://localhost:8387/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'phuccpzz1234@gmail.com', password: 'admin123' })
    });
    if (!loginRes.ok) throw new Error('Login failed');
    const { accessToken: token } = await loginRes.json();

    console.log('--- CREATING NEW CLUB FOR ADMIN ACTIONS TEST ---');
    const createRes = await fetch('http://localhost:8387/api/v1/clubs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'CLB Test Admin Actions ' + Date.now(),
        description: 'Mô tả test admin actions',
        sportId: 1,
        isPrivate: false,
        area: 'Hà Nội'
      })
    });
    const newClub = await createRes.json();
    const clubId = newClub.id;
    console.log(`Created club ID: ${clubId}`);

    console.log('--- ADDING USER 6 (Đăng Quang Bùi) TO CLUB IN DB ---');
    await pgClient.query(
      "INSERT INTO club_members (club_id, user_id, role, status, joined_at) VALUES ($1, 6, 'MEMBER', 'APPROVED', NOW());",
      [clubId]
    );

    // Test 1: Kick member
    console.log('--- TEST 1: KICK MEMBER (DELETE /clubs/{clubId}/members/6) ---');
    const kickRes = await fetch(`http://localhost:8387/api/v1/clubs/${clubId}/members/6`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Kick API status:', kickRes.status);
    if (!kickRes.ok) {
      console.log('Kick API error body:', await kickRes.text());
    }

    // Verify DB after kick
    let dbRes = await pgClient.query("SELECT * FROM club_members WHERE club_id = $1 AND user_id = 6;", [clubId]);
    console.log('DB rows for user 6 after kick:', dbRes.rows.length);

    // Re-add user 6 for transfer test
    console.log('--- RE-ADDING USER 6 FOR TRANSFER TEST ---');
    await pgClient.query(
      "INSERT INTO club_members (club_id, user_id, role, status, joined_at) VALUES ($1, 6, 'MEMBER', 'APPROVED', NOW());",
      [clubId]
    );

    // Test 2: Transfer leadership
    console.log('--- TEST 2: TRANSFER LEADERSHIP (POST /clubs/{clubId}/members/6/transfer) ---');
    const transferRes = await fetch(`http://localhost:8387/api/v1/clubs/${clubId}/members/6/transfer`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Transfer API status:', transferRes.status);
    if (!transferRes.ok) {
      console.log('Transfer API error body:', await transferRes.text());
    }

    // Verify DB roles after transfer
    let membersRes = await pgClient.query("SELECT user_id, role FROM club_members WHERE club_id = $1;", [clubId]);
    console.log('DB members after transfer:', membersRes.rows);

    let clubRes = await pgClient.query("SELECT creator_id FROM clubs WHERE id = $1;", [clubId]);
    console.log('Club creator after transfer:', clubRes.rows);

  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await pgClient.end();
  }
}
test();
