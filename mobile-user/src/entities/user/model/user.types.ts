// Backend Gender Enum matching User.java
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

// Backend Role Enum matching User.java
export type Role = 'USER' | 'OWNER' | 'ADMIN';

// Backend User Status matching User.java
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

/**
 * Backend User DTO Representation (Matches User.java entity)
 * Note: Sensitive fields like email, phoneNumber, password are kept internal
 * and MUST NOT be exposed on public profile views.
 */
export interface BackendUserDTO {
  id: string | number;
  fullName: string;
  avatarUrl?: string;
  gender?: Gender;
  dateOfBirth?: string; // ISO string e.g. "1998-05-15"
  height?: number; // cm
  weight?: number; // kg
  role: Role;
  status: UserStatus;
  createdAt?: string;
  privateMode?: boolean;
}

/**
 * Skill tag with credit counts (crd)
 */
export interface SkillTag {
  id: string;
  label: string; // e.g. "Driving", "Leadership", "Defense"
  credits: number; // e.g. 29
}

/**
 * Match Round Item for Matches Tab (Lịch sử trận đấu)
 */
export interface MatchRoundItem {
  id: string;
  roundName: string; // e.g. "Round 1", "Round 3"
  team1Avatars: string[];
  team1Names: string; // e.g. "Zack, Kay Bee"
  team2Avatars: string[];
  team2Names: string; // e.g. "Hoang Anh, Quan Luu"
  score: string; // e.g. "6-15", "11-6"
  isWinner?: boolean;
}

/**
 * Match Tournament / Battle Group
 */
export interface MatchBattleGroup {
  id: string;
  title: string; // e.g. "Battle 🏆 MLP| Dink Cao vs 👹 Máu Quỷ MQSC"
  date: string; // e.g. "Apr 16"
  isDuprSubmitted?: boolean;
  rounds: MatchRoundItem[];
}

/**
 * Sports Profile Card Item (Hồ sơ thể thao bộ môn - Khớp 100% Ảnh tham khảo)
 */
export interface SportProfileItem {
  id: string;
  sportName: string; // e.g. "Pickleball", "Bóng đá", "Cầu lông"
  icon: string; // Ionicons or custom indicator name
  matchesCount: number; // e.g. 35
  activitiesCount: number; // e.g. 90
  awardsCount: number; // e.g. 0
  duprSingles?: number; // e.g. 3.925
  duprSinglesReliable?: string; // e.g. "1% Reliable"
  duprDoubles?: number; // e.g. 3.41
  duprDoublesReliable?: string; // e.g. "6% Reliable"
  ratingType?: string; // e.g. "SELF RATING", "TRÌNH (TỰ ĐÁNH GIÁ)"
  ratingValue?: string | number; // e.g. "2.75", "Khá"
  position?: string; // e.g. "Trung vệ, Tiền đạo"
  skillTags?: SkillTag[]; // Yellow skill pills: Driving, Leadership, Defense, Dinking...
  sportsmanshipCredits?: SkillTag[]; // Hosting, Sportsmanship, Mentoring, Heart
  battles?: MatchBattleGroup[]; // Lịch sử đấu cho Tab Matches
}

/**
 * Joined Club Item (Câu lạc bộ đã tham gia)
 */
export interface JoinedClubItem {
  id: string;
  name: string; // e.g. "CLB Pickleball Cầu Giấy", "FC Phủi Hà Nội"
  logoUrl: string;
  sportName: string; // e.g. "Pickleball", "Bóng đá", "Cầu lông"
  roleInClub: string; // e.g. "Thành viên", "Đội trưởng", "Ban quản trị"
  memberCount: number; // e.g. 128
  joinedDate?: string; // e.g. "Tháng 3/2024"
}

/**
 * Full Public User Profile
 */
export interface PublicUserProfile extends BackendUserDTO {
  username: string; // e.g. "@quanluu08"
  isVerified?: boolean; // Sporta Verified Blue Badge
  sportaPoints?: string; // e.g. "5p"
  bio?: string; // e.g. "Content Lead @reclubapp"
  friendStatus: 'none' | 'pending' | 'friend';
  sportsProfiles: SportProfileItem[];
  joinedClubs?: JoinedClubItem[];
}
