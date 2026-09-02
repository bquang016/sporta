export type MatchStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'MATCHED'
  | 'UPCOMING'
  | 'SCORE_PENDING'
  | 'SCORE_CONFIRMING'
  | 'RESULT_FINAL'
  | 'RESULT_OVERDUE'
  | 'DISPUTED'
  | 'DRAW_PROPOSED'
  | 'CANCELLED'
  | 'EXPIRED';

export type MatchType = 'FRIENDLY' | 'RANKED';

export type NormalizedOutcome = 'WIN_A' | 'WIN_B' | 'WIN_HOST' | 'WIN_GUEST' | 'DRAW';

export interface ClubSummaryVM {
  id: string;
  name: string;
  sportId: string;
  sportName: string;
  logoUrl?: string;
  avatarUrl?: string;
  activeMemberCount: number;
  isEligibleForMatchmaking: boolean; // >= 8 active members
  clubElo: number;
  levelLabel: string; // 'Yếu' | 'TBY' | 'TB' | 'TBK' | 'Khá'
  crp: number;
  rankingPosition?: number;
  userStatus?: string; // 'ADMIN' | 'SUB_LEADER' | 'MEMBER'
  isLeaderOrSubLeader?: boolean;
}

export interface BookingSummaryVM {
  id: string;
  facilityName: string;
  courtName: string;
  sportId: string;
  sportName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  isPaid: boolean;
  format: string; // e.g. "7v7", "5v5", "Đôi nam"
  address?: string;
}

export interface LineupMemberVM {
  userId: number;
  fullName: string;
  avatarUrl?: string;
  elo: number;
  role?: string;
  addedAt?: string;
}

export interface LineupVM {
  id: number;
  clubId: number;
  clubName: string;
  sourcePollId?: number;
  name: string;
  eloAvg: number;
  averageElo?: number;
  lineupType: 'INTERNAL_A' | 'INTERNAL_B' | 'MATCHMAKING';
  status: 'ACTIVE' | 'IN_MATCH' | 'COMPLETED' | 'DISBANDED';
  matchRoomId?: string;
  teamSide?: 'HOST' | 'GUEST';
  members: LineupMemberVM[];
  memberCount: number;
  createdAt?: string;
}

export interface PollOptionVM {
  id: number;
  label: string;
  isJoinOption: boolean;
  isDefault: boolean;
  displayOrder: number;
  voteCount: number;
  voters: {
    userId: number;
    fullName: string;
    avatarUrl?: string;
    elo: number;
    role?: string;
    votedAt?: string;
  }[];
}

export interface MatchPollVM {
  id: number;
  clubId: number;
  clubName: string;
  creatorId: number;
  creatorName: string;
  creatorAvatar?: string;
  title: string;
  pollType: 'INTERNAL' | 'MATCHMAKING';
  deadline?: string;
  maxPlayers?: number;
  minPlayers?: number;
  status: 'OPEN' | 'CLOSED' | 'TEAM_FORMED';
  options: PollOptionVM[];
  myVoteOptionId?: number;
  myVotedOptionIds?: number[];
  totalVotes: number;
  joinVotesCount: number;
  lineups: LineupVM[];
  canManage?: boolean;
  createdAt: string;
  closedAt?: string;
}

export interface JoinRequestVM {
  id: string;
  roomId: string;
  applicantClub: ClubSummaryVM;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'AUTO_CANCELLED_CONFLICT' | 'WITHDRAWN';
  createdAt: string;
  note?: string;
  lineup?: LineupVM;
}

export interface MatchPermissionsVM {
  canCreateRoom: boolean;
  canSuggest: boolean;
  canRequestJoin: boolean;
  canWithdrawRequest: boolean;
  canManageApplicants: boolean;
  canEditRoom: boolean;
  canCancelRoom: boolean;
  canEnterScore: boolean;
  canConfirmScore: boolean;
  canReport: boolean;
  canProposeDraw: boolean;
}

export interface ScoreSubmissionVM {
  matchId: string;
  hostScore: number | string;
  guestScore: number | string;
  rawScoreDetails?: string;
  submittedByClubId: string;
  submittedAt: string;
  normalizedOutcome: NormalizedOutcome;
}

export interface MatchResultVM {
  matchId: string;
  outcome: NormalizedOutcome;
  finalScoreText: string;
  hostCrpBefore: number;
  hostCrpDelta: number;
  hostCrpAfter: number;
  guestCrpBefore: number;
  guestCrpDelta: number;
  guestCrpAfter: number;
  explanation: string[];
  confirmedAt: string;
}

export interface MatchRoomVM {
  id: string;
  matchId?: string;
  booking: BookingSummaryVM;
  hostClub: ClubSummaryVM;
  guestClub?: ClubSummaryVM;
  matchType: MatchType;
  hostSharePercent: number; // e.g. 70
  guestSharePercent: number; // e.g. 30
  guestShareAmount: number; // e.g. 150000
  desiredLevels: string[]; // e.g. ["TB", "TBK"]
  note?: string;
  status: MatchStatus;
  applicants: JoinRequestVM[];
  myRequest?: JoinRequestVM;
  permissions: MatchPermissionsVM;
  createdAt: string;
  statusLabel?: string;
  cancellationReason?: string;
  balanceLabel?: string; // 'Cân kèo' | 'Chênh nhẹ' | 'Lệch trình'
  distanceKm?: number;
  scoreSubmission?: ScoreSubmissionVM;
  result?: MatchResultVM;
  hostLineup?: LineupVM;
  guestLineup?: LineupVM;
}

export interface RankingCalculationPreview {
  matchType: MatchType;
  hostClubElo: number;
  guestClubElo: number;
  balanceLabel: string;
  dominanceFactor?: number;
  upsetModifier?: number;
  hostCrpBefore: number;
  guestCrpBefore: number;
  hostCrpDelta: number;
  guestCrpDelta: number;
  hostCrpAfter: number;
  guestCrpAfter: number;
  explanation: string[];
}

export interface MatchmakingFilterState {
  sportId?: string;
  matchType?: 'ALL' | 'FRIENDLY' | 'RANKED';
  timeFilter?: 'ALL' | 'TODAY' | 'TOMORROW' | 'WEEKEND';
  distanceFilter?: 'ALL' | '1KM' | '3KM' | '5KM' | '10KM';
  levelFilter?: 'ALL' | 'Yếu' | 'TBY' | 'TB' | 'TBK' | 'Khá';
}

export type MatchmakingSortOption =
  | 'BALANCE_FIRST'
  | 'SOONEST'
  | 'NEAREST'
  | 'HIGHEST_CRP'
  | 'NEWEST';
