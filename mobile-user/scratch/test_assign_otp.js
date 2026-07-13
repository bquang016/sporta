const { Client } = require('pg');

const pgClient = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'sporta_database',
  password: '123456',
  port: 5432,
});

async function test() {
  try {
    console.log('--- SENDING OTP REQUEST ---');
    const sendOtpRes = await fetch('http://localhost:8387/api/v1/auth/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'phuccpzz1234@gmail.com'
      })
    });

    if (!sendOtpRes.ok) {
      const txt = await sendOtpRes.text();
      throw new Error(`Send OTP failed: ${sendOtpRes.status} - ${txt}`);
    }
    console.log('OTP request sent successfully!');

    // Wait a brief moment for DB insert
    await new Promise(r => setTimeout(r, 1000));

    console.log('--- CONNECTING TO DB TO RETRIEVE OTP ---');
    await pgClient.connect();
    const queryRes = await pgClient.query(
      "SELECT otp_code FROM otp_records WHERE email = 'phuccpzz1234@gmail.com' ORDER BY expires_at DESC LIMIT 1;"
    );

    if (queryRes.rows.length === 0) {
      throw new Error('No OTP record found in database for email phuccpzz1234@gmail.com');
    }

    const otpCode = queryRes.rows[0].otp_code;
    console.log(`Found OTP code in DB: ${otpCode}`);

    console.log('--- VERIFYING OTP ---');
    const verifyRes = await fetch('http://localhost:8387/api/v1/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'phuccpzz1234@gmail.com',
        otp: otpCode
      })
    });

    if (!verifyRes.ok) {
      const txt = await verifyRes.text();
      throw new Error(`Verify OTP failed: ${verifyRes.status} - ${txt}`);
    }

    const verifyData = await verifyRes.json();
    const token = verifyData.accessToken;
    console.log('Verify OTP success! Token acquired.');

    console.log('--- CALLING ASSIGN SUBLEADER ---');
    const assignRes = await fetch('http://localhost:8387/api/v1/clubs/11/members/6/assign-subleader', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Assign status:', assignRes.status);
    const resText = await assignRes.text();
    console.log('Assign body:', resText);

  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await pgClient.end();
  }
}

test();
