import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { registerUser } from '../../../../shared/api/auth';
import { usersApi } from '../../../../shared/api/users';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../../shared/config/theme';
import { useAlert } from '../../../../shared/contexts/AlertContext';
import { saveUserSession } from '../../../../shared/lib/userSession';

// 4 Official Sports with distinct category tints per design system
const SPORTS_LIST = [
  {
    id: 1,
    name: 'Bóng đá',
    icon: 'soccer',
    color: '#064E3B',
    bgColor: '#E6F4EA',
    description: 'Sân 7 người, sân 5 người, sân cỏ nhân tạo & tự nhiên',
    positions: ['Tiền đạo', 'Tiền vệ', 'Hậu vệ', 'Thủ môn'],
  },
  {
    id: 2,
    name: 'Cầu lông',
    icon: 'badminton',
    color: '#1D4ED8',
    bgColor: '#EFF6FF',
    description: 'Sân thảm PVC tiêu chuẩn, đánh đôi nam/nữ, đánh đơn',
    positions: ['Đơn nam/nữ', 'Đôi nam/nữ', 'Đôi nam nữ phối hợp'],
  },
  {
    id: 3,
    name: 'Pickleball',
    icon: 'tennis',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    description: 'Bộ môn xu hướng toàn cầu, sân ngoài trời & trong nhà',
    positions: ['Đánh đơn', 'Đánh đôi', 'Dink & Third Shot Drop'],
  },
  {
    id: 4,
    name: 'Bóng rổ',
    icon: 'basketball',
    color: '#C2410C',
    bgColor: '#FFF7ED',
    description: 'Sân 3x3 nửa sân, sân 5x5 toàn sân, sàn gỗ cao cấp',
    positions: ['Hậu vệ dẫn bóng (PG)', 'Hậu vệ ghi điểm (SG)', 'Tiền đạo (SF/PF)', 'Trung phong (C)'],
  },
];

// 6 Standard Skill Levels
const LEVELS = [
  { id: 'WEAK', label: 'Yếu', desc: 'Mới bắt đầu làm quen môn thể thao, nắm cơ bản quy luật (< 900 Elo).' },
  { id: 'WEAK_AVERAGE', label: 'Trung bình - Yếu', desc: 'Giao lưu phong trào cơ bản, đang rèn luyện kỹ thuật (900 - 1199 Elo).' },
  { id: 'AVERAGE', label: 'Trung bình', desc: 'Chơi thường xuyên, kiểm soát bóng và duy trì nhịp độ ổn định (1200 - 1499 Elo).' },
  { id: 'AVERAGE_GOOD', label: 'Trung bình - Khá', desc: 'Kỹ năng vững, phối hợp chiến thuật ăn ý cùng đồng đội (1500 - 1799 Elo).' },
  { id: 'GOOD', label: 'Bán chuyên', desc: 'Tập luyện bài bản, thi đấu giải phong trào, kỹ thuật cao (1800 - 2099 Elo).' },
  { id: 'PRO', label: 'Chuyên nghiệp', desc: 'Vận động viên thi đấu chuyên nghiệp, đẳng cấp đỉnh cao (≥ 2100 Elo).' },
];

// Time Slots
const TIME_SLOTS = [
  { id: 'MORNING', label: 'Sáng sớm (05:00 - 08:00)', icon: 'weather-sunny' },
  { id: 'NOON', label: 'Trưa (11:00 - 13:00)', icon: 'white-balance-sunny' },
  { id: 'AFTERNOON', label: 'Chiều (16:00 - 18:00)', icon: 'weather-sunset' },
  { id: 'EVENING', label: 'Tối vàng (18:00 - 21:00)', icon: 'weather-night', default: true },
  { id: 'LATE_NIGHT', label: 'Đêm muộn (21:00 - 23:30)', icon: 'moon-waning-crescent' },
];

// Playing Days
const PLAYING_DAYS = [
  { id: 'WEEKDAYS', label: 'Trong tuần (T2 - T6)', icon: 'calendar-outline' },
  { id: 'WEEKENDS', label: 'Cuối tuần (T7 - CN)', icon: 'calendar-today' },
  { id: 'FLEXIBLE', label: 'Linh hoạt mọi ngày', icon: 'calendar-check-outline', default: true },
];

// Distance Preferences
const DISTANCES = [
  { id: '3KM', label: '< 3 km', sub: 'Khu vực lân cận gần nhất' },
  { id: '5KM', label: '< 5 km', sub: 'Bán kính tiêu chuẩn', default: true },
  { id: '10KM', label: '< 10 km', sub: 'Không ngại di chuyển xa' },
  { id: 'ANY', label: 'Toàn thành phố', sub: 'Tìm sân thể thao bất kỳ' },
];

// Budget Preferences
const BUDGET_TIERS = [
  { id: 'BUDGET', label: 'Tiết kiệm (< 150.000 VND/h)' },
  { id: 'STANDARD', label: 'Phổ thông (150.000 – 300.000 VND/h)', default: true },
  { id: 'PREMIUM', label: 'Cao cấp (> 300.000 VND/h)' },
  { id: 'ALL', label: 'Tất cả mức giá' },
];

export function SportLevelScreen() {
  const router = useRouter();
  const { registrationToken, email, password, fullName, dateOfBirth, gender, avatarUri } =
    useLocalSearchParams();
  const { showAlert } = useAlert();

  // Wizard Step: 2 (Sports & Levels) | 3 (Habits & Persona) | 4 (Sporty-Tech AI Calibration)
  const [currentStep, setCurrentStep] = useState<2 | 3 | 4>(2);

  // Step 2 State: Sports & Levels
  const [selectedSports, setSelectedSports] = useState<number[]>([1]);
  const [sportLevels, setSportLevels] = useState<Record<number, string>>({ 1: 'AVERAGE' });
  const [expandedSport, setExpandedSport] = useState<number | null>(1);
  const [sportPositions, setSportPositions] = useState<Record<number, string>>({});

  // Step 3 State: Habits & Persona
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>(['EVENING']);
  const [selectedDay, setSelectedDay] = useState<string>('FLEXIBLE');
  const [selectedDistance, setSelectedDistance] = useState<string>('5KM');
  const [selectedBudget, setSelectedBudget] = useState<string>('STANDARD');

  // AI Calibration Step 4 Animations
  const [aiProgress, setAiProgress] = useState(0);
  const [aiPhase, setAiPhase] = useState(1);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentStep === 4) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.12,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      const interval = setInterval(() => {
        setAiProgress((prev) => {
          if (prev >= 98) {
            clearInterval(interval);
            return 100;
          }
          const next = prev + 1;
          if (next >= 75) setAiPhase(4);
          else if (next >= 50) setAiPhase(3);
          else if (next >= 25) setAiPhase(2);
          else setAiPhase(1);
          return next;
        });
      }, 42);

      return () => clearInterval(interval);
    }
  }, [currentStep]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const toggleSport = (sportId: number) => {
    if (selectedSports.includes(sportId)) {
      if (selectedSports.length === 1) {
        showAlert('Yêu cầu', 'Vui lòng chọn ít nhất một môn thể thao bạn muốn chơi.');
        return;
      }
      setSelectedSports(selectedSports.filter((id) => id !== sportId));
      const newLevels = { ...sportLevels };
      delete newLevels[sportId];
      setSportLevels(newLevels);
    } else {
      setSelectedSports([...selectedSports, sportId]);
      setSportLevels({ ...sportLevels, [sportId]: 'AVERAGE' });
      setExpandedSport(sportId);
    }
  };

  const handleLevelChange = (sportId: number, levelId: string) => {
    setSportLevels({ ...sportLevels, [sportId]: levelId });
  };

  const handlePositionChange = (sportId: number, pos: string) => {
    setSportPositions({
      ...sportPositions,
      [sportId]: sportPositions[sportId] === pos ? '' : pos,
    });
  };

  const handleProceedToHabits = () => {
    if (selectedSports.length === 0) {
      showAlert('Lỗi', 'Vui lòng chọn ít nhất 1 môn thể thao bạn muốn chơi.');
      return;
    }
    for (const sId of selectedSports) {
      if (!sportLevels[sId]) {
        const sportName = SPORTS_LIST.find((s) => s.id === sId)?.name || 'Môn thể thao';
        showAlert('Chưa chọn trình độ', `Vui lòng chọn trình độ cho môn ${sportName}.`);
        setExpandedSport(sId);
        return;
      }
    }
    setCurrentStep(3);
  };

  const handleFinalSubmit = async () => {
    setCurrentStep(4);

    try {
      const sportsPayload = selectedSports.map((sportId) => ({
        sportId,
        level: sportLevels[sportId] || 'AVERAGE',
      }));

      const payload = {
        registrationToken,
        password,
        fullName,
        dateOfBirth,
        gender,
        sports: sportsPayload,
      };

      const response = await registerUser(payload);

      const emailStr = email as string;
      const nameStr = fullName as string;

      await saveUserSession({
        accessToken: response.accessToken,
        userEmail: emailStr,
        userName: nameStr,
        userAvatar: null,
      });

      if (avatarUri && typeof avatarUri === 'string' && avatarUri.trim().length > 0) {
        try {
          const updatedProfile = await usersApi.updateProfile({}, avatarUri);
          if (updatedProfile && updatedProfile.avatarUrl) {
            await saveUserSession({
              userAvatar: updatedProfile.avatarUrl,
              userName: updatedProfile.fullName || nameStr,
              userEmail: updatedProfile.email || emailStr,
            });
          }
        } catch (avatarErr) {
          console.error('Avatar upload error during registration:', avatarErr);
        }
      }

      setTimeout(() => {
        router.replace('/(tabs)');
      }, 4400);
    } catch (error: any) {
      setCurrentStep(3);
      showAlert('Lỗi đăng ký', error.message || 'Có lỗi xảy ra khi hoàn tất hồ sơ.');
    }
  };

  const toggleTimeSlot = (id: string) => {
    if (selectedTimeSlots.includes(id)) {
      if (selectedTimeSlots.length === 1) return;
      setSelectedTimeSlots(selectedTimeSlots.filter((item) => item !== id));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, id]);
    }
  };

  // -------------------------------------------------------------------------
  // RENDER: Step 4 (Sporty-Tech AI Calibration Experience)
  // -------------------------------------------------------------------------
  if (currentStep === 4) {
    return (
      <View style={styles.aiContainer}>
        {/* Animated AI Core Graphic */}
        <View style={styles.aiCoreWrapper}>
          <Animated.View style={[styles.aiOrbitRing, { transform: [{ rotate: spin }] }]}>
            <View style={styles.aiOrbitSatellite} />
          </Animated.View>

          <Animated.View style={[styles.aiPulseCore, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.aiInnerGlow}>
              <MaterialCommunityIcons name="brain" size={48} color="#FED01B" />
            </View>
          </Animated.View>
        </View>

        {/* AI Calibration Header */}
        <Text style={styles.aiHeading}>Sporta AI Engine</Text>
        <Text style={styles.aiSubheading}>
          Đang xây dựng mô hình cá nhân hóa đề xuất sân thể thao dựa trên hồ sơ của bạn
        </Text>

        {/* Percentage Counter */}
        <View style={styles.aiCounterRow}>
          <Text style={styles.aiCounterNumber}>{aiProgress}%</Text>
          <Text style={styles.aiCounterLabel}>HOÀN TẤT THIẾT LẬP</Text>
        </View>

        {/* Dynamic Progress Bar */}
        <View style={styles.aiProgressBarBg}>
          <View style={[styles.aiProgressBarFill, { width: `${aiProgress}%` }]} />
        </View>

        {/* Multi-Phase Live Checklist */}
        <View style={styles.aiChecklist}>
          {/* Stage 1 */}
          <View style={styles.aiCheckItem}>
            <View style={[styles.aiCheckIconBox, aiPhase >= 1 && styles.aiCheckIconBoxActive]}>
              <Ionicons
                name={aiPhase > 1 ? 'checkmark' : 'ellipsis-horizontal'}
                size={14}
                color={aiPhase >= 1 ? '#003527' : '#80BEA6'}
              />
            </View>
            <Text style={[styles.aiCheckText, aiPhase >= 1 && styles.aiCheckTextActive]}>
              Phân tích thể trạng, nhóm tuổi & giới tính
            </Text>
          </View>

          {/* Stage 2 */}
          <View style={styles.aiCheckItem}>
            <View style={[styles.aiCheckIconBox, aiPhase >= 2 && styles.aiCheckIconBoxActive]}>
              <Ionicons
                name={aiPhase > 2 ? 'checkmark' : 'ellipsis-horizontal'}
                size={14}
                color={aiPhase >= 2 ? '#003527' : '#80BEA6'}
              />
            </View>
            <Text style={[styles.aiCheckText, aiPhase >= 2 && styles.aiCheckTextActive]}>
              Xây dựng radar sở trường & cấp độ ({selectedSports.length} môn)
            </Text>
          </View>

          {/* Stage 3 */}
          <View style={styles.aiCheckItem}>
            <View style={[styles.aiCheckIconBox, aiPhase >= 3 && styles.aiCheckIconBoxActive]}>
              <Ionicons
                name={aiPhase > 3 ? 'checkmark' : 'ellipsis-horizontal'}
                size={14}
                color={aiPhase >= 3 ? '#003527' : '#80BEA6'}
              />
            </View>
            <Text style={[styles.aiCheckText, aiPhase >= 3 && styles.aiCheckTextActive]}>
              Khớp nối tọa độ GPS & khung giờ vàng đặt sân
            </Text>
          </View>

          {/* Stage 4 */}
          <View style={styles.aiCheckItem}>
            <View style={[styles.aiCheckIconBox, aiPhase >= 4 && styles.aiCheckIconBoxActive]}>
              <Ionicons
                name={aiPhase >= 4 ? 'checkmark' : 'ellipsis-horizontal'}
                size={14}
                color={aiPhase >= 4 ? '#003527' : '#80BEA6'}
              />
            </View>
            <Text style={[styles.aiCheckText, aiPhase >= 4 && styles.aiCheckTextActive]}>
              Kích hoạt bảng xếp hạng đề xuất sân ưu tiên
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // -------------------------------------------------------------------------
  // RENDER: Step 2 & Step 3
  // -------------------------------------------------------------------------
  const progressPercent = currentStep === 2 ? '66.6%' : '100%';
  const stepLabel = currentStep === 2 ? 'BƯỚC 2 / 3: HỒ SƠ THỂ THAO' : 'BƯỚC 3 / 3: THÓI QUEN & AI';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (currentStep === 3) {
              setCurrentStep(2);
            } else if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(auth)/login');
            }
          }}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#003527" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ Persona</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Progress Bar (Deep Emerald Fill #064E3B) */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: progressPercent as any }]} />
        </View>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressTextLeft}>{stepLabel}</Text>
          <Text style={styles.progressTextRight}>{progressPercent} Hoàn tất</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================================================
            STEP 2: Sports & Levels
           ========================================================================= */}
        {currentStep === 2 && (
          <>
            <Text style={styles.title}>Chọn môn thể thao & Trình độ</Text>
            <Text style={styles.subtitle}>
              Hệ thống sẽ ghép cặp đối thủ vừa sức và ưu tiên đề xuất cụm sân phù hợp nhất
            </Text>

            <View style={styles.sportsList}>
              {SPORTS_LIST.map((sport) => {
                const isSelected = selectedSports.includes(sport.id);
                const isExpanded = expandedSport === sport.id;
                const currentLevelId = sportLevels[sport.id];
                const currentLevel = LEVELS.find((l) => l.id === currentLevelId);
                const currentPosition = sportPositions[sport.id];

                return (
                  <View
                    key={sport.id}
                    style={[
                      styles.sportCard,
                      isSelected && styles.sportCardSelected,
                    ]}
                  >
                    {/* Header Item */}
                    <TouchableOpacity
                      style={styles.sportCardHeader}
                      activeOpacity={0.8}
                      onPress={() => {
                        toggleSport(sport.id);
                        if (!isExpanded) setExpandedSport(sport.id);
                      }}
                    >
                      <View style={styles.sportHeaderLeft}>
                        <View
                          style={[
                            styles.sportIconBox,
                            { backgroundColor: sport.bgColor },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={sport.icon as any}
                            size={26}
                            color={sport.color}
                          />
                        </View>
                        <View style={styles.sportInfoBox}>
                          <Text style={styles.sportName}>{sport.name}</Text>
                          <Text style={styles.sportDesc} numberOfLines={1}>
                            {sport.description}
                          </Text>
                        </View>
                      </View>

                      {/* Checkbox badge */}
                      <View
                        style={[
                          styles.checkboxCircle,
                          isSelected && styles.checkboxCircleActive,
                        ]}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Expandable Level Section */}
                    {isSelected && (
                      <View style={styles.expandedSection}>
                        <View style={styles.levelHeaderRow}>
                          <Text style={styles.levelHeaderTitle}>
                            Trình độ hiện tại:{' '}
                            <Text style={styles.levelHighlightText}>
                              {currentLevel?.label || 'Chưa chọn'}
                            </Text>
                          </Text>
                          <TouchableOpacity
                            onPress={() =>
                              setExpandedSport(isExpanded ? null : sport.id)
                            }
                          >
                            <Ionicons
                              name={isExpanded ? 'chevron-up' : 'chevron-down'}
                              size={18}
                              color="#707974"
                            />
                          </TouchableOpacity>
                        </View>

                        {currentLevel && (
                          <View style={styles.levelQuoteBox}>
                            <Ionicons
                              name="information-circle-outline"
                              size={16}
                              color="#064E3B"
                            />
                            <Text style={styles.levelQuoteText}>"{currentLevel.desc}"</Text>
                          </View>
                        )}

                        {/* Level Pills */}
                        {isExpanded && (
                          <>
                            <View style={styles.levelPillsRow}>
                              {LEVELS.map((level) => {
                                const isLevelActive = currentLevelId === level.id;
                                return (
                                  <TouchableOpacity
                                    key={level.id}
                                    style={[
                                      styles.levelPill,
                                      isLevelActive && styles.levelPillActive,
                                    ]}
                                    onPress={() => handleLevelChange(sport.id, level.id)}
                                    activeOpacity={0.75}
                                  >
                                    <Text
                                      style={[
                                        styles.levelPillText,
                                        isLevelActive && styles.levelPillTextActive,
                                      ]}
                                    >
                                      {level.label}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>

                            {/* Position / Play Style (Optional) */}
                            {sport.positions && sport.positions.length > 0 && (
                              <View style={styles.positionSection}>
                                <Text style={styles.positionLabel}>
                                  Vị trí / Sở trường (Tùy chọn):
                                </Text>
                                <View style={styles.positionChipsRow}>
                                  {sport.positions.map((pos) => {
                                    const isPosActive = currentPosition === pos;
                                    return (
                                      <TouchableOpacity
                                        key={pos}
                                        style={[
                                          styles.posChip,
                                          isPosActive && styles.posChipActive,
                                        ]}
                                        onPress={() => handlePositionChange(sport.id, pos)}
                                        activeOpacity={0.75}
                                      >
                                        <Text
                                          style={[
                                            styles.posChipText,
                                            isPosActive && styles.posChipTextActive,
                                          ]}
                                        >
                                          {pos}
                                        </Text>
                                      </TouchableOpacity>
                                    );
                                  })}
                                </View>
                              </View>
                            )}
                          </>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* =========================================================================
            STEP 3: Playing Habits & AI Preferences
           ========================================================================= */}
        {currentStep === 3 && (
          <>
            <Text style={styles.title}>Thói quen & Khung giờ</Text>
            <Text style={styles.subtitle}>
              AI sẽ học hỏi khung giờ và bán kính di chuyển để tự động ưu tiên sân trống tốt nhất cho bạn
            </Text>

            {/* 1. Khung giờ vàng */}
            <View style={styles.habitGroup}>
              <Text style={styles.habitLabel}>
                1. Khung giờ thường chơi thể thao <Text style={styles.optTag}>(Chọn nhiều)</Text>
              </Text>
              <View style={styles.timeSlotsGrid}>
                {TIME_SLOTS.map((slot) => {
                  const isSlotActive = selectedTimeSlots.includes(slot.id);
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      style={[styles.slotCard, isSlotActive && styles.slotCardActive]}
                      onPress={() => toggleTimeSlot(slot.id)}
                      activeOpacity={0.75}
                    >
                      <MaterialCommunityIcons
                        name={slot.icon as any}
                        size={20}
                        color={isSlotActive ? '#064E3B' : '#707974'}
                      />
                      <Text style={[styles.slotText, isSlotActive && styles.slotTextActive]}>
                        {slot.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 2. Ngày thường chơi */}
            <View style={styles.habitGroup}>
              <Text style={styles.habitLabel}>2. Ngày chơi mong muốn</Text>
              <View style={styles.daysRow}>
                {PLAYING_DAYS.map((d) => {
                  const isDayActive = selectedDay === d.id;
                  return (
                    <TouchableOpacity
                      key={d.id}
                      style={[styles.dayCard, isDayActive && styles.dayCardActive]}
                      onPress={() => setSelectedDay(d.id)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons
                        name={d.icon as any}
                        size={18}
                        color={isDayActive ? '#064E3B' : '#707974'}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={[styles.dayCardText, isDayActive && styles.dayCardTextActive]}>
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 3. Bán kính tìm sân */}
            <View style={styles.habitGroup}>
              <Text style={styles.habitLabel}>3. Bán kính tìm sân mong muốn</Text>
              <View style={styles.distanceGrid}>
                {DISTANCES.map((dist) => {
                  const isDistActive = selectedDistance === dist.id;
                  return (
                    <TouchableOpacity
                      key={dist.id}
                      style={[styles.distCard, isDistActive && styles.distCardActive]}
                      onPress={() => setSelectedDistance(dist.id)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[styles.distCardTitle, isDistActive && styles.distCardTitleActive]}
                      >
                        {dist.label}
                      </Text>
                      <Text style={[styles.distCardSub, isDistActive && styles.distCardSubActive]}>
                        {dist.sub}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 4. Mức ngân sách */}
            <View style={styles.habitGroup}>
              <Text style={styles.habitLabel}>4. Mức giá thuê ưu tiên</Text>
              <View style={styles.budgetRow}>
                {BUDGET_TIERS.map((tier) => {
                  const isTierActive = selectedBudget === tier.id;
                  return (
                    <TouchableOpacity
                      key={tier.id}
                      style={[styles.budgetChip, isTierActive && styles.budgetChipActive]}
                      onPress={() => setSelectedBudget(tier.id)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.budgetChipText,
                          isTierActive && styles.budgetChipTextActive,
                        ]}
                      >
                        {tier.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Sticky Bottom Actions (Athletic Yellow #FED01B with Deep Emerald #003527 text) */}
      <View style={styles.footer}>
        {currentStep === 2 ? (
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleProceedToHabits}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>Tiếp tục sang Thói quen chơi</Text>
            <Ionicons name="arrow-forward" size={18} color="#003527" />
          </TouchableOpacity>
        ) : (
          <View style={styles.step3BtnRow}>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={handleFinalSubmit}
              activeOpacity={0.7}
            >
              <Text style={styles.skipBtnText}>Bỏ qua</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.finishBtn}
              onPress={handleFinalSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.finishBtnText}>Hoàn tất & Kích hoạt AI</Text>
              <Ionicons name="sparkles" size={18} color="#003527" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 52 : 24,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCE2F3',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#151C27',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#DCE2F3',
    borderRadius: 2,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#064E3B',
    borderRadius: 2,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTextLeft: {
    fontSize: 11,
    fontWeight: '700',
    color: '#064E3B',
    letterSpacing: 0.3,
  },
  progressTextRight: {
    fontSize: 11,
    color: '#707974',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#151C27',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#404944',
    lineHeight: 20,
    marginBottom: 20,
  },
  sportsList: {
    gap: 12,
  },
  sportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFC9C3',
    overflow: 'hidden',
  },
  sportCardSelected: {
    borderColor: '#064E3B',
    borderWidth: 1.5,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  sportCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  sportHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  sportIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportInfoBox: {
    flex: 1,
  },
  sportName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#151C27',
    marginBottom: 2,
  },
  sportDesc: {
    fontSize: 12,
    color: '#404944',
  },
  checkboxCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#BFC9C3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCircleActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  expandedSection: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F0F3FF',
  },
  levelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelHeaderTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#151C27',
  },
  levelHighlightText: {
    color: '#064E3B',
    fontWeight: '700',
  },
  levelQuoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F3FF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DCE2F3',
  },
  levelQuoteText: {
    fontSize: 12,
    color: '#003527',
    fontStyle: 'italic',
    flex: 1,
  },
  levelPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  levelPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCE2F3',
    backgroundColor: '#F0F3FF',
  },
  levelPillActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  levelPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#404944',
  },
  levelPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  positionSection: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F3FF',
  },
  positionLabel: {
    fontSize: 12,
    color: '#707974',
    fontWeight: '500',
    marginBottom: 6,
  },
  positionChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  posChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFC9C3',
    backgroundColor: '#FFFFFF',
  },
  posChipActive: {
    backgroundColor: '#E6F4EA',
    borderColor: '#064E3B',
  },
  posChipText: {
    fontSize: 11.5,
    color: '#404944',
    fontWeight: '500',
  },
  posChipTextActive: {
    color: '#064E3B',
    fontWeight: '700',
  },

  // Step 3 Styles
  habitGroup: {
    marginBottom: 22,
  },
  habitLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#151C27',
    marginBottom: 10,
  },
  optTag: {
    fontSize: 12,
    fontWeight: '500',
    color: '#064E3B',
  },
  timeSlotsGrid: {
    gap: 8,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFC9C3',
    backgroundColor: '#FFFFFF',
  },
  slotCardActive: {
    backgroundColor: '#F0F3FF',
    borderColor: '#064E3B',
    borderWidth: 1.5,
  },
  slotText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#151C27',
  },
  slotTextActive: {
    color: '#003527',
    fontWeight: '700',
  },
  daysRow: {
    gap: 8,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFC9C3',
    backgroundColor: '#FFFFFF',
  },
  dayCardActive: {
    backgroundColor: '#F0F3FF',
    borderColor: '#064E3B',
    borderWidth: 1.5,
  },
  dayCardText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#151C27',
  },
  dayCardTextActive: {
    color: '#003527',
    fontWeight: '700',
  },
  distanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  distCard: {
    width: '48.5%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFC9C3',
    backgroundColor: '#FFFFFF',
  },
  distCardActive: {
    backgroundColor: '#F0F3FF',
    borderColor: '#064E3B',
    borderWidth: 1.5,
  },
  distCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#151C27',
    marginBottom: 2,
  },
  distCardTitleActive: {
    color: '#003527',
  },
  distCardSub: {
    fontSize: 11,
    color: '#707974',
  },
  distCardSubActive: {
    color: '#064E3B',
  },
  budgetRow: {
    gap: 8,
  },
  budgetChip: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFC9C3',
    backgroundColor: '#FFFFFF',
  },
  budgetChipActive: {
    backgroundColor: '#F0F3FF',
    borderColor: '#064E3B',
    borderWidth: 1.5,
  },
  budgetChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#151C27',
  },
  budgetChipTextActive: {
    color: '#003527',
    fontWeight: '700',
  },

  // Step 4 (Sporty-Tech Dark Theme for AI Calibration)
  aiContainer: {
    flex: 1,
    backgroundColor: '#002117',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  aiCoreWrapper: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  aiOrbitRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1.5,
    borderColor: 'rgba(128, 190, 166, 0.3)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  aiOrbitSatellite: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FED01B',
    marginTop: -6,
    shadowColor: '#FED01B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  aiPulseCore: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(6, 78, 59, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiInnerGlow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#80BEA6',
  },
  aiHeading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  aiSubheading: {
    fontSize: 13,
    color: '#80BEA6',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  aiCounterRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  aiCounterNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FED01B',
  },
  aiCounterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#80BEA6',
    letterSpacing: 1,
  },
  aiProgressBarBg: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#064E3B',
    overflow: 'hidden',
    marginBottom: 28,
  },
  aiProgressBarFill: {
    height: '100%',
    backgroundColor: '#FED01B',
    borderRadius: 3,
  },
  aiChecklist: {
    width: '100%',
    gap: 12,
    backgroundColor: 'rgba(6, 78, 59, 0.3)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(128, 190, 166, 0.2)',
  },
  aiCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiCheckIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(128, 190, 166, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCheckIconBoxActive: {
    backgroundColor: '#FED01B',
  },
  aiCheckText: {
    fontSize: 12.5,
    color: '#80BEA6',
    fontWeight: '500',
    flex: 1,
  },
  aiCheckTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Bottom Actions (Athletic Forest Green Pill Button per new theme)
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8ECF0',
    backgroundColor: '#FFFFFF',
  },
  submitBtn: {
    height: 52,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#064E3B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  step3BtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skipBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  skipBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5C6460',
  },
  finishBtn: {
    flex: 1,
    height: 52,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#064E3B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  finishBtnText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
