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

    console.log('--- CALLING DEMOTE SUBLEADER ---');
    const demoteRes = await fetch('http://localhost:8387/api/v1/clubs/11/members/6/demote-subleader', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Demote status:', demoteRes.status);
    const resText = await demoteRes.text();
    console.log('Demote body:', resText);

  } catch (err) {
    console.error('Test failed with error:', err.message);
  }
}

test();
