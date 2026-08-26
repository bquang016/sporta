import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ImageBackground,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { useAlert } from '../../../../shared/contexts/AlertContext';

const DEFAULT_PLAYER_AVATAR = require('../../../../../assets/player/player_699x699.png');

export function PersonalInfoScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { registrationToken, email, password, fullName: initialFullName } = useLocalSearchParams();

  const [fullName, setFullName] = useState(
    typeof initialFullName === 'string' ? initialFullName : ''
  );
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(new Date(2000, 0, 1));
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [dateInputText, setDateInputText] = useState('01/01/2000');
  const [isFocusedName, setIsFocusedName] = useState(false);
  const [isFocusedDate, setIsFocusedDate] = useState(false);

  const heroBg = require('../../../../../assets/auth/sport_auth_hero.jpg');

  const handleDateTextChange = (text: string) => {
    let cleaned = text.replace(/[^0-9/]/g, '');

    if (cleaned.length > dateInputText.length) {
      if (cleaned.length === 2 || cleaned.length === 5) {
        cleaned += '/';
      } else if (cleaned.length === 3 && !cleaned.endsWith('/')) {
        cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
      } else if (cleaned.length === 6 && !cleaned.endsWith('/')) {
        cleaned = cleaned.slice(0, 5) + '/' + cleaned.slice(5);
      }
    }

    if (cleaned.length > 10) {
      cleaned = cleaned.slice(0, 10);
    }

    setDateInputText(cleaned);

    if (cleaned.length === 10) {
      const parts = cleaned.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        if (
          day >= 1 &&
          day <= 31 &&
          month >= 1 &&
          month <= 12 &&
          year >= 1920 &&
          year <= new Date().getFullYear()
        ) {
          const testDate = new Date(year, month - 1, day);
          if (
            testDate.getFullYear() === year &&
            testDate.getMonth() === month - 1 &&
            testDate.getDate() === day
          ) {
            setDateOfBirth(testDate);
            return;
          }
        }
      }
    }
    setDateOfBirth(null);
  };

  const handleNext = () => {
    if (!fullName.trim()) {
      showAlert('Thiếu thông tin', 'Vui lòng nhập họ và tên.');
      return;
    }
    if (!dateOfBirth) {
      showAlert(
        'Ngày sinh không hợp lệ',
        'Vui lòng nhập ngày sinh đúng định dạng DD/MM/YYYY.'
      );
      return;
    }

    const formattedDob = `${dateOfBirth.getFullYear()}-${(dateOfBirth.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${dateOfBirth.getDate().toString().padStart(2, '0')}`;

    router.push({
      pathname: '/(auth)/sport-level',
      params: {
        registrationToken,
        email,
        password,
        fullName,
        dateOfBirth: formattedDob,
        gender,
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.screenContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.responsiveWrapper}>
          {/* ========================================================
              TOP HERO SECTION: Lush sports backdrop
             ======================================================== */}
          <ImageBackground
            source={heroBg}
            style={styles.heroSection}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0, 33, 23, 0.4)', 'rgba(0, 33, 23, 0.75)', '#064E3B']}
              style={styles.heroGradient}
            >
              {/* Top Navigation Bar */}
              <View style={styles.topBar}>
                <TouchableOpacity
                  onPress={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/login'))}
                  style={styles.backButton}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                  <Text style={styles.backButtonText}>Quay lại</Text>
                </TouchableOpacity>
              </View>

              {/* Hero Banner Slogan */}
              <View style={styles.heroCenter}>
                <View style={styles.sportBadge}>
                  <Text style={styles.sportBadgeText}>BƯỚC 1 / 3: HỒ SƠ CƠ BẢN</Text>
                </View>
                <Text style={styles.heroHeadline}>SET UP YOUR{'\n'}PROFILE</Text>
              </View>
            </LinearGradient>
          </ImageBackground>

          {/* ========================================================
              CURVED WHITE SHEET: Form Inputs Container
             ======================================================== */}
          <View style={styles.sheetContainer}>
            {/* Step Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '33.3%' }]} />
              </View>
              <View style={styles.progressTextRow}>
                <Text style={styles.progressTextLeft}>BƯỚC 1 / 3: THÔNG TIN CÁ NHÂN</Text>
                <Text style={styles.progressTextRight}>33% Hoàn tất</Text>
              </View>
            </View>

            {/* Avatar Placeholder / Selector */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatarAura} />
                <Image
                  source={DEFAULT_PLAYER_AVATAR}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.avatarHint}>Ảnh đại diện Sporta</Text>
            </View>

            {/* Form Inputs */}
            <View style={styles.formContainer}>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Họ và tên <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    isFocusedName && styles.inputWrapperFocused,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={20}
                    color={isFocusedName ? '#064E3B' : '#8A929A'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholderTextColor="#9AA1A9"
                    onFocus={() => setIsFocusedName(true)}
                    onBlur={() => setIsFocusedName(false)}
                  />
                </View>
              </View>

              {/* Date of Birth */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Ngày sinh (DD/MM/YYYY) <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    isFocusedDate && styles.inputWrapperFocused,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="calendar-month-outline"
                    size={20}
                    color={isFocusedDate ? '#064E3B' : '#8A929A'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#9AA1A9"
                    value={dateInputText}
                    onChangeText={handleDateTextChange}
                    onFocus={() => setIsFocusedDate(true)}
                    onBlur={() => setIsFocusedDate(false)}
                  />
                </View>
              </View>

              {/* Gender Segmented Chips */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Giới tính <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.genderRow}>
                  <TouchableOpacity
                    style={[styles.genderPill, gender === 'MALE' && styles.genderPillActive]}
                    onPress={() => setGender('MALE')}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name="gender-male"
                      size={18}
                      color={gender === 'MALE' ? '#FFFFFF' : '#5C6460'}
                    />
                    <Text style={[styles.genderText, gender === 'MALE' && styles.genderTextActive]}>
                      Nam
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.genderPill, gender === 'FEMALE' && styles.genderPillActive]}
                    onPress={() => setGender('FEMALE')}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name="gender-female"
                      size={18}
                      color={gender === 'FEMALE' ? '#FFFFFF' : '#5C6460'}
                    />
                    <Text style={[styles.genderText, gender === 'FEMALE' && styles.genderTextActive]}>
                      Nữ
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.genderPill, gender === 'OTHER' && styles.genderPillActive]}
                    onPress={() => setGender('OTHER')}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name="gender-non-binary"
                      size={18}
                      color={gender === 'OTHER' ? '#FFFFFF' : '#5C6460'}
                    />
                    <Text style={[styles.genderText, gender === 'OTHER' && styles.genderTextActive]}>
                      Khác
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Security Card */}
              <View style={styles.securityCard}>
                <View style={styles.securityIconBox}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#064E3B" />
                </View>
                <View style={styles.securityTextContainer}>
                  <Text style={styles.securityTitle}>Bảo mật thông tin cá nhân</Text>
                  <Text style={styles.securityDesc}>
                    Dữ liệu cá nhân được mã hóa an toàn và chỉ phục vụ việc cá nhân hóa hoạt động thể thao.
                  </Text>
                </View>
              </View>
            </View>

            {/* Primary Submit CTA Button */}
            <TouchableOpacity
              style={styles.primaryPillButton}
              onPress={handleNext}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryPillButtonText}>Tiếp tục sang Hồ sơ thể thao</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#064E3B',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#064E3B',
  },
  scrollContent: {
    flexGrow: 1,
  },
  responsiveWrapper: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    minHeight: '100%',
  },
  heroSection: {
    width: '100%',
    height: 220,
    backgroundColor: '#064E3B',
  },
  heroGradient: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 44,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 2,
  },
  heroCenter: {
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  sportBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  heroHeadline: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 26,
    letterSpacing: -0.5,
  },
  sheetContainer: {
    marginTop: -32,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  progressContainer: {
    marginBottom: 20,
    width: '100%',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E8ECF0',
    borderRadius: BORDER_RADIUS.full,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#064E3B',
    borderRadius: BORDER_RADIUS.full,
  },
  progressTextRow: {
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
    color: '#8A929A',
    fontWeight: '600',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 92,
    height: 92,
    borderRadius: 46,
    position: 'relative',
    borderWidth: 3,
    borderColor: '#064E3B',
    backgroundColor: '#FFFFFF',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarAura: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 52,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 46,
  },
  avatarHint: {
    fontSize: 12,
    color: '#5C6460',
    marginTop: 8,
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 20,
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#191C20',
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  requiredStar: {
    color: '#BA1A1A',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
  },
  inputWrapperFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#064E3B',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#151C27',
    paddingVertical: 0,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  genderRow: {
    flexDirection: 'row',
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  genderPill: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
  },
  genderPillActive: {
    backgroundColor: '#064E3B',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  genderText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#5C6460',
  },
  genderTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  securityCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F5F2',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#D4E2D9',
    marginTop: 4,
  },
  securityIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#064E3B',
    marginBottom: 2,
  },
  securityDesc: {
    fontSize: 11.5,
    color: '#5C6460',
    lineHeight: 15,
  },
  primaryPillButton: {
    width: '100%',
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
  primaryPillButtonText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

