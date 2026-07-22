async function testGuestClubs() {
  try {
    console.log('--- TESTING GUEST CLUBS FETCH (WITHOUT AUTH TOKEN) ---');
    const res = await fetch('http://localhost:8387/api/v1/clubs', {
      method: 'GET'
    });
    console.log('Guest clubs status:', res.status);
    if (!res.ok) {
      console.log('Guest clubs error body:', await res.text());
    } else {
      const data = await res.json();
      console.log('Guest clubs count:', data.length);
      console.log('Sample club:', data[0]);
    }
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}
testGuestClubs();
