import { requestApi } from './apiClient';

export interface ClubCreatePayload {
  name: string;
  description: string;
  sportId: number;
  maxMembers: number;
  isPrivate: boolean;
  coverImage?: string;
  avatarImage?: string;
  area: string;
  activityLevel: string;
}

export interface ClubUpdatePayload {
  name?: string;
  description?: string;
  sportId?: number;
  maxMembers?: number;
  isPrivate?: boolean;
  coverImage?: string;
  avatarImage?: string;
  area?: string;
  activityLevel?: string;
}

export const getAvailableClubsApi = async (sportId?: number, query?: string): Promise<any[]> => {
  let url = '/clubs';
  const params: string[] = [];
  if (sportId !== undefined) params.push(`sportId=${sportId}`);
  if (query) params.push(`query=${encodeURIComponent(query)}`);
  if (params.length > 0) url += `?${params.join('&')}`;

  return requestApi(url, { method: 'GET' });
};

export const getJoinedClubsApi = async (sportId?: number, query?: string): Promise<any[]> => {
  let url = '/clubs/my';
  const params: string[] = [];
  if (sportId !== undefined) params.push(`sportId=${sportId}`);
  if (query) params.push(`query=${encodeURIComponent(query)}`);
  if (params.length > 0) url += `?${params.join('&')}`;

  return requestApi(url, { method: 'GET' });
};

export const getClubByIdApi = async (id: number): Promise<any> => {
  return requestApi(`/clubs/${id}`, { method: 'GET' });
};

export const createClubApi = async (data: ClubCreatePayload): Promise<any> => {
  return requestApi('/clubs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateClubApi = async (id: number, data: ClubUpdatePayload): Promise<any> => {
  return requestApi(`/clubs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteClubApi = async (id: number): Promise<void> => {
  return requestApi(`/clubs/${id}`, { method: 'DELETE' });
};

export const getClubMembersApi = async (id: number): Promise<any[]> => {
  return requestApi(`/clubs/${id}/members`, { method: 'GET' });
};

export const joinClubApi = async (id: number): Promise<any> => {
  return requestApi(`/clubs/${id}/join`, { method: 'POST' });
};

export const leaveClubApi = async (id: number): Promise<void> => {
  return requestApi(`/clubs/${id}/leave`, { method: 'POST' });
};

export const approveMemberApi = async (clubId: number, userId: number): Promise<any> => {
  return requestApi(`/clubs/${clubId}/members/${userId}/approve`, { method: 'POST' });
};

export const rejectMemberApi = async (clubId: number, userId: number): Promise<any> => {
  return requestApi(`/clubs/${clubId}/members/${userId}/reject`, { method: 'POST' });
};

export const removeMemberApi = async (clubId: number, userId: number): Promise<void> => {
  return requestApi(`/clubs/${clubId}/members/${userId}`, { method: 'DELETE' });
};

export const transferLeadershipApi = async (clubId: number, userId: number): Promise<void> => {
  return requestApi(`/clubs/${clubId}/members/${userId}/transfer`, { method: 'POST' });
};

export const assignSubLeaderApi = async (clubId: number, userId: number): Promise<void> => {
  return requestApi(`/clubs/${clubId}/members/${userId}/assign-subleader`, { method: 'POST' });
};

export const demoteSubLeaderApi = async (clubId: number, userId: number): Promise<void> => {
  return requestApi(`/clubs/${clubId}/members/${userId}/demote-subleader`, { method: 'POST' });
};

export const getActivePollApi = async (clubId: number): Promise<any> => {
  return requestApi(`/clubs/${clubId}/polls/active`, { method: 'GET' });
};

export const createPollApi = async (clubId: number, data: { title: string; closeTime: string }): Promise<any> => {
  return requestApi(`/clubs/${clubId}/polls`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const votePollApi = async (pollId: number, option: 'join' | 'absent'): Promise<any> => {
  return requestApi(`/clubs/polls/${pollId}/vote?option=${option}`, { method: 'POST' });
};

export const closePollApi = async (pollId: number): Promise<any> => {
  return requestApi(`/clubs/polls/${pollId}/close`, { method: 'POST' });
};

export const reopenPollApi = async (pollId: number): Promise<any> => {
  return requestApi(`/clubs/polls/${pollId}/reopen`, { method: 'POST' });
};

export const saveMatchmadeTeamsApi = async (pollId: number, teams: { teamA: string[]; teamB: string[]; teamAPlayers?: any[]; teamBPlayers?: any[]; teamATotalElo?: number; teamBTotalElo?: number }): Promise<any> => {
  return requestApi(`/clubs/polls/${pollId}/matchmake`, {
    method: 'POST',
    body: JSON.stringify(teams),
  });
};

export const deletePollApi = async (pollId: number): Promise<void> => {
  return requestApi(`/clubs/polls/${pollId}`, { method: 'DELETE' });
};

export interface ClubMatchPayload {
  opponentName: string;
  opponentAvatar?: string;
  date: string; // YYYY-MM-DD
  ourScore: number;
  opponentScore: number;
  result: 'WIN' | 'LOSE' | 'DRAW';
  location?: string;
}

export const getClubMatchesApi = async (clubId: number): Promise<any[]> => {
  return requestApi(`/clubs/${clubId}/matches`, { method: 'GET' });
};

export const addClubMatchApi = async (clubId: number, data: ClubMatchPayload): Promise<any> => {
  return requestApi(`/clubs/${clubId}/matches`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// ================= MATCH POLL API (v2.0) =================
export interface CreateMatchPollPayload {
  title: string;
  pollType: 'INTERNAL' | 'MATCHMAKING';
  deadline?: string;
  maxPlayers?: number;
  minPlayers?: number;
  customOptions?: string[];
}

export const getClubMatchPollsApi = async (clubId: number): Promise<any[]> => {
  return requestApi(`/clubs/${clubId}/match-polls`, { method: 'GET' });
};

export const getMatchPollDetailApi = async (pollId: number): Promise<any> => {
  return requestApi(`/clubs/match-polls/${pollId}`, { method: 'GET' });
};

export const createMatchPollApi = async (clubId: number, payload: CreateMatchPollPayload): Promise<any> => {
  return requestApi(`/clubs/${clubId}/match-polls`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const voteMatchPollApi = async (pollId: number, optionId: number): Promise<any> => {
  return requestApi(`/clubs/match-polls/${pollId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ optionId }),
  });
};

export const closeMatchPollApi = async (pollId: number): Promise<any> => {
  return requestApi(`/clubs/match-polls/${pollId}/close`, { method: 'POST' });
};

export const splitInternalTeamsApi = async (pollId: number): Promise<any> => {
  return requestApi(`/clubs/match-polls/${pollId}/split-teams`, { method: 'POST' });
};

export const formMatchmakingLineupApi = async (pollId: number): Promise<any> => {
  return requestApi(`/clubs/match-polls/${pollId}/form-gt`, { method: 'POST' });
};

export const deleteMatchPollApi = async (pollId: number): Promise<void> => {
  return requestApi(`/clubs/match-polls/${pollId}`, { method: 'DELETE' });
};

export const addCustomPollOptionApi = async (pollId: number, label: string): Promise<any> => {
  return requestApi(`/clubs/match-polls/${pollId}/options`, {
    method: 'POST',
    body: JSON.stringify({ label }),
  });
};

// ================= LINEUP API (v2.0) =================
export const getClubLineupsApi = async (clubId: number): Promise<any[]> => {
  return requestApi(`/clubs/${clubId}/lineups`, { method: 'GET' });
};

export const getAvailableLineupsApi = async (clubId: number, sportId?: number): Promise<any[]> => {
  const url = sportId !== undefined ? `/clubs/${clubId}/lineups/available?sportId=${sportId}` : `/clubs/${clubId}/lineups/available`;
  return requestApi(url, { method: 'GET' });
};

export const getLineupDetailApi = async (lineupId: number): Promise<any> => {
  return requestApi(`/clubs/lineups/${lineupId}`, { method: 'GET' });
};

export const createLineupApi = async (clubId: number, name: string, lineupType: string = 'MATCHMAKING'): Promise<any> => {
  return requestApi(`/clubs/${clubId}/lineups`, {
    method: 'POST',
    body: JSON.stringify({ name, lineupType }),
  });
};

export const addLineupMemberApi = async (lineupId: number, userId: number): Promise<any> => {
  return requestApi(`/clubs/lineups/${lineupId}/members/${userId}`, { method: 'POST' });
};

export const removeLineupMemberApi = async (lineupId: number, userId: number): Promise<any> => {
  return requestApi(`/clubs/lineups/${lineupId}/members/${userId}`, { method: 'DELETE' });
};

export const swapLineupMembersApi = async (data: { sourceLineupId: number; targetLineupId: number; userIdA: number; userIdB: number }): Promise<void> => {
  return requestApi(`/clubs/lineups/swap`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const disbandLineupApi = async (lineupId: number): Promise<void> => {
  return requestApi(`/clubs/lineups/${lineupId}`, { method: 'DELETE' });
};


