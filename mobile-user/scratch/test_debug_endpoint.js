async function testDebugEndpoint() {
  try {
    const res = await fetch('http://localhost:8387/api/v1/clubs/debug');
    const data = await res.json();
    console.log('Debug result:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
testDebugEndpoint();
