async function test() {
  try {
    console.log('--- LOGGING IN ---');
    const loginRes = await fetch('http://localhost:8387/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'phuccpzz1234@gmail.com',
        password: 'admin123'
      })
    });

    if (!loginRes.ok) {
      const errText = await loginRes.text();
      throw new Error(`Login failed: ${loginRes.status} - ${errText}`);
    }

    const loginData = await loginRes.json();
    const token = loginData.accessToken;
    console.log('Login success! Token acquired.');

    console.log('--- GET JOINED CLUBS (/clubs/my) ---');
    const myClubsRes = await fetch('http://localhost:8387/api/v1/clubs/my', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Status /clubs/my:', myClubsRes.status);
    const myClubs = await myClubsRes.json();
    console.log('Joined clubs:', myClubs);

    console.log('--- GET AVAILABLE CLUBS (/clubs) ---');
    const availClubsRes = await fetch('http://localhost:8387/api/v1/clubs', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Status /clubs:', availClubsRes.status);
    const availClubs = await availClubsRes.json();
    console.log('Available clubs:', availClubs);

  } catch (err) {
    console.error('Test failed with error:', err.message);
  }
}
test();
