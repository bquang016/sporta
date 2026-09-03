import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../../shared/config/theme';
import {
  SeasonRewardsInfo,
  SportRewardDetail,
} from '../../../../shared/api/leaderboard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RewardsModalProps {
  visible: boolean;
  onClose: () => void;
  rewardsData?: SeasonRewardsInfo | null;
}

type MainTab = 'rewards' | 'crp' | 'rules';
type SportSubTab = 'all' | 'football' | 'badminton' | 'pickleball' | 'basketball';

export function RewardsModal({ visible, onClose, rewardsData }: RewardsModalProps) {
  const [mainTab, setMainTab] = useState<MainTab>('rewards');
  const [sportSubTab, setSportSubTab] = useState<SportSubTab>('all');
  const [detailModalItem, setDetailModalItem] = useState<{ title: string; content: string } | null>(null);

  const totalPrize = rewardsData?.totalPrizePool || '38.500.000 VNĐ';
  const daysRemaining = rewardsData?.daysRemaining ?? 18;

  const overallChampion = rewardsData?.overallChampion || {
    title: 'ĐẠI QUÁN QUÂN TOÀN HỆ THỐNG',
    badge: 'Cúp Vàng Vô Cực & Huy Hiệu Huyền Thoại',
    cashReward: '10.000.000 VNĐ',
    courtTickets: '30 Vé đặt sân miễn phí 100% (tất cả các môn)',
    memberVoucher: 'Voucher 50% toàn hệ sinh thái Sporta cho toàn bộ thành viên',
    spotlight: 'Vinh danh Banner Trang Chủ & Bảng Vàng Quốc Gia suốt mùa kế tiếp',
  };

  const tiers = rewardsData?.tiers || [
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

  const sportDetails: Record<string, SportRewardDetail> = rewardsData?.sportSpecificDetails || {
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

  const eligibilityRules = rewardsData?.eligibilityRules || [
    'CLB phải có tối thiểu 5 thành viên chính thức đã hoàn thành xác minh hồ sơ.',
    'Hoàn thành tối thiểu 8 trận đấu ghép kèo chính thức qua hệ thống Sporta trong suốt mùa giải.',
    'Tỷ lệ thành viên tham gia hoạt động thực tế đạt từ 60% trở lên.',
    'Không có lịch sử bị báo cáo gian lận tỷ số hoặc bỏ trận không lý do.',
    'Quỹ tài trợ tiền mặt sẽ được chuyển trực tiếp vào Ví CLB của Trưởng câu lạc bộ trong vòng 3 ngày sau khi chốt bảng xếp hạng.',
  ];

  const getTierBadgeMeta = (tier: string) => {
    switch (tier) {
      case 'CHAMPION':
        return { icon: 'trophy', color: '#D97706', bg: '#FEF3C7', border: '#FCD34D' };
      case 'RUNNER_UP':
        return { icon: 'medal', color: '#64748B', bg: '#F1F5F9', border: '#CBD5E1' };
      case 'THIRD_PLACE':
        return { icon: 'ribbon', color: '#D97706', bg: '#FFEDD5', border: '#FDBA74' };
      case 'ELITE':
        return { icon: 'shield-checkmark', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' };
      default:
        return { icon: 'star', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalSheet}>
          {/* Pull Indicator Bar */}
          <View style={styles.dragIndicatorWrap}>
            <View style={styles.dragIndicator} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleBlock}>
              <View style={styles.trophyIconWrap}>
                <Ionicons name="trophy" size={22} color="#D97706" />
              </View>
              <View style={styles.headerTitleCol}>
                <Text style={styles.headerTitle}>Cơ Chế Phần Thưởng Mùa Giải</Text>
                <Text style={styles.headerSubTitle}>
                  {rewardsData?.seasonName || 'Mùa 1 - 2026 • Tranh Bá Thể Thao'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={22} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* Season Total Prize Banner */}
          <LinearGradient
            colors={['#004D40', '#065F46', '#047857']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.prizePoolBanner}
          >
            <View style={styles.prizePoolContent}>
              <View>
                <Text style={styles.prizePoolLabel}>TỔNG QUỸ TÀI TRỢ & GIẢI THƯỞNG</Text>
                <Text style={styles.prizePoolValue}>{totalPrize}</Text>
              </View>
              <View style={styles.countdownPill}>
                <Ionicons name="time-outline" size={14} color="#FDE68A" />
                <Text style={styles.countdownPillText}>Còn {daysRemaining} ngày</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Level 1: Main Tab Switcher */}
          <View style={styles.mainTabSwitcher}>
            <TouchableOpacity
              style={[styles.mainTabBtn, mainTab === 'rewards' && styles.mainTabBtnActive]}
              onPress={() => setMainTab('rewards')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="gift-outline"
                size={15}
                color={mainTab === 'rewards' ? COLORS.primary : '#64748B'}
              />
              <Text
                style={[
                  styles.mainTabText,
                  mainTab === 'rewards' && styles.mainTabTextActive,
                ]}
              >
                Cơ Cấu Giải
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mainTabBtn, mainTab === 'crp' && styles.mainTabBtnActive]}
              onPress={() => setMainTab('crp')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="analytics-outline"
                size={15}
                color={mainTab === 'crp' ? COLORS.primary : '#64748B'}
              />
              <Text
                style={[
                  styles.mainTabText,
                  mainTab === 'crp' && styles.mainTabTextActive,
                ]}
              >
                Cách Tính CRP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mainTabBtn, mainTab === 'rules' && styles.mainTabBtnActive]}
              onPress={() => setMainTab('rules')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="document-text-outline"
                size={15}
                color={mainTab === 'rules' ? COLORS.primary : '#64748B'}
              />
              <Text
                style={[
                  styles.mainTabText,
                  mainTab === 'rules' && styles.mainTabTextActive,
                ]}
              >
                Thể Lệ & Nhận Giải
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main Scroll Content */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* TAB 1: REWARDS (CƠ CẤU GIẢI THƯỞNG) */}
            {mainTab === 'rewards' && (
              <View>
                {/* Level 2: Sport Sub-Tabs Strip */}
                <View style={styles.sportSubTabsWrapper}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.sportSubTabsScroll}
                  >
                    <TouchableOpacity
                      style={[
                        styles.sportSubChip,
                        sportSubTab === 'all' && styles.sportSubChipActive,
                      ]}
                      onPress={() => setSportSubTab('all')}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="globe-outline"
                        size={14}
                        color={sportSubTab === 'all' ? '#FFFFFF' : '#475569'}
                      />
                      <Text
                        style={[
                          styles.sportSubChipText,
                          sportSubTab === 'all' && styles.sportSubChipTextActive,
                        ]}
                      >
                        Toàn Hệ Thống
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.sportSubChip,
                        sportSubTab === 'football' && styles.sportSubChipActive,
                      ]}
                      onPress={() => setSportSubTab('football')}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="football-outline"
                        size={14}
                        color={sportSubTab === 'football' ? '#FFFFFF' : '#475569'}
                      />
                      <Text
                        style={[
                          styles.sportSubChipText,
                          sportSubTab === 'football' && styles.sportSubChipTextActive,
                        ]}
                      >
                        Bóng Đá
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.sportSubChip,
                        sportSubTab === 'badminton' && styles.sportSubChipActive,
                      ]}
                      onPress={() => setSportSubTab('badminton')}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="tennisball-outline"
                        size={14}
                        color={sportSubTab === 'badminton' ? '#FFFFFF' : '#475569'}
                      />
                      <Text
                        style={[
                          styles.sportSubChipText,
                          sportSubTab === 'badminton' && styles.sportSubChipTextActive,
                        ]}
                      >
                        Cầu Lông
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.sportSubChip,
                        sportSubTab === 'pickleball' && styles.sportSubChipActive,
                      ]}
                      onPress={() => setSportSubTab('pickleball')}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="baseball-outline"
                        size={14}
                        color={sportSubTab === 'pickleball' ? '#FFFFFF' : '#475569'}
                      />
                      <Text
                        style={[
                          styles.sportSubChipText,
                          sportSubTab === 'pickleball' && styles.sportSubChipTextActive,
                        ]}
                      >
                        Pickleball
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.sportSubChip,
                        sportSubTab === 'basketball' && styles.sportSubChipActive,
                      ]}
                      onPress={() => setSportSubTab('basketball')}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="basketball-outline"
                        size={14}
                        color={sportSubTab === 'basketball' ? '#FFFFFF' : '#475569'}
                      />
                      <Text
                        style={[
                          styles.sportSubChipText,
                          sportSubTab === 'basketball' && styles.sportSubChipTextActive,
                        ]}
                      >
                        Bóng Rổ
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>

                {/* Sub-Tab Content: ALL (TOÀN HỆ THỐNG) */}
                {sportSubTab === 'all' && (
                  <View style={styles.rewardsList}>
                    {/* Overall Champion Card */}
                    <View style={styles.overallChampionCard}>
                      <LinearGradient
                        colors={['#FFFBEB', '#FEF3C7']}
                        style={styles.overallGradient}
                      >
                        <View style={styles.overallHeader}>
                          <View style={styles.overallCrownWrap}>
                            <Ionicons name="trophy" size={24} color="#D97706" />
                          </View>
                          <View style={styles.overallTitleCol}>
                            <Text style={styles.overallTagText}>GIẢI THƯỞNG DANH GIÁ NHẤT</Text>
                            <Text style={styles.overallTitleText}>{overallChampion.title}</Text>
                          </View>
                          <View style={styles.overallCashBadge}>
                            <Text style={styles.overallCashValue}>{overallChampion.cashReward}</Text>
                          </View>
                        </View>

                        <Text style={styles.overallBadgeText}>{overallChampion.badge}</Text>

                        <View style={styles.perksContainer}>
                          <View style={styles.perkRow}>
                            <Ionicons name="ticket-outline" size={15} color="#059669" />
                            <Text style={styles.perkText}>{overallChampion.courtTickets}</Text>
                          </View>
                          <View style={styles.perkRow}>
                            <Ionicons name="pricetag-outline" size={15} color="#3B82F6" />
                            <Text style={styles.perkText}>{overallChampion.memberVoucher}</Text>
                          </View>
                          <View style={styles.perkRow}>
                            <Ionicons name="sparkles-outline" size={15} color="#D97706" />
                            <Text style={styles.perkText}>{overallChampion.spotlight}</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </View>

                    <Text style={styles.sectionDividerTitle}>
                      HỆ THỐNG PHÂN HẠNG MÙA GIẢI
                    </Text>

                    {/* Tier List */}
                    {tiers.map((t, index) => {
                      const styleMeta = getTierBadgeMeta(t.tier);
                      return (
                        <View
                          key={t.tier || index}
                          style={[
                            styles.tierCard,
                            t.tier === 'CHAMPION' && styles.tierCardChampion,
                          ]}
                        >
                          <View style={styles.tierCardHeader}>
                            <View
                              style={[
                                styles.tierIconBadge,
                                { backgroundColor: styleMeta.bg, borderColor: styleMeta.border },
                              ]}
                            >
                              <Ionicons
                                name={styleMeta.icon as any}
                                size={18}
                                color={styleMeta.color}
                              />
                            </View>
                            <View style={styles.tierTitleWrap}>
                              <Text style={styles.tierCardTitle}>{t.title}</Text>
                              <Text style={styles.tierCardBadge}>{t.badge}</Text>
                            </View>
                            {t.cashReward && (
                              <View
                                style={[
                                  styles.cashPill,
                                  t.tier === 'CHAMPION' && styles.cashPillChampion,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.cashPillText,
                                    t.tier === 'CHAMPION' && styles.cashPillTextChampion,
                                  ]}
                                >
                                  {t.cashReward}
                                </Text>
                              </View>
                            )}
                          </View>

                          <View style={styles.perksContainer}>
                            {t.courtTickets && (
                              <View style={styles.perkRow}>
                                <Ionicons name="ticket-outline" size={15} color="#059669" />
                                <Text style={styles.perkText}>{t.courtTickets}</Text>
                              </View>
                            )}
                            {t.memberVoucher && (
                              <View style={styles.perkRow}>
                                <Ionicons name="pricetag-outline" size={15} color="#3B82F6" />
                                <Text style={styles.perkText}>{t.memberVoucher}</Text>
                              </View>
                            )}
                            {t.spotlight && (
                              <View style={styles.perkRow}>
                                <Ionicons name="sparkles-outline" size={15} color="#D97706" />
                                <Text style={styles.perkText}>{t.spotlight}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Sub-Tab Content: SPORT-SPECIFIC (BÓNG ĐÁ / CẦU LÔNG / PICKLEBALL / BÓNG RỔ) */}
                {sportSubTab !== 'all' && (
                  <View style={styles.sportRewardsContainer}>
                    {(() => {
                      const spec = sportDetails[sportSubTab];
                      if (!spec) return null;
                      return (
                        <View style={styles.sportSpecWrapper}>
                          {/* Top Sport Banner */}
                          <View style={styles.sportHeaderBanner}>
                            <View style={styles.sportIconCircle}>
                              <Ionicons name={spec.icon as any} size={24} color="#059669" />
                            </View>
                            <View style={styles.sportHeaderTextCol}>
                              <Text style={styles.sportHeaderTitle}>
                                Giải Thưởng Bộ Môn {spec.sportName}
                              </Text>
                              <Text style={styles.sportHeaderSub}>
                                Dành riêng cho các CLB tranh tài môn {spec.sportName}
                              </Text>
                            </View>
                          </View>

                          {/* 1st Prize */}
                          <View style={[styles.prizeTierBox, styles.prizeTierBox1]}>
                            <View style={styles.prizeTierHeader}>
                              <View style={[styles.medalBadge, { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }]}>
                                <Ionicons name="trophy" size={18} color="#D97706" />
                              </View>
                              <View style={styles.prizeTierTitleCol}>
                                <Text style={styles.prizeTierRank}>QUÁN QUÂN {spec.sportName.toUpperCase()}</Text>
                                <Text style={styles.prizeTierSubtitle}>Hạng Nhất Bộ Môn</Text>
                              </View>
                            </View>
                            <Text style={styles.prizeTierBody}>{spec.firstPrize}</Text>
                          </View>

                          {/* 2nd Prize */}
                          <View style={[styles.prizeTierBox, styles.prizeTierBox2]}>
                            <View style={styles.prizeTierHeader}>
                              <View style={[styles.medalBadge, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}>
                                <Ionicons name="medal" size={18} color="#64748B" />
                              </View>
                              <View style={styles.prizeTierTitleCol}>
                                <Text style={styles.prizeTierRank}>Á QUÂN {spec.sportName.toUpperCase()}</Text>
                                <Text style={styles.prizeTierSubtitle}>Hạng Nhì Bộ Môn</Text>
                              </View>
                            </View>
                            <Text style={styles.prizeTierBody}>{spec.secondPrize}</Text>
                          </View>

                          {/* 3rd Prize */}
                          <View style={[styles.prizeTierBox, styles.prizeTierBox3]}>
                            <View style={styles.prizeTierHeader}>
                              <View style={[styles.medalBadge, { backgroundColor: '#FFEDD5', borderColor: '#FDBA74' }]}>
                                <Ionicons name="ribbon" size={18} color="#D97706" />
                              </View>
                              <View style={styles.prizeTierTitleCol}>
                                <Text style={styles.prizeTierRank}>HẠNG BA {spec.sportName.toUpperCase()}</Text>
                                <Text style={styles.prizeTierSubtitle}>Hạng Ba Bộ Môn</Text>
                              </View>
                            </View>
                            <Text style={styles.prizeTierBody}>{spec.thirdPrize}</Text>
                          </View>

                          {/* Special Sport Perk */}
                          <View style={styles.specialPerkCard}>
                            <View style={styles.specialPerkHeader}>
                              <Ionicons name="star" size={16} color="#059669" />
                              <Text style={styles.specialPerkTitle}>Đặc Quyền Độc Quyền Bộ Môn</Text>
                            </View>
                            <Text style={styles.specialPerkBody}>{spec.specialPerk}</Text>
                          </View>
                        </View>
                      );
                    })()}
                  </View>
                )}
              </View>
            )}

            {/* TAB 2: CRP (CÁCH TÍNH ĐIỂM XẾP HẠNG CRP) */}
            {mainTab === 'crp' && (
              <View style={styles.rulesContainer}>
                <View style={styles.ruleCard}>
                  <View style={styles.ruleHeader}>
                    <Ionicons name="analytics-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.ruleTitle}>Điểm Xếp Hạng CLB (CRP) Là Gì?</Text>
                  </View>
                  <Text style={styles.ruleBody}>
                    <Text style={styles.boldText}>CRP (Club Rating Points)</Text> là hệ số điểm đánh giá phong độ, thành tích và độ gắn kết của câu lạc bộ. Tất cả các trận đấu ghép kèo chính thức và hoạt động xé vé qua Sporta đều tự động cộng hoặc trừ điểm CRP minh bạch.
                  </Text>
                </View>

                <View style={styles.ruleCard}>
                  <View style={styles.ruleHeader}>
                    <Ionicons name="add-circle-outline" size={20} color="#059669" />
                    <Text style={styles.ruleTitle}>Cơ Chế Điểm Thưởng & Tích Lũy</Text>
                  </View>
                  <View style={styles.pointDetailRow}>
                    <View style={styles.pointBullet} />
                    <Text style={styles.pointDetailText}>
                      <Text style={styles.boldText}>Thắng trận Xếp hạng:</Text> +25 đến +35 CRP tùy chênh lệch trình độ đối thủ.
                    </Text>
                  </View>
                  <View style={styles.pointDetailRow}>
                    <View style={styles.pointBullet} />
                    <Text style={styles.pointDetailText}>
                      <Text style={styles.boldText}>Thắng đối thủ Elo cao hơn:</Text> Thưởng thêm +5 đến +15 CRP vượt cấp.
                    </Text>
                  </View>
                  <View style={styles.pointDetailRow}>
                    <View style={styles.pointBullet} />
                    <Text style={styles.pointDetailText}>
                      <Text style={styles.boldText}>Chuỗi thắng liên tiếp (Streak 3+):</Text> Thưởng thêm +10 CRP phong độ thăng hoa.
                    </Text>
                  </View>
                  <View style={styles.pointDetailRow}>
                    <View style={styles.pointBullet} />
                    <Text style={styles.pointDetailText}>
                      <Text style={styles.boldText}>Thua trận Xếp hạng:</Text> -10 đến -15 CRP (bảo vệ tối thiểu 0 CRP).
                    </Text>
                  </View>
                  <View style={styles.pointDetailRow}>
                    <View style={styles.pointBullet} />
                    <Text style={styles.pointDetailText}>
                      <Text style={styles.boldText}>Thành viên tích cực:</Text> Hoạt động xé vé và thi đấu thường xuyên nhận thêm điểm gắn kết CLB.
                    </Text>
                  </View>
                </View>

                <View style={styles.ruleCard}>
                  <View style={styles.ruleHeader}>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#3B82F6" />
                    <Text style={styles.ruleTitle}>Bảo Lưu & Chuyển Giao Mùa Giải</Text>
                  </View>
                  <Text style={styles.ruleBody}>
                    Khi kết thúc mỗi mùa, điểm CRP sẽ được reset về mức mốc phân hạng mới dựa trên thứ bậc đạt được (Soft Reset), đảm bảo các CLB mới vẫn có cơ hội cạnh tranh công bằng ở mùa giải tiếp theo.
                  </Text>
                </View>
              </View>
            )}

            {/* TAB 3: RULES (THỂ LỆ & QUY TRÌNH NHẬN GIẢI) */}
            {mainTab === 'rules' && (
              <View style={styles.rulesContainer}>
                <View style={styles.ruleCard}>
                  <View style={styles.ruleHeader}>
                    <Ionicons name="checkmark-done-circle-outline" size={20} color="#059669" />
                    <Text style={styles.ruleTitle}>Điều Kiện Đủ Điều Kiện Nhận Thưởng</Text>
                  </View>
                  {eligibilityRules.map((rule, idx) => (
                    <View key={idx} style={styles.pointDetailRow}>
                      <View style={[styles.pointBullet, { backgroundColor: '#059669' }]} />
                      <Text style={styles.pointDetailText}>{rule}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.ruleCard}>
                  <View style={styles.ruleHeader}>
                    <Ionicons name="wallet-outline" size={20} color="#D97706" />
                    <Text style={styles.ruleTitle}>Quy Trình Trao Thưởng & Bàn Giao</Text>
                  </View>
                  <Text style={styles.ruleBody}>
                    1. <Text style={styles.boldText}>Chốt bảng xếp hạng:</Text> Tự động vào 23:59 ngày 30/09/2026.{'\n'}
                    2. <Text style={styles.boldText}>Xác minh kết quả:</Text> Ban tổ chức kiểm tra dữ liệu trong vòng 24h.{'\n'}
                    3. <Text style={styles.boldText}>Chuyển khoản tiền mặt:</Text> Chuyển thẳng vào Ví CLB trên hệ thống Sporta.{'\n'}
                    4. <Text style={styles.boldText}>Bàn giao cúp & kỷ niệm chương:</Text> Trao tận tay đại diện CLB tại trụ sở hoặc gửi qua đường bưu điện miễn phí.
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footerAction}>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.88}
              onPress={onClose}
            >
              <LinearGradient
                colors={['#004D40', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="flame" size={18} color="#FDE68A" />
                <Text style={styles.actionButtonText}>Đã Hiểu • Quyết Tâm Leo Rank</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: SCREEN_HEIGHT * 0.93,
    paddingTop: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  dragIndicatorWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragIndicator: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  headerTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  trophyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  prizePoolBanner: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
  },
  prizePoolContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prizePoolLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A7F3D0',
    letterSpacing: 0.6,
  },
  prizePoolValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.4)',
  },
  countdownPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FDE68A',
  },
  mainTabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 3,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mainTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 10,
  },
  mainTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  mainTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  mainTabTextActive: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  scrollArea: {
    flex: 1,
    marginVertical: 4,
  },
  scrollContent: {
    paddingBottom: SPACING.md,
  },
  sportSubTabsWrapper: {
    marginBottom: 10,
  },
  sportSubTabsScroll: {
    gap: 6,
  },
  sportSubChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sportSubChipActive: {
    backgroundColor: '#004D40',
    borderColor: '#004D40',
  },
  sportSubChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
  },
  sportSubChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  rewardsList: {
    gap: SPACING.sm,
  },
  overallChampionCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 4,
  },
  overallGradient: {
    padding: 14,
  },
  overallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  overallCrownWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
  },
  overallTitleCol: {
    flex: 1,
  },
  overallTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.6,
  },
  overallTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
    marginTop: 1,
  },
  overallCashBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  overallCashValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  overallBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78350F',
    marginTop: 8,
  },
  sectionDividerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  tierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  tierCardChampion: {
    borderColor: '#FCD34D',
    backgroundColor: '#FFFEFA',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  tierCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tierIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  tierTitleWrap: {
    flex: 1,
  },
  tierCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  tierCardBadge: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  cashPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  cashPillChampion: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  cashPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  cashPillTextChampion: {
    color: '#B45309',
  },
  perksContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 6,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perkText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
  },
  sportRewardsContainer: {
    gap: SPACING.sm,
  },
  sportSpecWrapper: {
    gap: 10,
  },
  sportHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  sportIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportHeaderTextCol: {
    flex: 1,
  },
  sportHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
  },
  sportHeaderSub: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 1,
  },
  prizeTierBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  prizeTierBox1: {
    borderColor: '#FCD34D',
    backgroundColor: '#FFFEFA',
  },
  prizeTierBox2: {
    borderColor: '#CBD5E1',
  },
  prizeTierBox3: {
    borderColor: '#FED7AA',
  },
  prizeTierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  medalBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  prizeTierTitleCol: {
    flex: 1,
  },
  prizeTierRank: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  prizeTierSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  prizeTierBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  specialPerkCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  specialPerkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  specialPerkTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  specialPerkBody: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  rulesContainer: {
    gap: SPACING.sm,
  },
  ruleCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  ruleBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  pointDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 6,
  },
  pointBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
    marginTop: 7,
  },
  pointDetailText: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
    lineHeight: 19,
  },
  footerAction: {
    paddingTop: 8,
  },
  actionButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
