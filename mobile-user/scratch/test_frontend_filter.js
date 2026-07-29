async function testFrontendFilter() {
  try {
    const res = await fetch('http://localhost:8387/api/v1/clubs');
    const clubs = await res.json();
    console.log('Total clubs fetched:', clubs.length);

    const joinedIds = []; // Simulation for guest or new user

    // Test with selectedSport = 'all'
    let selectedSport = 'all';
    let filtered = clubs.filter(club => {
      const isJoined = joinedIds.includes(club.id);
      if (isJoined) return false;
      const matchesSearch = true; // no search query
      const matchesSport = selectedSport === 'all' || 
        (selectedSport === 'football' && club.sport === 'Bóng đá') ||
        (selectedSport === 'basketball' && club.sport === 'Bóng rổ') ||
        (selectedSport === 'badminton' && club.sport === 'Cầu lông') ||
        (selectedSport === 'pickleball' && club.sport === 'Pickleball');
      return matchesSearch && matchesSport;
    });
    console.log(`Filter 'all' -> filtered count: ${filtered.length}`);

    // Test with selectedSport = 'football'
    selectedSport = 'football';
    filtered = clubs.filter(club => {
      const isJoined = joinedIds.includes(club.id);
      if (isJoined) return false;
      const matchesSearch = true;
      const matchesSport = selectedSport === 'all' || 
        (selectedSport === 'football' && club.sport === 'Bóng đá') ||
        (selectedSport === 'basketball' && club.sport === 'Bóng rổ') ||
        (selectedSport === 'badminton' && club.sport === 'Cầu lông') ||
        (selectedSport === 'pickleball' && club.sport === 'Pickleball');
      return matchesSearch && matchesSport;
    });
    console.log(`Filter 'football' -> filtered count: ${filtered.length}`);

    // Test with selectedSport = 'pickleball'
    selectedSport = 'pickleball';
    filtered = clubs.filter(club => {
      const isJoined = joinedIds.includes(club.id);
      if (isJoined) return false;
      const matchesSearch = true;
      const matchesSport = selectedSport === 'all' || 
        (selectedSport === 'football' && club.sport === 'Bóng đá') ||
        (selectedSport === 'basketball' && club.sport === 'Bóng rổ') ||
        (selectedSport === 'badminton' && club.sport === 'Cầu lông') ||
        (selectedSport === 'pickleball' && club.sport === 'Pickleball');
      return matchesSearch && matchesSport;
    });
    console.log(`Filter 'pickleball' -> filtered count: ${filtered.length}`);
  } catch (err) {
    console.error(err);
  }
}
testFrontendFilter();
