import {
  MatchRoomVM,
  ClubSummaryVM,
  BookingSummaryVM,
  JoinRequestVM,
  MatchmakingFilterState,
  MatchmakingSortOption,
  RankingCalculationPreview,
  ScoreSubmissionVM,
  MatchResultVM,
  NormalizedOutcome,
  MatchType,
} from '../../../entities/match/model/match.types';

// Initial Mock Clubs
export const MOCK_CLUBS: ClubSummaryVM[] = [
  {
    id: 'club-alpha',
    name: 'CLB Alpha FC',
    sportId: 'football',
    sportName: 'Bóng đá',
    activeMemberCount: 12,
    isEligibleForMatchmaking: true,
    clubElo: 1824,
    levelLabel: 'Bán chuyên',
    crp: 286,
    rankingPosition: 14,
  },
  {
    id: 'club-beta',
    name: 'CLB Beta United',
    sportId: 'football',
    sportName: 'Bóng đá',
    activeMemberCount: 10,
    isEligibleForMatchmaking: true,
    clubElo: 1760,
    levelLabel: 'Trung bình - Khá',
    crp: 142,
    rankingPosition: 28,
  },
  {
    id: 'club-gamma',
    name: 'CLB Gamma Phong Độ',
    sportId: 'football',
    sportName: 'Bóng đá',
    activeMemberCount: 6, // Ineligible (< 8 members)
    isEligibleForMatchmaking: false,
    clubElo: 1520,
    levelLabel: 'Trung bình - Khá',
    crp: 45,
    rankingPosition: 62,
  },
  {
    id: 'club-smashers',
    name: 'CLB Cầu Lông Sài Gòn',
    sportId: 'badminton',
    sportName: 'Cầu lông',
    activeMemberCount: 14,
    isEligibleForMatchmaking: true,
    clubElo: 1950,
    levelLabel: 'Bán chuyên',
    crp: 410,
    rankingPosition: 5,
  },
  {
    id: 'club-hoops',
    name: 'CLB Basketball Ballers',
    sportId: 'basketball',
    sportName: 'Bóng rổ',
    activeMemberCount: 9,
    isEligibleForMatchmaking: true,
    clubElo: 1680,
    levelLabel: 'Trung bình - Khá',
    crp: 190,
    rankingPosition: 20,
  },
];

// Initial Mock Paid Bookings (All isPaid: true)
export const MOCK_PAID_BOOKINGS: BookingSummaryVM[] = [
  {
    id: 'booking-1',
    facilityName: 'Sân Bóng Athena Mỹ Đình',
    courtName: 'Sân 1 (7v7)',
    sportId: 'football',
    sportName: 'Bóng đá',
    date: 'T7, 22/08/2026',
    startTime: '18:00',
    endTime: '19:30',
    totalPrice: 500000,
    isPaid: true,
    format: '7v7',
    address: 'Số 15 Lê Đức Thọ, Nam Từ Liêm, Hà Nội',
  },
  {
    id: 'booking-2',
    facilityName: 'Sân Cầu Lông Đại Học CMC',
    courtName: 'Thảm 3 (Đôi nam)',
    sportId: 'badminton',
    sportName: 'Cầu lông',
    date: 'CN, 23/08/2026',
    startTime: '17:00',
    endTime: '19:00',
    totalPrice: 240000,
    isPaid: true,
    format: 'Đôi nam',
    address: '84 Nguyễn Xí, Bình Thạnh, TP.HCM',
  },
  {
    id: 'booking-3',
    facilityName: 'Hoop Heaven Park Center',
    courtName: 'Sân Indoor 2',
    sportId: 'basketball',
    sportName: 'Bóng rổ',
    date: 'T2, 24/08/2026',
    startTime: '20:00',
    endTime: '21:30',
    totalPrice: 400000,
    isPaid: true,
    format: '5v5',
    address: '22 Tân Kỳ Tân Quý, Tân Bình, TP.HCM',
  },
];

// Initial Match Rooms State
let mockMatchRooms: MatchRoomVM[] = [
  {
    id: 'room-101',
    booking: MOCK_PAID_BOOKINGS[0],
    hostClub: MOCK_CLUBS[0], // Alpha (1824 Elo)
    matchType: 'RANKED',
    hostSharePercent: 70,
    guestSharePercent: 30,
    guestShareAmount: 150000,
    desiredLevels: ['TBY', 'TB', 'TBK'],
    note: 'Tìm CLB đá giao hữu cọ xát văn minh, đúng giờ. Đội thua trả 30% tiền sân.',
    status: 'OPEN',
    applicants: [
      {
        id: 'req-1',
        roomId: 'room-101',
        applicantClub: MOCK_CLUBS[1], // Beta (1760 Elo)
        status: 'PENDING',
        createdAt: '10 phút trước',
        note: 'CLB Beta United xin ghép kèo. Đội đã sẵn sàng!',
      },
    ],
    permissions: {
      canCreateRoom: true,
      canSuggest: true,
      canRequestJoin: true,
      canWithdrawRequest: false,
      canManageApplicants: true,
      canEditRoom: true,
      canCancelRoom: true,
      canEnterScore: false,
      canConfirmScore: false,
      canReport: false,
      canProposeDraw: false,
    },
    createdAt: '30 phút trước',
    balanceLabel: 'Cân kèo',
    distanceKm: 2.3,
  },
  {
    id: 'room-102',
    booking: MOCK_PAID_BOOKINGS[1],
    hostClub: MOCK_CLUBS[3], // Smashers (1950 Elo)
    matchType: 'FRIENDLY',
    hostSharePercent: 50,
    guestSharePercent: 50,
    guestShareAmount: 120000,
    desiredLevels: ['TBK', 'Khá'],
    note: 'Kèo cầu lông đôi nam vui vẻ, chia đôi tiền sân.',
    status: 'OPEN',
    applicants: [],
    permissions: {
      canCreateRoom: true,
      canSuggest: true,
      canRequestJoin: true,
      canWithdrawRequest: false,
      canManageApplicants: false,
      canEditRoom: false,
      canCancelRoom: false,
      canEnterScore: false,
      canConfirmScore: false,
      canReport: false,
      canProposeDraw: false,
    },
    createdAt: '1 giờ trước',
    balanceLabel: 'Chênh nhẹ',
    distanceKm: 4.1,
  },
  {
    id: 'room-103',
    booking: MOCK_PAID_BOOKINGS[2],
    hostClub: MOCK_CLUBS[4], // Ballers
    guestClub: MOCK_CLUBS[1], // Beta
    matchType: 'RANKED',
    hostSharePercent: 60,
    guestSharePercent: 40,
    guestShareAmount: 160000,
    desiredLevels: ['TB', 'TBK'],
    status: 'MATCHED',
    applicants: [],
    permissions: {
      canCreateRoom: true,
      canSuggest: false,
      canRequestJoin: false,
      canWithdrawRequest: false,
      canManageApplicants: true,
      canEditRoom: false,
      canCancelRoom: false,
      canEnterScore: true,
      canConfirmScore: true,
      canReport: true,
      canProposeDraw: true,
    },
    createdAt: '2 giờ trước',
    balanceLabel: 'Cân kèo',
    distanceKm: 1.8,
  },
];

export class MockMatchmakingRepository {
  static async listRooms(
    filters?: MatchmakingFilterState,
    sortOption: MatchmakingSortOption = 'BALANCE_FIRST'
  ): Promise<MatchRoomVM[]> {
    await new Promise((resolve) => setTimeout(resolve, 150)); // Simulated network latency

    let result = [...mockMatchRooms];

    if (filters?.sportId) {
      result = result.filter((r) => r.booking.sportId === filters.sportId);
    }
    if (filters?.matchType && filters.matchType !== 'ALL') {
      result = result.filter((r) => r.matchType === filters.matchType);
    }
    if (filters?.levelFilter && filters.levelFilter !== 'ALL') {
      result = result.filter(
        (r) =>
          r.hostClub.levelLabel === filters.levelFilter ||
          r.desiredLevels.includes(filters.levelFilter as string)
      );
    }

    // Sort logic
    if (sortOption === 'BALANCE_FIRST') {
      const rankMap: Record<string, number> = { 'Cân kèo': 1, 'Chênh nhẹ': 2, 'Lệch trình': 3 };
      result.sort((a, b) => (rankMap[a.balanceLabel || ''] || 99) - (rankMap[b.balanceLabel || ''] || 99));
    } else if (sortOption === 'HIGHEST_CRP') {
      result.sort((a, b) => b.hostClub.crp - a.hostClub.crp);
    } else if (sortOption === 'NEAREST') {
      result.sort((a, b) => (a.distanceKm || 99) - (b.distanceKm || 99));
    }

    return result;
  }

  static async getRoom(id: string): Promise<MatchRoomVM | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockMatchRooms.find((r) => r.id === id);
  }

  static async getEligibleClubs(sportId?: string): Promise<ClubSummaryVM[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (!sportId) return MOCK_CLUBS;
    return MOCK_CLUBS.filter((c) => c.sportId === sportId);
  }

  static async getPaidBookings(sportId?: string): Promise<BookingSummaryVM[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (!sportId) return MOCK_PAID_BOOKINGS;
    return MOCK_PAID_BOOKINGS.filter((b) => b.sportId === sportId);
  }

  static async createRoom(input: {
    bookingId: string;
    hostClubId: string;
    matchType: MatchType;
    hostSharePercent: number;
    desiredLevels: string[];
    note?: string;
  }): Promise<MatchRoomVM> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const booking = MOCK_PAID_BOOKINGS.find((b) => b.id === input.bookingId) || MOCK_PAID_BOOKINGS[0];
    const hostClub = MOCK_CLUBS.find((c) => c.id === input.hostClubId) || MOCK_CLUBS[0];

    const guestPercent = 100 - input.hostSharePercent;
    const guestAmount = Math.round((booking.totalPrice * guestPercent) / 100);

    const newRoom: MatchRoomVM = {
      id: `room-${Date.now()}`,
      booking,
      hostClub,
      matchType: input.matchType,
      hostSharePercent: input.hostSharePercent,
      guestSharePercent: guestPercent,
      guestShareAmount: guestAmount,
      desiredLevels: input.desiredLevels,
      note: input.note,
      status: 'OPEN',
      applicants: [],
      permissions: {
        canCreateRoom: true,
        canSuggest: true,
        canRequestJoin: true,
        canWithdrawRequest: false,
        canManageApplicants: true,
        canEditRoom: true,
        canCancelRoom: true,
        canEnterScore: false,
        canConfirmScore: false,
        canReport: false,
        canProposeDraw: false,
      },
      createdAt: 'Vừa xong',
      balanceLabel: 'Cân kèo',
      distanceKm: 1.5,
    };

    mockMatchRooms.unshift(newRoom);
    return newRoom;
  }

  static async createJoinRequest(roomId: string, applicantClubId: string, note?: string): Promise<JoinRequestVM> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const room = mockMatchRooms.find((r) => r.id === roomId);
    if (!room) throw new Error('Không tìm thấy phòng ghép trận');

    const club = MOCK_CLUBS.find((c) => c.id === applicantClubId) || MOCK_CLUBS[1];
    if (!club.isEligibleForMatchmaking) {
      throw new Error('CLB cần có ít nhất 8 thành viên ACTIVE để gửi yêu cầu ghép trận!');
    }

    const newRequest: JoinRequestVM = {
      id: `req-${Date.now()}`,
      roomId,
      applicantClub: club,
      status: 'PENDING',
      createdAt: 'Vừa xong',
      note,
    };

    room.applicants.push(newRequest);
    room.myRequest = newRequest;
    return newRequest;
  }

  static async acceptJoinRequest(roomId: string, requestId: string): Promise<MatchRoomVM> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const room = mockMatchRooms.find((r) => r.id === roomId);
    if (!room) throw new Error('Không tìm thấy phòng');

    const targetReq = room.applicants.find((a) => a.id === requestId);
    if (!targetReq) throw new Error('Không tìm thấy yêu cầu');

    targetReq.status = 'ACCEPTED';
    room.guestClub = targetReq.applicantClub;
    room.status = 'MATCHED';

    // Auto reject other applicants of this room
    room.applicants.forEach((req) => {
      if (req.id !== requestId) {
        req.status = 'REJECTED';
      }
    });

    room.permissions.canEnterScore = true;
    room.permissions.canConfirmScore = true;

    return room;
  }

  static async submitScore(
    matchId: string,
    hostScore: number | string,
    guestScore: number | string,
    details?: string
  ): Promise<MatchRoomVM> {
    await new Promise((resolve) => setTimeout(resolve, 250));

    const room = mockMatchRooms.find((r) => r.id === matchId);
    if (!room) throw new Error('Không tìm thấy trận đấu');

    const numA = Number(hostScore);
    const numB = Number(guestScore);
    let outcome: NormalizedOutcome = 'DRAW';
    if (numA > numB) outcome = 'WIN_A';
    else if (numB > numA) outcome = 'WIN_B';

    room.scoreSubmission = {
      matchId,
      hostScore,
      guestScore,
      rawScoreDetails: details,
      submittedByClubId: room.hostClub.id,
      submittedAt: 'Vừa xong',
      normalizedOutcome: outcome,
    };

    room.status = 'SCORE_CONFIRMING';
    return room;
  }

  static async confirmScore(matchId: string): Promise<MatchRoomVM> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const room = mockMatchRooms.find((r) => r.id === matchId);
    if (!room) throw new Error('Không tìm thấy trận đấu');

    const submission = room.scoreSubmission;
    const outcome = submission ? submission.normalizedOutcome : 'WIN_A';
    const isRanked = room.matchType === 'RANKED';

    const hostBefore = room.hostClub.crp;
    const guestBefore = room.guestClub ? room.guestClub.crp : 142;

    const hostDelta = isRanked ? (outcome === 'WIN_A' ? 14.2 : outcome === 'WIN_B' ? -8.0 : 4.0) : 0;
    const guestDelta = isRanked ? (outcome === 'WIN_B' ? 16.5 : outcome === 'WIN_A' ? -6.5 : 4.0) : 0;

    room.result = {
      matchId,
      outcome,
      finalScoreText: submission ? `${submission.hostScore} - ${submission.guestScore}` : '3 - 2',
      hostCrpBefore: hostBefore,
      hostCrpDelta: hostDelta,
      hostCrpAfter: Math.max(0, Number((hostBefore + hostDelta).toFixed(1))),
      guestCrpBefore: guestBefore,
      guestCrpDelta: guestDelta,
      guestCrpAfter: Math.max(0, Number((guestBefore + guestDelta).toFixed(1))),
      explanation: isRanked
        ? [
            `Trận đấu Xếp hạng giữa hai đội có Elo tương đương (${room.hostClub.clubElo} vs ${room.guestClub?.clubElo || 1760}).`,
            outcome === 'WIN_A'
              ? `CLB ${room.hostClub.name} thắng sát nút, nhận +${hostDelta} CRP.`
              : `CLB ${room.guestClub?.name || 'Đội bạn'} giành chiến thắng ấn tượng.`,
            `Hệ thống áp dụng cơ chế Positive-sum & Anti-farming cho trận Xếp hạng.`,
          ]
        : ['Trận Giao hữu không làm thay đổi điểm CRP của cả hai CLB.'],
      confirmedAt: 'Vừa xong',
    };

    // Update club CRP in mock
    room.hostClub.crp = room.result.hostCrpAfter;
    if (room.guestClub) room.guestClub.crp = room.result.guestCrpAfter;

    room.status = 'RESULT_FINAL';
    return room;
  }

  static getRankingPreview(room: MatchRoomVM): RankingCalculationPreview {
    const isRanked = room.matchType === 'RANKED';
    const hostElo = room.hostClub.clubElo;
    const guestElo = room.guestClub ? room.guestClub.clubElo : 1760;

    return {
      matchType: room.matchType,
      hostClubElo: hostElo,
      guestClubElo: guestElo,
      balanceLabel: room.balanceLabel || 'Cân kèo',
      hostCrpBefore: room.hostClub.crp,
      guestCrpBefore: room.guestClub ? room.guestClub.crp : 142,
      hostCrpDelta: isRanked ? 14.2 : 0,
      guestCrpDelta: isRanked ? -6.5 : 0,
      hostCrpAfter: room.hostClub.crp + (isRanked ? 14.2 : 0),
      guestCrpAfter: (room.guestClub ? room.guestClub.crp : 142) + (isRanked ? -6.5 : 0),
      explanation: isRanked
        ? [
            `Elo tương đương (${hostElo} vs ${guestElo})`,
            'Tỷ lệ thưởng CRP tiêu chuẩn cho trận Xếp hạng',
            'Positive-sum & Anti-farming được áp dụng',
          ]
        : ['Trận Giao hữu không tính điểm CRP'],
    };
  }
}
