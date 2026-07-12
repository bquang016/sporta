async function test() {
  try {
    console.log('--- LOGGING IN AS ADMIN (hoàng phúc ngô) ---');
    const loginRes = await fetch('http://localhost:8387/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'phuccpzz1234@gmail.com', password: 'admin123' })
    });
    if (!loginRes.ok) throw new Error('Login failed');
    const { accessToken: token } = await loginRes.json();

    console.log('--- CREATING NEW CLUB FOR ROLE TEST ---');
    const createRes = await fetch('http://localhost:8387/api/v1/clubs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'CLB Test Role ' + Date.now(),
        description: 'Mô tả test role',
        sportId: 1,
        isPrivate: false,
        area: 'Hà Nội'
      })
    });
    const newClub = await createRes.json();
    const clubId = newClub.id;
    console.log(`Created club ID: ${clubId}`);

    // Join Đăng Quang Bùi (user 6) and Opps Troll (user 4) to this new club
    // First, let's login user 6 to request join
    console.log('--- LOGGING IN USER 6 (Đăng Quang Bùi) ---');
    // We copied hash of admin123 to phuccpzz1234. Let's reset user 6's password to admin123 as well to make login easy
    // Wait, let's just make direct insert in DB via pg to simulate they joined and got approved!
    const { Client } = require('pg');
    const pgClient = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'sporta_database',
      password: '123456',
      port: 5432,
    });
    await pgClient.connect();
    
    console.log('--- ADDING MEMBERS TO NEW CLUB IN DB ---');
    // Add user 6 as MEMBER APPROVED
    await pgClient.query(
      "INSERT INTO club_members (club_id, user_id, role, status, joined_at) VALUES ($1, 6, 'MEMBER', 'APPROVED', NOW());",
      [clubId]
    );
    // Add user 4 as MEMBER APPROVED
    await pgClient.query(
      "INSERT INTO club_members (club_id, user_id, role, status, joined_at) VALUES ($1, 4, 'MEMBER', 'APPROVED', NOW());",
      [clubId]
    );
    
    console.log('Members added successfully.');

    // Fetch members to verify they are currently MEMBERS
    console.log('--- INITIAL MEMBERS LIST ---');
    let membersRes = await fetch(`http://localhost:8387/api/v1/clubs/${clubId}/members`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(await membersRes.json());

    // Step 1: Assign user 6 (Đăng Quang Bùi) as SUB_LEADER
    console.log('--- ASSIGNING USER 6 AS SUB_LEADER ---');
    let assign1 = await fetch(`http://localhost:8387/api/v1/clubs/${clubId}/members/6/assign-subleader`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Assign 1 status:', assign1.status);

    // Fetch members to check
    console.log('--- MEMBERS LIST AFTER ASSIGN 1 ---');
    membersRes = await fetch(`http://localhost:8387/api/v1/clubs/${clubId}/members`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(await membersRes.json());

    // Step 2: Assign user 4 (Opps Troll) as SUB_LEADER (should automatically demote user 6 to MEMBER)
    console.log('--- ASSIGNING USER 4 AS SUB_LEADER (AUTO DEMOTING USER 6) ---');
    let assign2 = await fetch(`http://localhost:8387/api/v1/clubs/${clubId}/members/4/assign-subleader`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Assign 2 status:', assign2.status);

    // Fetch members to check final status
    console.log('--- FINAL MEMBERS LIST ---');
    membersRes = await fetch(`http://localhost:8387/api/v1/clubs/${clubId}/members`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(await membersRes.json());

    await pgClient.end();
  } catch (err) {
    console.error('Role test failed:', err.message);
  }
}
test();
