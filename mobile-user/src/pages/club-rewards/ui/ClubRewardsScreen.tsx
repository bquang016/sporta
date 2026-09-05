import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';
import {
  SeasonRewardsInfo,
  SportRewardDetail,
  getSeasonRewardsApi,
} from '../../../shared/api/leaderboard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function ClubRewardsScreen() {
  const router = useRouter();
  const [rewardsInfo, setRewardsInfo] = useState<SeasonRewardsInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    getSeasonRewardsApi()
      .then((data) => {
        if (isMounted) setRewardsInfo(data);
      })
      .catch((err) => console.error('Lỗi tải cơ chế phần thưởng:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const totalPrize = rewardsInfo?.totalPrizePool || '38.500.000 VNĐ';
  const daysRemaining = rewardsInfo?.daysRemaining ?? 18;

  const overallChampion = rewardsInfo?.overallChampion || {
    title: 'ĐẠI QUÁN QUÂN TOÀN HỆ THỐNG',
    badge: 'Cúp Vàng Vô Cực & Huy Hiệu Huyền Thoại',
    cashReward: '10.000.000 VNĐ',
    courtTickets: '30 Vé đặt sân miễn phí 100% (tất cả các môn)',
    memberVoucher: 'Voucher 50% toàn hệ sinh thái Sporta cho toàn bộ thành viên',
    spotlight: 'Vinh danh Banner Trang Chủ & Bảng Vàng Quốc Gia suốt mùa tiếp theo',
  };

  const sportDetails: Record<string, SportRewardDetail> = rewardsInfo?.sportSpecificDetails || {
    football: {
      sportName: 'Bóng Đá',
      icon: 'football-outline',
      firstPrize: '5.000.000 VNĐ + Cúp Vàng King of Football + 15 Vé sân 7 người 0đ + 1 Bộ áo đấu CLB in logo riêng',
      secondPrize: '3.000.000 VNĐ + Kỷ niệm chương Bạc + 10 Vé sân 7 người 0đ + 2 Quả bóng thi đấu Động Lực FIFA Quality Pro',
      thirdPrize: '1.500.000 VNĐ + Kỷ niệm chương Đồng + 5 Vé sân 0đ + Bình xịt lạnh chấn thương thể thao',
      specialPerk: 'Được ưu tiên ghép kèo sân lớn và giải đấu tứ hùng do Sporta tài trợ',
    },
    badminton: {
      sportName: 'Cầu Lông',
      icon: 'tennisball-outline',
      firstPrize: '5.000.000 VNĐ + Cúp Vàng Smash Master + 20 Vé sân thảm tiêu chuẩn BWF 0đ + 10 Ống cầu Yonex cao cấp',
      secondPrize: '3.000.000 VNĐ + Kỷ niệm chương Bạc + 10 Vé sân 0đ + 5 Ống cầu thi đấu',
      thirdPrize: '1.500.000 VNĐ + Kỷ niệm chương Đồng + 5 Vé sân 0đ + Voucher căng cước vợt 50%',
      specialPerk: 'Quyền lợi đặt trước khung giờ vàng tại hệ thống cụm sân cầu lông đối tác',
    },
    pickleball: {
      sportName: 'Pickleball',
      icon: 'baseball-outline',
      firstPrize: '5.000.000 VNĐ + Cúp Vàng Dinking Legend + 20 Vé sân Pickleball 0đ + 1 Thùng bóng thi đấu Franklin X-40',
      secondPrize: '3.000.000 VNĐ + Kỷ niệm chương Bạc + 10 Vé sân 0đ + Voucher mua Paddle Joola 30%',
      thirdPrize: '1.500.000 VNĐ + Kỷ niệm chương Đồng + 5 Vé sân 0đ + Túi đựng vợt thể thao cao cấp',
      specialPerk: 'Vé mời tham dự giải đấu Pickleball Open Tournament Mùa 1',
    },
    basketball: {
      sportName: 'Bóng Rổ',
      icon: 'basketball-outline',
      firstPrize: '5.000.000 VNĐ + Cúp Vàng Dunk Master + 15 Vé sân bóng rổ tiêu chuẩn 0đ + 3 Quả bóng thi đấu Molten GG7X',
      secondPrize: '3.000.000 VNĐ + Kỷ niệm chương Bạc + 10 Vé sân 0đ + 1 Quả bóng Molten',
      thirdPrize: '1.500.000 VNĐ + Kỷ niệm chương Đồng + 5 Vé sân 0đ + Băng quấn cổ chân y tế',
      specialPerk: 'Hỗ trợ trọng tài và bảng điểm điện tử cho các trận giao lưu nội bộ',
    },
  };

  const tiers = rewardsInfo?.tiers || [
    {
      tier: 'CHAMPION',
      title: 'Vô Địch Bộ Môn (Top 1)',
      badge: 'Cúp Vàng Danh Giá & Huy Hiệu Kim Cương',
      cashReward: '5.000.000 VNĐ',
      courtTickets: '20 Vé đặt sân bộ môn miễn phí 100%',
      memberVoucher: 'Voucher 40% dịch vụ cho thành viên',
      spotlight: 'Ưu tiên hiển thị Top 1 Spotlight bộ môn',
    },
    {
      tier: 'RUNNER_UP',
      title: 'Á Quân Bộ Môn (Top 2)',
      badge: 'Kỷ Niệm Chương Bạc & Huy Hiệu Bạch Kim',
      cashReward: '3.000.000 VNĐ',
      courtTickets: '10 Vé đặt sân miễn phí 100%',
      memberVoucher: 'Voucher 30% cho thành viên',
      spotlight: 'Vinh danh bảng vàng bộ môn',
    },
    {
      tier: 'THIRD_PLACE',
      title: 'Hạng Ba Bộ Môn (Top 3)',
      badge: 'Kỷ Niệm Chương Đồng & Huy Hiệu Vàng',
      cashReward: '1.500.000 VNĐ',
      courtTickets: '5 Vé đặt sân miễn phí 100%',
      memberVoucher: 'Voucher 20% cho thành viên',
      spotlight: 'Vinh danh bảng vàng bộ môn',
    },
    {
      tier: 'ELITE',
      title: 'Top 4 - 10 Tinh Anh',
      badge: 'Huy Hiệu Tinh Anh Bạc',
      cashReward: '800.000 VNĐ Voucher CLB',
      courtTickets: '3 Vé đặt sân giảm 50%',
      memberVoucher: 'Voucher 15% cho thành viên',
      spotlight: 'Vinh danh Top 10 mùa giải',
    },
    {
      tier: 'CHALLENGER',
      title: 'Top 11+ Phong Trào',
      badge: 'Huy Hiệu Phong Trào Đồng',
      cashReward: 'Quà tặng lưu niệm Sporta',
      courtTickets: 'Tích lũy điểm thưởng CRP mỗi trận đấu',
      memberVoucher: 'Voucher 10% chào mừng',
      spotlight: 'Cơ hội thăng hạng tuần tiếp theo',
    },
  ];

  const eligibilityRules = rewardsInfo?.eligibilityRules || [
    'CLB phải có tối thiểu 5 thành viên chính thức đã hoàn thành xác minh hồ sơ.',
    'Hoàn thành tối thiểu 8 trận đấu ghép kèo chính thức qua hệ thống Sporta trong suốt mùa giải.',
    'Tỷ lệ thành viên tham gia hoạt động thực tế đạt từ 60% trở lên.',
    'Không có lịch sử bị báo cáo gian lận tỷ số hoặc bỏ trận không lý do.',
    'Quỹ tài trợ tiền mặt sẽ được chuyển trực tiếp vào Ví CLB của Trưởng câu lạc bộ trong vòng 3 ngày sau khi chốt bảng xếp hạng.',
  ];

  const getSportIonicons = (key: string, iconName?: string) => {
    if (key === 'football' || iconName?.includes('soccer') || iconName?.includes('football')) return 'football-outline';
    if (key === 'badminton' || iconName?.includes('badminton') || iconName?.includes('tennis')) return 'tennisball-outline';
    if (key === 'pickleball' || iconName?.includes('pickleball') || iconName?.includes('baseball')) return 'baseball-outline';
    if (key === 'basketball' || iconName?.includes('basketball')) return 'basketball-outline';
    return 'trophy-outline';
  };

  const handleGoToLeaderboard = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/leaderboard');
    }
  };

  const handleGoHome = () => {
    router.replace('/(tabs)/clubs');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* 1. Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/clubs'))}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back-ios-new" size={18} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Cơ chế phần thưởng</Text>
          <Text style={styles.headerSubtitle}>
            {rewardsInfo?.seasonName || 'Mùa 1 - 2026 • Tranh bá thể thao'}
          </Text>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.homeNavBtn}
            onPress={handleGoHome}
            activeOpacity={0.7}
          >
            <Ionicons name="home-outline" size={18} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.leaderboardNavBtn}
            onPress={handleGoToLeaderboard}
            activeOpacity={0.8}
          >
            <Ionicons name="podium-outline" size={15} color={COLORS.primary} />
            <Text style={styles.leaderboardNavBtnText}>BXH</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Scrollable Body Content */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Season Banner */}
        <View style={styles.heroBannerContainer}>
          <LinearGradient
            colors={['#004D40', '#065F46', '#047857']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.heroSeasonTag}>
                <Ionicons name="trophy" size={13} color="#FDE68A" />
                <Text style={styles.heroSeasonTagText}>GIẢI ĐẤU QUỐC GIA MÙA 1</Text>
              </View>
              <View style={styles.heroCountdownBadge}>
                <Ionicons name="time-outline" size={14} color="#FDE68A" />
                <Text style={styles.heroCountdownText}>Còn {daysRemaining} ngày</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>Tranh Bá Câu Lạc Bộ Sporta</Text>
            <Text style={styles.heroSubtitle}>
              Thi đấu ghép kèo, xé vé, tích lũy điểm CRP để giành cúp vô địch và các giải thưởng tài trợ hấp dẫn.
            </Text>

            <View style={styles.heroPrizeCard}>
              <View>
                <Text style={styles.heroPrizeLabel}>TỔNG GIÁ TRỊ GIẢI THƯỞNG MÙA</Text>
                <Text style={styles.heroPrizeValue}>{totalPrize}</Text>
              </View>
              <View style={styles.heroTrophyCircle}>
                <Ionicons name="trophy" size={26} color="#D97706" />
              </View>
            </View>
          </LinearGradient>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải danh mục phần thưởng...</Text>
          </View>
        ) : (
          <>
            {/* SECTION 1: ĐẠI QUÁN QUÂN TOÀN QUỐC */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="star" size={18} color="#D97706" />
                </View>
                <View style={styles.sectionTitleCol}>
                  <Text style={styles.sectionTitle}>Giải thưởng đại quán quân</Text>
                  <Text style={styles.sectionSubTitle}>Dành cho CLB đạt điểm CRP cao nhất toàn hệ thống Sporta</Text>
                </View>
              </View>

              <View style={styles.overallChampionCard}>
                <LinearGradient
                  colors={['#FFFEFA', '#FEF9C3', '#FEF08A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.overallGradient}
                >
                  <View style={styles.overallHeaderRow}>
                    <View style={styles.overallCrownBox}>
                      <Ionicons name="trophy" size={28} color="#B45309" />
                    </View>
                    <View style={styles.overallTitleWrap}>
                      <Text style={styles.overallTopTag}>TOP 1 TOÀN BỘ MÔN THỂ THAO</Text>
                      <Text style={styles.overallChampionTitle}>{overallChampion.title}</Text>
                    </View>
                    <View style={styles.overallCashBadge}>
                      <Text style={styles.overallCashText}>{overallChampion.cashReward}</Text>
                    </View>
                  </View>

                  <Text style={styles.overallBadgeSub}>{overallChampion.badge}</Text>

                  <View style={styles.perksList}>
                    <View style={styles.perkItemRow}>
                      <Ionicons name="ticket" size={16} color="#047857" />
                      <Text style={styles.perkItemText}>{overallChampion.courtTickets}</Text>
                    </View>
                    <View style={styles.perkItemRow}>
                      <Ionicons name="pricetag" size={16} color="#2563EB" />
                      <Text style={styles.perkItemText}>{overallChampion.memberVoucher}</Text>
                    </View>
                    <View style={styles.perkItemRow}>
                      <Ionicons name="sparkles" size={16} color="#D97706" />
                      <Text style={styles.perkItemText}>{overallChampion.spotlight}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* SECTION 2: GIẢI THƯỞNG THEO TỪNG BỘ MÔN */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="football" size={18} color="#059669" />
                </View>
                <View style={styles.sectionTitleCol}>
                  <Text style={styles.sectionTitle}>Giải thưởng từng bộ môn</Text>
                  <Text style={styles.sectionSubTitle}>Phần thưởng chuyên biệt cho từng môn thể thao</Text>
                </View>
              </View>

              {/* Loop through each sport */}
              {Object.entries(sportDetails).map(([key, spec]) => (
                <View key={key} style={styles.sportCard}>
                  {/* Sport Header */}
                  <View style={styles.sportCardHeader}>
                    <View style={styles.sportIconWrap}>
                      <Ionicons name={getSportIonicons(key, spec.icon) as any} size={20} color="#047857" />
                    </View>
                    <View style={styles.sportHeaderTitleCol}>
                      <Text style={styles.sportNameTitle}>Môn {spec.sportName}</Text>
                      <Text style={styles.sportNameSubtitle}>Tranh tài giải đấu bộ môn {spec.sportName}</Text>
                    </View>
                  </View>

                  {/* Sport Prizes Grid */}
                  <View style={styles.prizesStack}>
                    {/* 1st */}
                    <View style={[styles.prizeItemBox, styles.prizeGoldBox]}>
                      <View style={styles.prizeItemHeader}>
                        <View style={[styles.itemMedalPill, { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }]}>
                          <Ionicons name="trophy" size={14} color="#D97706" />
                          <Text style={[styles.itemMedalText, { color: '#B45309' }]}>HẠNG 1</Text>
                        </View>
                        <Text style={styles.prizeItemRoleTitle}>Quán Quân {spec.sportName}</Text>
                      </View>
                      <Text style={styles.prizeItemDetail}>{spec.firstPrize}</Text>
                    </View>

                    {/* 2nd */}
                    <View style={[styles.prizeItemBox, styles.prizeSilverBox]}>
                      <View style={styles.prizeItemHeader}>
                        <View style={[styles.itemMedalPill, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}>
                          <Ionicons name="medal" size={14} color="#64748B" />
                          <Text style={[styles.itemMedalText, { color: '#475569' }]}>HẠNG 2</Text>
                        </View>
                        <Text style={styles.prizeItemRoleTitle}>Á Quân {spec.sportName}</Text>
                      </View>
                      <Text style={styles.prizeItemDetail}>{spec.secondPrize}</Text>
                    </View>

                    {/* 3rd */}
                    <View style={[styles.prizeItemBox, styles.prizeBronzeBox]}>
                      <View style={styles.prizeItemHeader}>
                        <View style={[styles.itemMedalPill, { backgroundColor: '#FFEDD5', borderColor: '#FDBA74' }]}>
                          <Ionicons name="ribbon" size={14} color="#D97706" />
                          <Text style={[styles.itemMedalText, { color: '#9A3412' }]}>HẠNG 3</Text>
                        </View>
                        <Text style={styles.prizeItemRoleTitle}>Hạng Ba {spec.sportName}</Text>
                      </View>
                      <Text style={styles.prizeItemDetail}>{spec.thirdPrize}</Text>
                    </View>

                    {/* Special Perk */}
                    <View style={styles.sportPerkRow}>
                      <Ionicons name="shield-checkmark" size={16} color="#059669" />
                      <Text style={styles.sportPerkText}>
                        <Text style={{ fontWeight: '700' }}>Đặc quyền: </Text>
                        {spec.specialPerk}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* SECTION 3: HỆ THỐNG PHÂN HẠNG TIERS */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="ribbon" size={18} color="#2563EB" />
                </View>
                <View style={styles.sectionTitleCol}>
                  <Text style={styles.sectionTitle}>Khung hạng & quyền lợi chung</Text>
                  <Text style={styles.sectionSubTitle}>Áp dụng cho tất cả các CLB tham gia thi đấu</Text>
                </View>
              </View>

              <View style={styles.tiersCardList}>
                {tiers.map((t, idx) => (
                  <View key={t.tier || idx} style={styles.tierSummaryCard}>
                    <View style={styles.tierSummaryHeader}>
                      <View style={styles.tierSummaryLeft}>
                        <Text style={styles.tierSummaryTitle}>{t.title}</Text>
                        <Text style={styles.tierSummaryBadge}>{t.badge}</Text>
                      </View>
                      {t.cashReward && (
                        <View style={styles.tierSummaryCash}>
                          <Text style={styles.tierSummaryCashText}>{t.cashReward}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.tierSummaryPerks}>
                      {t.courtTickets && (
                        <View style={styles.tierPerkRow}>
                          <Ionicons name="ticket-outline" size={14} color="#059669" />
                          <Text style={styles.tierPerkText}>{t.courtTickets}</Text>
                        </View>
                      )}
                      {t.memberVoucher && (
                        <View style={styles.tierPerkRow}>
                          <Ionicons name="pricetag-outline" size={14} color="#3B82F6" />
                          <Text style={styles.tierPerkText}>{t.memberVoucher}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* SECTION 4: CÔNG THỨC & CÁCH TÍNH ĐIỂM CRP */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#FDF2F8' }]}>
                  <Ionicons name="analytics" size={18} color="#DB2777" />
                </View>
                <View style={styles.sectionTitleCol}>
                  <Text style={styles.sectionTitle}>Cách tính điểm xếp hạng (CRP)</Text>
                  <Text style={styles.sectionSubTitle}>Công thức tính điểm minh bạch qua từng trận đấu</Text>
                </View>
              </View>

              <View style={styles.crpExplainerCard}>
                <View style={styles.crpPointRow}>
                  <View style={[styles.crpPointBadge, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={[styles.crpPointValue, { color: '#047857' }]}>+25 - 35</Text>
                    <Text style={[styles.crpPointUnit, { color: '#047857' }]}>CRP</Text>
                  </View>
                  <View style={styles.crpPointDesc}>
                    <Text style={styles.crpPointTitle}>Thắng trận xếp hạng</Text>
                    <Text style={styles.crpPointSubtitle}>Tùy thuộc vào mức chênh lệch trình độ giữa 2 CLB</Text>
                  </View>
                </View>

                <View style={styles.crpPointRow}>
                  <View style={[styles.crpPointBadge, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.crpPointValue, { color: '#B45309' }]}>+5 - 15</Text>
                    <Text style={[styles.crpPointUnit, { color: '#B45309' }]}>CRP</Text>
                  </View>
                  <View style={styles.crpPointDesc}>
                    <Text style={styles.crpPointTitle}>Thưởng vượt cấp Elo</Text>
                    <Text style={styles.crpPointSubtitle}>Khi đánh bại câu lạc bộ có điểm Elo trung bình cao hơn</Text>
                  </View>
                </View>

                <View style={styles.crpPointRow}>
                  <View style={[styles.crpPointBadge, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={[styles.crpPointValue, { color: '#1D4ED8' }]}>+10</Text>
                    <Text style={[styles.crpPointUnit, { color: '#1D4ED8' }]}>CRP</Text>
                  </View>
                  <View style={styles.crpPointDesc}>
                    <Text style={styles.crpPointTitle}>Thưởng chuỗi thắng (Streak 3+)</Text>
                    <Text style={styles.crpPointSubtitle}>Duy trì phong độ thăng hoa liên tiếp 3 trận thắng trở lên</Text>
                  </View>
                </View>

                <View style={[styles.crpPointRow, { borderBottomWidth: 0 }]}>
                  <View style={[styles.crpPointBadge, { backgroundColor: '#FEF2F2' }]}>
                    <Text style={[styles.crpPointValue, { color: '#B91C1C' }]}>-10 - 15</Text>
                    <Text style={[styles.crpPointUnit, { color: '#B91C1C' }]}>CRP</Text>
                  </View>
                  <View style={styles.crpPointDesc}>
                    <Text style={styles.crpPointTitle}>Thua trận xếp hạng</Text>
                    <Text style={styles.crpPointSubtitle}>Trừ điểm tối thiểu, không âm điểm dưới 0 CRP</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* SECTION 5: ĐIỀU KIỆN & QUY TRÌNH TRAO THƯỞNG */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#F1F5F9' }]}>
                  <Ionicons name="document-text" size={18} color="#475569" />
                </View>
                <View style={styles.sectionTitleCol}>
                  <Text style={styles.sectionTitle}>Thể lệ & quy trình trao thưởng</Text>
                  <Text style={styles.sectionSubTitle}>Tiêu chí đảm bảo tính công bằng và quyền lợi của CLB</Text>
                </View>
              </View>

              <View style={styles.rulesListBox}>
                {eligibilityRules.map((rule, idx) => (
                  <View key={idx} style={styles.ruleBulletRow}>
                    <View style={styles.ruleBulletDot} />
                    <Text style={styles.ruleBulletText}>{rule}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* 3. Bottom Sticky Action Button */}
      <View style={styles.bottomActionBar}>
        <TouchableOpacity
          style={styles.primaryActionButton}
          activeOpacity={0.88}
          onPress={handleGoToLeaderboard}
        >
          <LinearGradient
            colors={['#004D40', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryActionGradient}
          >
            <Ionicons name="podium" size={18} color="#FDE68A" />
            <Text style={styles.primaryActionText}>Vào Bảng Xếp Hạng Leo Rank Ngay</Text>
            <MaterialIcons name="chevron-right" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  homeNavBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  leaderboardNavBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  heroBannerContainer: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  heroGradient: {
    padding: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heroSeasonTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroSeasonTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A7F3D0',
    letterSpacing: 0.8,
  },
  heroCountdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.5)',
  },
  heroCountdownText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FDE68A',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#D1FAE5',
    lineHeight: 18,
    marginBottom: 14,
  },
  heroPrizeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  heroPrizeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A7F3D0',
    letterSpacing: 0.6,
  },
  heroPrizeValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  heroTrophyCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  sectionContainer: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: SPACING.sm,
  },
  sectionIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleCol: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSubTitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  overallChampionCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },
  overallGradient: {
    padding: 16,
  },
  overallHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  overallCrownBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
  },
  overallTitleWrap: {
    flex: 1,
  },
  overallTopTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.6,
  },
  overallChampionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#78350F',
    marginTop: 1,
  },
  overallCashBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  overallCashText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B45309',
  },
  overallBadgeSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginTop: 8,
  },
  perksList: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(217, 119, 6, 0.15)',
    gap: 8,
  },
  perkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perkItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#451A03',
    flex: 1,
  },
  sportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  sportCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sportIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportHeaderTitleCol: {
    flex: 1,
  },
  sportNameTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  sportNameSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  prizesStack: {
    gap: 8,
  },
  prizeItemBox: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  prizeGoldBox: {
    backgroundColor: '#FFFEFA',
    borderColor: '#FCD34D',
  },
  prizeSilverBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  prizeBronzeBox: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  prizeItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  itemMedalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 10,
    borderWidth: 1,
  },
  itemMedalText: {
    fontSize: 10,
    fontWeight: '800',
  },
  prizeItemRoleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  prizeItemDetail: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  sportPerkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  sportPerkText: {
    fontSize: 11,
    color: '#166534',
    flex: 1,
    lineHeight: 16,
  },
  tiersCardList: {
    gap: 8,
  },
  tierSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tierSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tierSummaryLeft: {
    flex: 1,
  },
  tierSummaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  tierSummaryBadge: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  tierSummaryCash: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  tierSummaryCashText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  tierSummaryPerks: {
    gap: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  tierPerkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tierPerkText: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
  },
  crpExplainerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  crpPointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  crpPointBadge: {
    width: 68,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crpPointValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  crpPointUnit: {
    fontSize: 9,
    fontWeight: '700',
  },
  crpPointDesc: {
    flex: 1,
  },
  crpPointTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  crpPointSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  rulesListBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  ruleBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ruleBulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
    marginTop: 6,
  },
  ruleBulletText: {
    fontSize: 12.5,
    color: '#334155',
    flex: 1,
    lineHeight: 19,
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.md,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryActionButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
