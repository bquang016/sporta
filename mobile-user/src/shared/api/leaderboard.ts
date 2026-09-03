import { apiFetch } from './apiClient';

export interface LeaderboardItem {
  rank: number;
  clubId: number;
  clubName: string;
  avatarUrl?: string;
  sportId?: number;
  sportName?: string;
  area?: string;
  elo?: number;
  levelLabel?: string;
  crp: number;
  rankedWins: number;
  finalMatches: number;
  winRate: number;
  streak?: string;
  tier?: string;
  isUserClub?: boolean;
  activeMemberCount?: number;
}

export interface SeasonTierReward {
  tier: string;
  title: string;
  badge: string;
  cashReward: string;
  courtTickets: string;
  memberVoucher: string;
  spotlight: string;
}

export interface OverallChampionReward {
  title: string;
  badge: string;
  cashReward: string;
  courtTickets: string;
  memberVoucher: string;
  spotlight: string;
}

export interface SportRewardDetail {
  sportName: string;
  icon: string;
  firstPrize: string;
  secondPrize: string;
  thirdPrize: string;
  specialPerk: string;
}

export interface SeasonRewardsInfo {
  seasonName: string;
  endDate: string;
  daysRemaining: number;
  totalPrizePool: string;
  overallChampion?: OverallChampionReward;
  tiers: SeasonTierReward[];
  sportSpecificDetails?: Record<string, SportRewardDetail>;
  eligibilityRules?: string[];
}

export const getLeaderboardApi = async (
  sportId?: number,
  area?: string,
  page: number = 0,
  size: number = 50
): Promise<LeaderboardItem[]> => {
  let url = `/leaderboard?page=${page}&size=${size}`;
  if (sportId) url += `&sportId=${sportId}`;
  if (area && area.trim()) url += `&area=${encodeURIComponent(area.trim())}`;
  return apiFetch<LeaderboardItem[]>(url, { method: 'GET' }, false);
};

export const getSeasonRewardsApi = async (): Promise<SeasonRewardsInfo> => {
  return apiFetch<SeasonRewardsInfo>('/leaderboard/rewards', { method: 'GET' }, false);
};
