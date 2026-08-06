async function check() {
  try {
    console.log('Checking localhost...');
    const res1 = await fetch('http://localhost:8387/api/v1/auth/ping');
    console.log('Localhost ping status:', res1.status);
    console.log('Localhost body:', await res1.text());
  } catch (err) {
    console.error('Localhost error:', err.message);
  }

  try {
    console.log('Checking IP 192.168.1.6...');
    const res2 = await fetch('http://192.168.1.6:8387/api/v1/auth/ping');
    console.log('IP ping status:', res2.status);
    console.log('IP body:', await res2.text());
  } catch (err) {
    console.error('IP error:', err.message);
  }
}
check();
