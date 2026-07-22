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

export const deletePollApi = async (pollId: number): Promise<void> => {
  return requestApi(`/clubs/polls/${pollId}`, { method: 'DELETE' });
};
