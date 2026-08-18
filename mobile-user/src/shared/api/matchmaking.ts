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

function parseFlexibleDate(dateStr: string, timeStr: string): Date | null {
  if (!dateStr || !timeStr) return null;
  try {
    const timeParts = timeStr.split(':');
    const hours = parseInt(timeParts[0], 10) || 0;
    const minutes = parseInt(timeParts[1], 10) || 0;

    const numbers = dateStr.match(/\d+/g);
    if (!numbers || numbers.length < 3) return null;

    let year = 0;
    let month = 0;
    let day = 0;

    if (numbers[0].length === 4) {
      // YYYY-MM-DD or YYYY/MM/DD
      year = parseInt(numbers[0], 10);
      month = parseInt(numbers[1], 10) - 1;
      day = parseInt(numbers[2], 10);
    } else if (numbers[2].length === 4) {
      // DD-MM-YYYY or DD/MM/YYYY
      day = parseInt(numbers[0], 10);
      month = parseInt(numbers[1], 10) - 1;
      year = parseInt(numbers[2], 10);
    } else {
      return null;
    }

    return new Date(year, month, day, hours, minutes, 0, 0);
  } catch {
    return null;
  }
}

function isBookingCutoffValid(bookingDateStr: string, startTimeStr: string, cutoffMinutes: number = 60): boolean {
  const bookingStart = parseFlexibleDate(bookingDateStr, startTimeStr);
  if (!bookingStart) return true;

  const now = new Date();
  const cutoffThreshold = new Date(now.getTime() + cutoffMinutes * 60 * 1000);
  return bookingStart.getTime() >= cutoffThreshold.getTime();
}

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
   * Lấy danh sách các trận đấu của tôi (sắp đấu, chờ xác nhận tỷ số, đã hoàn thành)
   */
  static async listMyMatches(): Promise<MatchRoomVM[]> {
    return apiFetch<MatchRoomVM[]>(`/matchmaking/my-matches`, { method: 'GET' }, true);
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
    return (clubs || []).map((c) => {
      const count = c.members ?? c.activeMemberCount ?? c.memberCount ?? 1;
      return {
        id: String(c.id),
        name: c.name,
        sportId: c.sport ? String(c.sport.id) : '1',
        sportName: c.sport ? c.sport.name : 'Bóng đá',
        logoUrl: c.avatarImage,
        activeMemberCount: count,
        isEligibleForMatchmaking: count >= 1,
        clubElo: c.elo || 1000,
        levelLabel: c.levelLabel || 'TB',
        crp: c.crp || 0,
        rankingPosition: c.rankingPosition,
      };
    });
  }

  /**
   * Lấy danh sách booking đã thanh toán của tôi
   */
  static async getPaidBookings(sportId?: string): Promise<BookingSummaryVM[]> {
    const bookings = await apiFetch<any[]>(`/bookings/my`, { method: 'GET' }, true);
    
    let usedBookingIds = new Set<string>();
    try {
      const myMatches = await this.getMyMatches();
      (myMatches || []).forEach((m) => {
        if (m.booking && m.booking.id) {
          usedBookingIds.add(String(m.booking.id));
        }
      });
    } catch {
      // Ignore error
    }

    return (bookings || [])
      .filter((b) => {
        if (b.status !== 'CONFIRMED') return false;
        if (usedBookingIds.has(String(b.id))) return false;
        const details = b.details;
        if (!details || details.length === 0) return false;
        const sortedStartTimes = details.map((d: any) => String(d.startTime)).sort();
        const minStartTime = sortedStartTimes[0];
        return isBookingCutoffValid(String(details[0].bookingDate), minStartTime, 60);
      })
      .map((b) => {
        const details = b.details || [];
        const sortedStartTimes = details.map((d: any) => String(d.startTime)).sort();
        const sortedEndTimes = details.map((d: any) => String(d.endTime)).sort();

        const minStartTime = sortedStartTimes.length > 0 ? sortedStartTimes[0].substring(0, 5) : '08:00';
        const maxEndTime = sortedEndTimes.length > 0 ? sortedEndTimes[sortedEndTimes.length - 1].substring(0, 5) : '10:00';
        const firstDetail = details[0] || {};

        return {
          id: String(b.id),
          facilityName: b.venueName || (b.venue ? b.venue.name : 'Sân thể thao'),
          courtName: firstDetail.courtName || (firstDetail.court ? firstDetail.court.name : 'Sân đấu'),
          sportId: b.sportId ? String(b.sportId) : '1',
          sportName: b.sportName || 'Thể thao',
          date: firstDetail.bookingDate ? String(firstDetail.bookingDate) : '',
          startTime: minStartTime,
          endTime: maxEndTime,
          totalPrice: b.finalPrice || b.totalPrice || 0,
          isPaid: b.status === 'CONFIRMED',
          format: 'Sân tiêu chuẩn',
          address: b.venueLocation || (b.venue ? (b.venue.addressDetail || b.venue.location || '') : ''),
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
   * Từ chối đối thủ
   */
  static async rejectJoinRequest(requestId: string, reason?: string): Promise<void> {
    return apiFetch<void>(
      `/matchmaking/join-requests/${requestId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      },
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
