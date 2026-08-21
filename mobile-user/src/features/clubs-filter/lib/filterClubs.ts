import { Club } from '../../../entities/club';
import { ClubFilterState } from '../model/types';

/**
 * Normalizes Vietnamese text by removing leading administrative prefixes
 * and stripping extra whitespace for robust comparison.
 */
export function cleanLocationString(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFC')
    .replace(/\b(thành phố|tỉnh|quận|huyện|thị xã|phường|xã|tp\.|tp|q\.|h\.|p\.)\b/gi, '')
    .replace(/[,\-\/\.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if a club's area matches the selected province
 */
function matchesProvince(clubArea: string, selectedProvince: string): boolean {
  if (!selectedProvince || selectedProvince === 'all') return true;
  if (!clubArea) return false;

  const rawArea = clubArea.toLowerCase().normalize('NFC');
  const rawProvince = selectedProvince.toLowerCase().normalize('NFC');
  const cleanArea = cleanLocationString(clubArea);
  const cleanProv = cleanLocationString(selectedProvince);

  // Exact or contains match on cleaned text
  if (cleanArea.includes(cleanProv) || rawArea.includes(rawProvince)) {
    return true;
  }

  // Special alias handling for major Vietnamese cities
  if (rawProvince.includes('hồ chí minh') || rawProvince.includes('hcm')) {
    if (
      rawArea.includes('hồ chí minh') ||
      rawArea.includes('hcm') ||
      rawArea.includes('tp.hcm') ||
      rawArea.includes('sài gòn') ||
      rawArea.includes('sai gon')
    ) {
      return true;
    }
  }

  if (rawProvince.includes('hà nội')) {
    if (rawArea.includes('hà nội') || rawArea.includes('ha noi') || rawArea.includes('hn')) {
      return true;
    }
  }

  if (rawProvince.includes('đà nẵng')) {
    if (rawArea.includes('đà nẵng') || rawArea.includes('da nang') || rawArea.includes('đn')) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a club's area matches the selected ward/district
 */
function matchesWard(clubArea: string, selectedWard: string): boolean {
  if (!selectedWard || selectedWard === 'all') return true;
  if (!clubArea) return false;

  const rawArea = clubArea.toLowerCase().normalize('NFC');
  const rawWard = selectedWard.toLowerCase().normalize('NFC');
  const cleanArea = cleanLocationString(clubArea);
  const cleanW = cleanLocationString(selectedWard);

  return cleanArea.includes(cleanW) || rawArea.includes(rawWard);
}

/**
 * Check if club sport matches the selected sport filter
 */
function matchesSport(clubSport: string, selectedSport: string): boolean {
  if (!selectedSport || selectedSport === 'all') return true;
  if (!clubSport) return false;

  const s = clubSport.toLowerCase().normalize('NFC');

  switch (selectedSport) {
    case 'football':
      return s.includes('bóng đá') || s.includes('football') || s.includes('soccer');
    case 'badminton':
      return s.includes('cầu lông') || s.includes('badminton');
    case 'pickleball':
      return s.includes('pickleball');
    case 'basketball':
      return s.includes('bóng rổ') || s.includes('basketball');
    case 'tennis':
      return s.includes('tennis') || s.includes('quần vợt');
    default:
      return s.includes(selectedSport.toLowerCase());
  }
}

/**
 * Pure function to filter clubs based on search query and criteria.
 */
export function filterClubs(
  clubs: Club[],
  appliedFilters: ClubFilterState,
  searchQuery: string = '',
  joinedIds: (string | number)[] = []
): Club[] {
  const normalizedQuery = searchQuery.trim().toLowerCase().normalize('NFC');

  return clubs.filter((club) => {
    // 0. Exclude already joined clubs in explore view
    if (joinedIds.length > 0 && joinedIds.includes(club.id)) {
      return false;
    }

    // 1. Text Search Filter (name, sport, description, area, creator)
    if (normalizedQuery) {
      const name = (club.name || '').toLowerCase().normalize('NFC');
      const sport = (club.sport || '').toLowerCase().normalize('NFC');
      const desc = (club.description || '').toLowerCase().normalize('NFC');
      const area = (club.area || '').toLowerCase().normalize('NFC');
      const creator = (club.creatorName || '').toLowerCase().normalize('NFC');

      const matchesSearch =
        name.includes(normalizedQuery) ||
        sport.includes(normalizedQuery) ||
        desc.includes(normalizedQuery) ||
        area.includes(normalizedQuery) ||
        creator.includes(normalizedQuery);

      if (!matchesSearch) {
        return false;
      }
    }

    // 2. Sport Filter
    if (!matchesSport(club.sport, appliedFilters.sport)) {
      return false;
    }

    // 3. Member Count Filter
    if (appliedFilters.memberCount !== 'all') {
      const mems = club.members || 0;
      const maxMems = club.maxMembers || 30;

      if (appliedFilters.memberCount === 'under10' && mems >= 10) return false;
      if (appliedFilters.memberCount === '10to25' && (mems < 10 || mems > 25)) return false;
      if (appliedFilters.memberCount === 'above25' && mems <= 25) return false;
      if (appliedFilters.memberCount === 'hasSlots' && mems >= maxMems) return false;
    }

    // 4. ELO Range Filter
    if (appliedFilters.eloRange !== 'all') {
      const elo = club.averageElo || 1200;

      if (appliedFilters.eloRange === 'beginner' && elo >= 1200) return false;
      if (appliedFilters.eloRange === 'intermediate' && (elo < 1200 || elo > 1400)) return false;
      if (appliedFilters.eloRange === 'advanced' && elo <= 1400) return false;
    }

    // 5. Province & Ward / District Filter
    if (!matchesProvince(club.area || '', appliedFilters.province)) {
      return false;
    }

    if (!matchesWard(club.area || '', appliedFilters.ward)) {
      return false;
    }

    // 6. Privacy Filter
    if (appliedFilters.privacy !== 'all') {
      if (appliedFilters.privacy === 'public' && club.isPrivate) return false;
      if (appliedFilters.privacy === 'private' && !club.isPrivate) return false;
    }

    return true;
  });
}
