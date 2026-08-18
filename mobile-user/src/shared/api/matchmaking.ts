import { apiFetch } from './apiClient';
import {
  MatchRoomVM,
  ClubSummaryVM,
  BookingSummaryVM,
  JoinRequestVM,
  MatchmakingFilterState,
  MatchmakingSortOption,
  RankingCalculationPreview,
  MatchType,
} from '../../entities/match/model/match.types';

export class MatchmakingApiRepository {

  /**
   * Lấy danh sách các bài đăng ghép trận từ Backend
   */
  static async listRooms(
    filters?: MatchmakingFilterState,
    sortOption: MatchmakingSortOption = 'BALANCE_FIRST'
  ): Promise<MatchRoomVM[]> {
    const params = new URLSearchParams();
    if (filters?.sportId) params.append('sportId', filters.sportId);
    if (filters?.matchType && filters.matchType !== 'ALL') params.append('matchType', filters.matchType);
    if (filters?.timeFilter) params.append('timeFilter', filters.timeFilter);
    if (filters?.levelFilter) params.append('levelFilter', filters.levelFilter);
    if (sortOption) params.append('sort', sortOption);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<MatchRoomVM[]>(`/matchmaking/rooms${queryString}`, { method: 'GET' }, true);
  }

  /**
   * Lấy chi tiết phòng ghép trận
   */
  static async getRoom(id: string): Promise<MatchRoomVM> {
    return apiFetch<MatchRoomVM>(`/matchmaking/rooms/${id}`, { method: 'GET' }, true);
  }

  /**
   * Lấy danh sách CLB của tôi đủ điều kiện
   */
  static async getEligibleClubs(sportId?: string): Promise<ClubSummaryVM[]> {
    const params = sportId ? `?sportId=${sportId}` : '';
    const clubs = await apiFetch<any[]>(`/clubs/my${params}`, { method: 'GET' }, true);
    return (clubs || []).map((c) => ({
      id: String(c.id),
      name: c.name,
      sportId: c.sport ? String(c.sport.id) : '1',
      sportName: c.sport ? c.sport.name : 'Bóng đá',
      logoUrl: c.avatarImage,
      activeMemberCount: c.activeMemberCount || c.memberCount || 10,
      isEligibleForMatchmaking: (c.activeMemberCount || c.memberCount || 10) >= 8,
      clubElo: c.elo || 1000,
      levelLabel: c.levelLabel || 'TB',
      crp: c.crp || 0,
      rankingPosition: c.rankingPosition,
    }));
  }

  /**
   * Lấy danh sách booking đã thanh toán của tôi
   */
  static async getPaidBookings(sportId?: string): Promise<BookingSummaryVM[]> {
    const bookings = await apiFetch<any[]>(`/bookings/my`, { method: 'GET' }, true);
    return (bookings || [])
      .filter((b) => b.status === 'CONFIRMED')
      .map((b) => {
        const detail = b.details && b.details.length > 0 ? b.details[0] : null;
        return {
          id: String(b.id),
          facilityName: b.venue ? b.venue.name : 'Sân thể thao',
          courtName: detail && detail.court ? detail.court.name : 'Sân đấu',
          sportId: b.venue && b.venue.sport ? String(b.venue.sport.id) : '1',
          sportName: b.venue && b.venue.sport ? b.venue.sport.name : 'Bóng đá',
          date: detail ? detail.bookingDate : '',
          startTime: detail ? detail.startTime : '',
          endTime: detail ? detail.endTime : '',
          totalPrice: b.finalPrice || b.totalPrice || 0,
          isPaid: b.status === 'CONFIRMED',
          format: 'Sân tiêu chuẩn',
          address: b.venue ? (b.venue.addressDetail || b.venue.location || '') : '',
        };
      });
  }

  /**
   * Tạo bài đăng ghép trận mới
   */
  static async createRoom(input: {
    bookingId: string;
    hostClubId: string;
    matchType: MatchType;
    hostSharePercent: number;
    desiredLevels: string[];
    note?: string;
  }): Promise<MatchRoomVM> {
    return apiFetch<MatchRoomVM>(
      `/matchmaking/rooms`,
      {
        method: 'POST',
        body: JSON.stringify({
          bookingId: input.bookingId,
          hostClubId: Number(input.hostClubId),
          matchType: input.matchType,
          hostSharePercent: input.hostSharePercent,
          desiredLevels: input.desiredLevels,
          note: input.note,
        }),
      },
      true
    );
  }

  /**
   * Gửi yêu cầu xin tham gia ghép trận
   */
  static async createJoinRequest(roomId: string, applicantClubId: string, note?: string): Promise<JoinRequestVM> {
    return apiFetch<JoinRequestVM>(
      `/matchmaking/rooms/${roomId}/join-requests`,
      {
        method: 'POST',
        body: JSON.stringify({
          applicantClubId: Number(applicantClubId),
          note,
        }),
      },
      true
    );
  }

  /**
   * Chấp nhận đối thủ
   */
  static async acceptJoinRequest(roomId: string, requestId: string): Promise<MatchRoomVM> {
    return apiFetch<MatchRoomVM>(
      `/matchmaking/join-requests/${requestId}/accept`,
      { method: 'POST' },
      true
    );
  }

  /**
   * Nhập tỷ số (Host A)
   */
  static async submitScore(
    matchId: string,
    hostScore: number | string,
    guestScore: number | string,
    details?: string
  ): Promise<MatchRoomVM> {
    return apiFetch<MatchRoomVM>(
      `/matchmaking/matches/${matchId}/score`,
      {
        method: 'POST',
        body: JSON.stringify({
          hostScore: String(hostScore),
          guestScore: String(guestScore),
          rawScoreDetails: details,
        }),
      },
      true
    );
  }

  /**
   * Xác nhận tỷ số (Guest B)
   */
  static async confirmScore(matchId: string): Promise<MatchRoomVM> {
    return apiFetch<MatchRoomVM>(
      `/matchmaking/matches/${matchId}/confirm-score`,
      { method: 'POST' },
      true
    );
  }

  /**
   * Xem trước kết quả tính điểm CRP
   */
  static async getRankingPreview(
    matchId: string,
    hostScore: string,
    guestScore: string,
    details?: string
  ): Promise<RankingCalculationPreview> {
    const params = new URLSearchParams({
      hostScore,
      guestScore,
      ...(details ? { rawScoreDetails: details } : {}),
    });
    return apiFetch<RankingCalculationPreview>(
      `/matchmaking/matches/${matchId}/preview-ranking?${params.toString()}`,
      { method: 'GET' },
      true
    );
  }
}
