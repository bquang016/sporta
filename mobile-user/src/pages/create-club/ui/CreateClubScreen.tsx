import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui';
import { useClubs, getDefaultCover, getDefaultAvatar } from '../../../entities/club';
import { uploadImageApi } from '../../../shared/api/upload';
import { ProvincePickerModal, ProvinceItem } from './components/ProvincePickerModal';
import { WardPickerModal, WardItem } from './components/WardPickerModal';

const SPORTS_LIST = [
  { id: 1, name: 'Bóng đá', icon: 'sports-soccer' },
  { id: 2, name: 'Cầu lông', icon: 'sports-tennis' },
  { id: 3, name: 'Pickleball', icon: 'sports-tennis' },
  { id: 4, name: 'Bóng rổ', icon: 'sports-basketball' },
];

export function CreateClubScreen() {
  const router = useRouter();
  const { createClub } = useClubs();

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sport, setSport] = useState('Bóng đá');
  const [area, setArea] = useState('');
  const [ward, setWard] = useState('');
  const [maxMembers, setMaxMembers] = useState(30);
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Custom User Picked Images (null means fallback to default)
  const [customCoverUrl, setCustomCoverUrl] = useState<string | null>(null);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);

  // Current effective images (user custom OR default based on sport)
  const effectiveCover = customCoverUrl || getDefaultCover(sport);
  const effectiveAvatar = customAvatarUrl || getDefaultAvatar(sport);

  // Provinces State
  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [isProvinceModalVisible, setIsProvinceModalVisible] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);

  // Wards State
  const [wards, setWards] = useState<WardItem[]>([]);
  const [isWardModalVisible, setIsWardModalVisible] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);

  // Focus & Validation
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Custom Alert Modal State
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  // Load Provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const response = await fetch('https://provinces.open-api.vn/api/v2/p/');
        if (response.ok) {
          const data = await response.json();
          setProvinces(data);
        }
      } catch (error) {
        console.error('Lỗi tải danh sách tỉnh thành:', error);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // Load Wards
  useEffect(() => {
    if (selectedProvinceCode === null) {
      setWards([]);
      return;
    }
    const fetchWards = async () => {
      setLoadingWards(true);
      try {
        const response = await fetch(
          `https://provinces.open-api.vn/api/v2/p/${selectedProvinceCode}?depth=2`
        );
        if (response.ok) {
          const data = await response.json();
          setWards(data.wards || []);
        }
      } catch (error) {
        console.error('Lỗi tải danh sách phường xã:', error);
      } finally {
        setLoadingWards(false);
      }
    };
    fetchWards();
  }, [selectedProvinceCode]);

  const pickImage = async (type: 'avatar' | 'cover') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      setAlertTitle('Quyền truy cập');
      setAlertMessage('Ứng dụng cần quyền truy cập thư viện ảnh để tải ảnh lên.');
      setAlertType('error');
      setIsAlertVisible(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.85,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const pickedUri = result.assets[0].uri;

      // Optimistic preview
      if (type === 'avatar') {
        setCustomAvatarUrl(pickedUri);
      } else {
        setCustomCoverUrl(pickedUri);
      }

      // Upload to server
      try {
        const uploadType = type === 'avatar' ? 'avatar' : 'court_cover';
        const uploadedUrl = await uploadImageApi(pickedUri, uploadType);
        if (uploadedUrl) {
          if (type === 'avatar') setCustomAvatarUrl(uploadedUrl);
          else setCustomCoverUrl(uploadedUrl);
        }
      } catch (e) {
        console.log('Error uploading image to server, fallback local:', e);
      }
    }
  };

  const handleDecrement = () => {
    if (maxMembers > 5) setMaxMembers((prev) => prev - 5);
  };

  const handleIncrement = () => {
    if (maxMembers < 100) setMaxMembers((prev) => prev + 5);
  };

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!name.trim()) tempErrors.name = 'Tên câu lạc bộ không được để trống';
    if (!area.trim()) tempErrors.area = 'Vui lòng chọn Tỉnh/Thành phố';
    if (!ward.trim()) tempErrors.ward = 'Vui lòng chọn Quận/Huyện/Phường';
    if (!description.trim()) tempErrors.description = 'Mô tả không được để trống';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setAlertTitle('Lỗi nhập liệu');
      setAlertMessage('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      setAlertType('error');
      setIsAlertVisible(true);
      return;
    }

    setSubmitting(true);
    try {
      const selectedSportItem = SPORTS_LIST.find((s) => s.name === sport);
      const sportId = selectedSportItem ? selectedSportItem.id : 1;
      const fullArea = `${ward}, ${area}`;

      // Final fallback logic applied automatically
      const finalCover = customCoverUrl || getDefaultCover(sport);
      const finalAvatar = customAvatarUrl || null;

      await createClub({
        name: name.trim(),
        description: description.trim(),
        sportId,
        maxMembers,
        isPrivate,
        coverImage: finalCover,
        avatarImage: finalAvatar,
        area: fullArea,
        activityLevel: 'Mới thành lập',
      });

      setAlertTitle('Thành công');
      setAlertMessage(`Đã tạo thành công câu lạc bộ "${name}"!`);
      setAlertType('success');
      setIsAlertVisible(true);
    } catch (error: any) {
      setAlertTitle('Lỗi tạo CLB');
      setAlertMessage(error.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
      setAlertType('error');
      setIsAlertVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 1. Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo Câu Lạc Bộ Mới</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 2. Interactive Cover & Avatar Section */}
          <View style={styles.imagesSection}>
            {/* Cover Image */}
            <TouchableOpacity
              style={styles.coverBox}
              activeOpacity={0.88}
              onPress={() => pickImage('cover')}
            >
              <Image source={{ uri: effectiveCover }} style={styles.coverImg} />
              <View style={styles.coverBadgeAction}>
                <MaterialIcons name="photo-camera" size={15} color={COLORS.white} />
                <Text style={styles.coverBadgeActionText}>
                  {customCoverUrl ? 'Thay đổi ảnh bìa' : 'Tải ảnh bìa lên'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Avatar Overlap */}
            <TouchableOpacity
              style={styles.avatarBox}
              activeOpacity={0.88}
              onPress={() => pickImage('avatar')}
            >
              <Image 
                source={typeof effectiveAvatar === 'string' ? { uri: effectiveAvatar } : effectiveAvatar} 
                style={styles.avatarImg} 
              />
              <View style={styles.avatarBadgeAction}>
                <MaterialIcons name="camera-alt" size={14} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          </View>

          {/* 3. Form Input Container */}
          <View style={styles.formContainer}>
            {/* Club Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Tên câu lạc bộ <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'name' && styles.inputFocused,
                  errors.name ? styles.inputError : null,
                ]}
                placeholder="Ví dụ: FC Cầu Giấy United, CLB Pickleball Hà Đông..."
                placeholderTextColor={COLORS.outline}
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            {/* Sport Category Grid */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Môn thể thao hoạt động</Text>
              <View style={styles.sportsGrid}>
                {SPORTS_LIST.map((item) => {
                  const isSelected = sport === item.name;
                  return (
                    <TouchableOpacity
                      key={item.name}
                      style={[styles.sportCard, isSelected && styles.sportCardActive]}
                      activeOpacity={0.8}
                      onPress={() => setSport(item.name)}
                    >
                      <MaterialIcons
                        name={item.icon as any}
                        size={22}
                        color={isSelected ? COLORS.white : COLORS.primary}
                      />
                      <Text
                        style={[
                          styles.sportCardText,
                          isSelected && styles.sportCardTextActive,
                        ]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Activity Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Khu vực hoạt động <Text style={styles.required}>*</Text>
              </Text>

              <View style={styles.locationRow}>
                {/* Province Dropdown */}
                <TouchableOpacity
                  style={[
                    styles.input,
                    styles.dropdownInput,
                    errors.area ? styles.inputError : null,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setIsProvinceModalVisible(true)}
                >
                  <MaterialIcons name="location-city" size={18} color={COLORS.primary} />
                  <Text
                    style={[
                      styles.dropdownText,
                      !area && styles.dropdownPlaceholderText,
                    ]}
                    numberOfLines={1}
                  >
                    {area || 'Chọn Tỉnh / Thành phố'}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={22} color={COLORS.outline} />
                </TouchableOpacity>

                {/* Ward Dropdown */}
                <TouchableOpacity
                  style={[
                    styles.input,
                    styles.dropdownInput,
                    !area && styles.dropdownDisabled,
                    errors.ward ? styles.inputError : null,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => area && setIsWardModalVisible(true)}
                  disabled={!area}
                >
                  <MaterialIcons
                    name="place"
                    size={18}
                    color={area ? COLORS.primary : COLORS.outlineVariant}
                  />
                  <Text
                    style={[
                      styles.dropdownText,
                      !ward && styles.dropdownPlaceholderText,
                      !area && styles.dropdownDisabledText,
                    ]}
                    numberOfLines={1}
                  >
                    {ward || (area ? 'Chọn Quận / Huyện / Xã' : 'Chọn Tỉnh/TP trước')}
                  </Text>
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={22}
                    color={area ? COLORS.outline : COLORS.outlineVariant}
                  />
                </TouchableOpacity>
              </View>
              {errors.area ? <Text style={styles.errorText}>{errors.area}</Text> : null}
              {errors.ward ? <Text style={styles.errorText}>{errors.ward}</Text> : null}
            </View>

            {/* Member Limit */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số lượng thành viên tối đa</Text>
              <View style={styles.memberCounterBox}>
                <TouchableOpacity
                  style={[styles.counterBtn, maxMembers <= 5 && styles.counterBtnDisabled]}
                  onPress={handleDecrement}
                  disabled={maxMembers <= 5}
                >
                  <MaterialIcons
                    name="remove"
                    size={20}
                    color={maxMembers <= 5 ? COLORS.outlineVariant : COLORS.primary}
                  />
                </TouchableOpacity>

                <View style={styles.counterValueWrap}>
                  <Text style={styles.counterValueText}>{maxMembers}</Text>
                  <Text style={styles.counterSuffixText}>thành viên</Text>
                </View>

                <TouchableOpacity
                  style={[styles.counterBtn, maxMembers >= 100 && styles.counterBtnDisabled]}
                  onPress={handleIncrement}
                  disabled={maxMembers >= 100}
                >
                  <MaterialIcons
                    name="add"
                    size={20}
                    color={maxMembers >= 100 ? COLORS.outlineVariant : COLORS.primary}
                  />
                </TouchableOpacity>
              </View>

              {/* Quick Presets */}
              <View style={styles.presetsRow}>
                {[15, 25, 35, 50].map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.presetChip,
                      maxMembers === preset && styles.presetChipActive,
                    ]}
                    onPress={() => setMaxMembers(preset)}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        maxMembers === preset && styles.presetChipTextActive,
                      ]}
                    >
                      {preset} người
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Bio / Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Mô tả / Lịch sinh hoạt CLB <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.multilineInput,
                  focusedField === 'description' && styles.inputFocused,
                  errors.description ? styles.inputError : null,
                ]}
                placeholder="Mô tả mục tiêu, lịch sinh hoạt hàng tuần, trình độ thành viên mong muốn..."
                placeholderTextColor={COLORS.outline}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.description ? (
                <Text style={styles.errorText}>{errors.description}</Text>
              ) : null}
            </View>

            {/* Privacy Mode */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Chế độ câu lạc bộ</Text>
              <View style={styles.privacyOptionsRow}>
                {/* Public Option */}
                <TouchableOpacity
                  style={[
                    styles.privacyCard,
                    !isPrivate && styles.privacyCardActive,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setIsPrivate(false)}
                >
                  <View style={styles.privacyCardTop}>
                    <MaterialIcons
                      name="public"
                      size={20}
                      color={!isPrivate ? COLORS.primary : COLORS.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        styles.privacyTitle,
                        !isPrivate && styles.privacyTitleActive,
                      ]}
                    >
                      Công khai
                    </Text>
                  </View>
                  <Text style={styles.privacyDesc}>
                    Bất kỳ ai cũng có thể vào trực tiếp CLB để sinh hoạt ngay.
                  </Text>
                </TouchableOpacity>

                {/* Private Option */}
                <TouchableOpacity
                  style={[
                    styles.privacyCard,
                    isPrivate && styles.privacyCardActive,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setIsPrivate(true)}
                >
                  <View style={styles.privacyCardTop}>
                    <MaterialIcons
                      name="lock"
                      size={20}
                      color={isPrivate ? COLORS.primary : COLORS.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        styles.privacyTitle,
                        isPrivate && styles.privacyTitleActive,
                      ]}
                    >
                      Riêng tư
                    </Text>
                  </View>
                  <Text style={styles.privacyDesc}>
                    Cần Trưởng câu lạc bộ phê duyệt đơn xin tham gia mới được vào.
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <Button
              variant="primary"
              title={submitting ? 'Đang tạo câu lạc bộ...' : 'Hoàn tất & Tạo CLB'}
              icon="add-circle"
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={submitting}
              loading={submitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Reusable Province Picker Modal */}
      <ProvincePickerModal
        visible={isProvinceModalVisible}
        onClose={() => setIsProvinceModalVisible(false)}
        provinces={provinces}
        onSelectProvince={(name, code) => {
          setArea(name);
          setSelectedProvinceCode(code);
          setWard('');
        }}
        loading={loadingProvinces}
      />

      {/* Reusable Ward Picker Modal */}
      <WardPickerModal
        visible={isWardModalVisible}
        onClose={() => setIsWardModalVisible(false)}
        wards={wards}
        onSelectWard={(name) => setWard(name)}
        loading={loadingWards}
      />

      {/* Custom Alert Modal */}
      <Modal
        visible={isAlertVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setIsAlertVisible(false);
          if (alertType === 'success') {
            if (router.canGoBack()) router.back();
            else router.replace('/my-clubs');
          }
        }}
      >
        <View style={styles.alertModalOverlay}>
          <View style={styles.alertModalContent}>
            <MaterialIcons
              name={alertType === 'success' ? 'check-circle' : 'error-outline'}
              size={48}
              color={alertType === 'success' ? COLORS.primary : COLORS.error}
              style={styles.modalAlertIcon}
            />
            <Text style={styles.alertModalTitle}>{alertTitle}</Text>
            <Text style={styles.alertModalMessage}>{alertMessage}</Text>
            <Button
              variant="primary"
              title="Đóng"
              style={styles.alertModalBtn}
              onPress={() => {
                setIsAlertVisible(false);
                if (alertType === 'success') {
                  if (router.canGoBack()) router.back();
                  else router.replace('/my-clubs');
                }
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    height: 56,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    position: 'absolute',
    left: 60,
    right: 60,
    textAlign: 'center',
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: '#0F172A',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: SPACING.xl * 2,
  },
  imagesSection: {
    height: 180,
    backgroundColor: COLORS.surfaceContainerLow,
    position: 'relative',
    marginBottom: 44,
  },
  coverBox: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  coverImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverBadgeAction: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  coverBadgeActionText: {
    color: COLORS.white,
    fontSize: 11.5,
    fontWeight: '700',
  },
  avatarBox: {
    position: 'absolute',
    bottom: -34,
    left: SPACING.marginMobile,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3.5,
    borderColor: COLORS.surface,
    backgroundColor: COLORS.surfaceContainer,
    overflow: 'hidden',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarBadgeAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    paddingHorizontal: SPACING.marginMobile,
    gap: 18,
  },
  inputGroup: {
    gap: 7,
  },
  label: {
    fontSize: 13.5,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: '#0F172A',
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  inputFocused: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  sportsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  sportCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  sportCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sportCardText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  sportCardTextActive: {
    color: COLORS.white,
    fontWeight: '800',
  },
  locationRow: {
    gap: 8,
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dropdownText: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  dropdownPlaceholderText: {
    color: COLORS.outline,
    fontWeight: '400',
  },
  dropdownDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  dropdownDisabledText: {
    color: COLORS.outlineVariant,
  },
  memberCounterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnDisabled: {
    backgroundColor: '#F1F5F9',
  },
  counterValueWrap: {
    alignItems: 'center',
    gap: 2,
  },
  counterValueText: {
    fontSize: 20,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '900',
    color: COLORS.primary,
  },
  counterSuffixText: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  presetChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: COLORS.primaryOpacity10,
    borderColor: COLORS.primary,
  },
  presetChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  presetChipTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  privacyOptionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  privacyCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  privacyCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryOpacity05,
  },
  privacyCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  privacyTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#475569',
  },
  privacyTitleActive: {
    color: COLORS.primary,
  },
  privacyDesc: {
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
    lineHeight: 16,
  },
  submitBtn: {
    marginTop: 8,
    height: 50,
    borderRadius: 14,
  },
  alertModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  alertModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  modalAlertIcon: {
    marginBottom: SPACING.md,
  },
  alertModalTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  alertModalMessage: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13.5,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  alertModalBtn: {
    width: '100%',
    height: 44,
  },
});

export default CreateClubScreen;
