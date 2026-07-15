async function test() {
  try {
    console.log('--- LOGGING IN AS phuccpzz1234@gmail.com ---');
    const loginRes = await fetch('http://localhost:8387/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'phuccpzz1234@gmail.com', password: 'admin123' })
    });
    if (!loginRes.ok) throw new Error('Login failed');
    const { accessToken: token } = await loginRes.json();

    console.log('--- FETCHING MEMBERS BEFORE TRANSFER ---');
    const mRes1 = await fetch('http://localhost:8387/api/v1/clubs/11/members', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Members before:', await mRes1.json());

    console.log('--- CALLING TRANSFER TO USER 6 ---');
    const transRes = await fetch('http://localhost:8387/api/v1/clubs/11/members/6/transfer', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Transfer status:', transRes.status);
    if (!transRes.ok) {
      console.log('Transfer error:', await transRes.text());
    }

    console.log('--- FETCHING MEMBERS AFTER TRANSFER ---');
    const mRes2 = await fetch('http://localhost:8387/api/v1/clubs/11/members', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Members after:', await mRes2.json());

    // Restore to original state for user test
    console.log('--- RESTORING DB FOR CLUB 11 ---');
    const { Client } = require('pg');
    const pgClient = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'sporta_database',
      password: '123456',
      port: 5432,
    });
    await pgClient.connect();
    await pgClient.query("UPDATE club_members SET role = 'ADMIN' WHERE club_id = 11 AND user_id = 5;");
    await pgClient.query("UPDATE club_members SET role = 'MEMBER' WHERE club_id = 11 AND user_id = 6;");
    await pgClient.query("UPDATE clubs SET creator_id = 5 WHERE id = 11;");
    console.log('Restored DB successfully.');
    await pgClient.end();

  } catch (err) {
    console.error('Test failed:', err.message);
  }
}
test();
