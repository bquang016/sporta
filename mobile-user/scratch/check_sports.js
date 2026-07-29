async function checkSports() {
  try {
    const res = await fetch('http://localhost:8387/api/v1/clubs');
    const data = await res.json();
    console.log('Total clubs:', data.length);
    data.forEach((c, idx) => {
      console.log(`Club ${idx + 1}: name="${c.name}", sport="${c.sport}", sportId=${c.sportId}`);
    });
  } catch (err) {
    console.error(err);
  }
}
checkSports();
