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

    // Test /clubs/my?sportId=2 (Cầu lông)
    console.log('--- MY CLUBS - SPORT FILTER ID = 2 (Cầu lông) ---');
    const resJoined2 = await fetch('http://localhost:8387/api/v1/clubs/my?sportId=2', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('My clubs (Cầu lông):', await resJoined2.json());

    // Test /clubs/my?sportId=3 (Pickleball)
    console.log('--- MY CLUBS - SPORT FILTER ID = 3 (Pickleball) ---');
    const resJoined3 = await fetch('http://localhost:8387/api/v1/clubs/my?sportId=3', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('My clubs (Pickleball):', await resJoined3.json());

  } catch (err) {
    console.error('Test failed:', err.message);
  }
}
test();
