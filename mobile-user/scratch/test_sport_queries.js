async function testSportQueries() {
  try {
    const urls = [
      'http://localhost:8387/api/v1/clubs',
      'http://localhost:8387/api/v1/clubs?sportId=1',
      'http://localhost:8387/api/v1/clubs?sportId=3'
    ];
    for (const url of urls) {
      const res = await fetch(url);
      const data = await res.json();
      console.log(`URL: ${url} -> status=${res.status}, count=${data.length}`);
      if (data.length > 0) {
        console.log(`  First club: name="${data[0].name}", sport="${data[0].sport}", sportId=${data[0].sportId}`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}
testSportQueries();
