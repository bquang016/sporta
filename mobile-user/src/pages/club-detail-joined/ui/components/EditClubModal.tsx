import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Button, Avatar } from '../../../../shared/ui';
import { Club, useClubs, getSafeCoverSource, getSafeAvatarSource } from '../../../../entities/club';
import { useAlert } from '../../../../shared/contexts/AlertContext';
import { uploadImageApi } from '../../../../shared/api/upload';
import { ProvincePickerModal, ProvinceItem } from '../../../create-club/ui/components/ProvincePickerModal';
import { WardPickerModal, WardItem } from '../../../create-club/ui/components/WardPickerModal';
import { CoverPickerModal, CoverItem } from '../../../create-club/ui/components/CoverPickerModal';
import { AvatarPickerModal, AvatarItem } from '../../../create-club/ui/components/AvatarPickerModal';

const MOCK_COVERS: CoverItem[] = [
  { id: 'cover-1', name: 'Bóng đá sân cỏ', url: '', color: COLORS.primary },
  { id: 'cover-2', name: 'Bóng rổ rực lửa', url: '', color: COLORS.amber },
  { id: 'cover-3', name: 'Cầu lông năng động', url: '', color: COLORS.primary },
  { id: 'cover-4', name: 'Pickleball nhiệt huyết', url: '', color: COLORS.pickleball },
];

const MOCK_AVATARS: AvatarItem[] = [
  { id: 'avatar-1', name: 'Bóng đá FC', url: '', icon: 'sports-soccer' },
  { id: 'avatar-2', name: 'Bóng rổ Stars', url: '', icon: 'sports-basketball' },
  { id: 'avatar-3', name: 'Cầu lông Pro', url: '', icon: 'sports-tennis' },
  { id: 'avatar-4', name: 'Pickleball Ace', url: '', icon: 'sports-tennis' },
];

const ACTIVITY_LEVELS = ['Hàng tuần', '2-3 buổi/tuần', 'Tự do'];
const ELO_PRESETS = [0, 900, 1200, 1500, 1800, 2100];
const MEMBER_LIMIT_PRESETS = [20, 30, 50, 100];

export interface EditClubModalProps {
  visible: boolean;
  onClose: () => void;
  club: Club;
  onSuccess?: () => void;
}

export function EditClubModal({ visible, onClose, club, onSuccess }: EditClubModalProps) {
  const { updateClub } = useClubs();
  const { showAlert } = useAlert();

  const [name, setName] = useState(club?.name || '');
  const [description, setDescription] = useState(club?.description || '');
  const [area, setArea] = useState(club?.area || '');
  const [ward, setWard] = useState('');
  const [maxMembers, setMaxMembers] = useState(String(club?.maxMembers || 50));
  const [minEloRequired, setMinEloRequired] = useState(String(club?.minEloRequired || 0));
  const [activityLevel, setActivityLevel] = useState(club?.activityLevel || 'Hàng tuần');
  const [isPrivate, setIsPrivate] = useState(!!club?.isPrivate);
  const [coverImage, setCoverImage] = useState(club?.coverImage || MOCK_COVERS[0].url);
  const [avatarImage, setAvatarImage] = useState(club?.avatarImage || MOCK_AVATARS[0].url);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCoverModalVisible, setIsCoverModalVisible] = useState(false);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);

  // Provinces State
  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [isProvinceModalVisible, setIsProvinceModalVisible] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);

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

  // Wards State
  const [wards, setWards] = useState<WardItem[]>([]);
  const [isWardModalVisible, setIsWardModalVisible] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);

  useEffect(() => {
    if (selectedProvinceCode === null) {
      setWards([]);
      return;
    }
    const fetchWards = async () => {
      setLoadingWards(true);
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/v2/p/${selectedProvinceCode}?depth=2`);
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

  useEffect(() => {
    if (club) {
      setName(club.name || '');
      setDescription(club.description || '');
      const rawArea = club.area || '';
      if (rawArea.includes(',')) {
        const parts = rawArea.split(',').map(s => s.trim());
        setWard(parts[0] || '');
        setArea(parts.slice(1).join(', ') || '');
      } else {
        setArea(rawArea);
        setWard('');
      }
      setMaxMembers(String(club.maxMembers || 50));
      setMinEloRequired(String(club.minEloRequired || 0));
      setActivityLevel(club.activityLevel || 'Hàng tuần');
      setIsPrivate(!!club.isPrivate);
      if (club.coverImage) setCoverImage(club.coverImage);
      if (club.avatarImage) setAvatarImage(club.avatarImage);
    }
  }, [club, visible]);

  // Pick Image directly from device's library
  const handlePickFromDevice = async (type: 'avatar' | 'cover') => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showAlert('Cần cấp quyền', 'Vui lòng cấp quyền truy cập thư viện ảnh để đổi ảnh.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: type === 'avatar' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUri = result.assets[0].uri;
        if (type === 'avatar') {
          setIsAvatarModalVisible(false);
          setAvatarImage(pickedUri);
        } else {
          setIsCoverModalVisible(false);
          setCoverImage(pickedUri);
        }

        // Upload image to backend server in background
        try {
          const uploadType = type === 'avatar' ? 'avatar' : 'court_cover';
          const uploadedUrl = await uploadImageApi(pickedUri, uploadType);
          if (type === 'avatar') {
            setAvatarImage(uploadedUrl);
          } else {
            setCoverImage(uploadedUrl);
          }
        } catch (uploadError) {
          console.warn('Lỗi upload ảnh server, sử dụng ảnh thiết bị:', uploadError);
        }
      }
    } catch (err: any) {
      console.error('Lỗi chọn ảnh từ thiết bị:', err);
    }
  };

  const handleSubmit = async () => {
    const numMax = parseInt(maxMembers, 10);
    if (isNaN(numMax) || numMax < 2) {
      showAlert('Lỗi nhập liệu', 'Số lượng thành viên tối đa phải từ 2 người trở lên.');
      return;
    }

    const numMinElo = parseInt(minEloRequired, 10) || 0;
    if (numMinElo < 0) {
      showAlert('Lỗi nhập liệu', 'Yêu cầu Elo tối thiểu không được nhỏ hơn 0.');
      return;
    }

    const finalArea = ward ? `${ward}, ${area}` : area;

    setIsSubmitting(true);
    try {
      await updateClub(club.id, {
        name: name.trim(),
        description: description.trim(),
        area: finalArea.trim(),
        maxMembers: numMax,
        minEloRequired: numMinElo,
        activityLevel,
        isPrivate,
        coverImage,
        avatarImage,
      });

      showAlert('Thành công', 'Đã cập nhật thông tin câu lạc bộ thành công!');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showAlert('Lỗi', err.message || 'Cập nhật thông tin câu lạc bộ thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => !isSubmitting && onClose()}
    >
      <SafeAreaProvider>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          {/* Header */}
          <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.closeButton} 
                activeOpacity={0.7} 
                disabled={isSubmitting}
                onPress={onClose}
              >
                <MaterialIcons name="close" size={22} color={COLORS.onSurface} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Cài đặt câu lạc bộ</Text>
              <TouchableOpacity 
                style={[styles.saveHeaderBtn, isSubmitting && styles.saveHeaderBtnDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveHeaderBtnText}>Lưu</Text>
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          <ScrollView 
            style={styles.scroll} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 1. Cover & Avatar Visual Customizer */}
            <View style={styles.mediaCard}>
              <TouchableOpacity 
                style={styles.coverContainer}
                activeOpacity={0.9}
                onPress={() => setIsCoverModalVisible(true)}
              >
                <Image source={getSafeCoverSource(club?.sport, coverImage)} style={styles.coverImage} resizeMode="cover" />
                <View style={styles.editMediaBadge}>
                  <MaterialIcons name="photo-camera" size={14} color="#FFFFFF" />
                  <Text style={styles.editMediaBadgeText}>Đổi ảnh bìa</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.avatarWrapper}
                activeOpacity={0.9}
                onPress={() => setIsAvatarModalVisible(true)}
              >
                <Image source={getSafeAvatarSource(club?.sport, avatarImage)} style={styles.avatarImage} />
                <View style={styles.avatarCameraBadge}>
                  <MaterialIcons name="photo-camera" size={13} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>

            {/* 2. Basic Information Card */}
            <View style={styles.formCard}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="information-circle" size={18} color={COLORS.primary} />
                <Text style={styles.cardHeaderTitle}>Thông tin cơ bản</Text>
              </View>

              {/* Club Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tên câu lạc bộ <Text style={styles.requiredMark}>*</Text></Text>
                <View style={styles.inputBox}>
                  <MaterialIcons name="badge" size={18} color="#64748B" />
                  <TextInput
                    style={styles.inputField}
                    placeholder="Nhập tên câu lạc bộ..."
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Giới thiệu & Mô tả hoạt động</Text>
                <TextInput
                  style={styles.textareaField}
                  placeholder="Mô tả về câu lạc bộ, tinh thần thi đấu, mục tiêu..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Sport (Readonly) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Môn thể thao</Text>
                <View style={styles.readonlyBox}>
                  <FontAwesome5 name="futbol" size={14} color={COLORS.primary} />
                  <Text style={styles.readonlyText}>{club.sport || 'Bóng đá'}</Text>
                  <Text style={styles.readonlyTag}>Cố định</Text>
                </View>
              </View>
            </View>

            {/* 3. Requirements & Membership Settings */}
            <View style={styles.formCard}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="shield-checkmark" size={18} color="#D97706" />
                <Text style={styles.cardHeaderTitle}>Yêu cầu & Điều kiện gia nhập</Text>
              </View>

              {/* Min Elo Requirement (VERIFIED) */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Yêu cầu Elo tối thiểu</Text>
                  <View style={styles.verifiedTag}>
                    <Ionicons name="checkmark-circle" size={12} color="#059669" />
                    <Text style={styles.verifiedTagText}>Bắt buộc Elo đã xác minh</Text>
                  </View>
                </View>

                {/* Custom Elo Input */}
                <View style={styles.inputBox}>
                  <MaterialIcons name="stars" size={18} color="#D97706" />
                  <TextInput
                    style={styles.inputField}
                    placeholder="Nhập mức Elo (VD: 1200, 1400)..."
                    value={minEloRequired}
                    onChangeText={setMinEloRequired}
                    keyboardType="numeric"
                    placeholderTextColor="#94A3B8"
                  />
                  <Text style={styles.inputSuffix}>Elo</Text>
                </View>

                {/* Quick Presets */}
                <View style={styles.presetChipsRow}>
                  {ELO_PRESETS.map((preset) => {
                    const isSelected = parseInt(minEloRequired, 10) === preset;
                    return (
                      <TouchableOpacity
                        key={preset}
                        style={[styles.presetChip, isSelected && styles.presetChipActive]}
                        onPress={() => setMinEloRequired(String(preset))}
                      >
                        <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                          {preset === 0 ? 'Tự do (0)' : `${preset}+`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.helperRow}>
                  <Ionicons name="information-circle-outline" size={14} color="#64748B" style={{ marginTop: 1 }} />
                  <Text style={styles.helperText}>
                    Thành viên gửi đơn gia nhập bắt buộc phải hoàn thành 5 trận xác minh Elo và đạt từ mức điểm này trở lên.
                  </Text>
                </View>
              </View>

              {/* Privacy Mode (Segmented) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chế độ gia nhập</Text>
                <View style={styles.segmentedToggle}>
                  <TouchableOpacity
                    style={[styles.segmentOption, !isPrivate && styles.segmentOptionActivePublic]}
                    activeOpacity={0.8}
                    onPress={() => setIsPrivate(false)}
                  >
                    <Ionicons name="globe-outline" size={16} color={!isPrivate ? "#059669" : "#64748B"} />
                    <View>
                      <Text style={[styles.segmentTitle, !isPrivate && { color: '#059669', fontWeight: '800' }]}>
                        Công khai
                      </Text>
                      <Text style={styles.segmentSub}>Tự do gia nhập</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.segmentOption, isPrivate && styles.segmentOptionActivePrivate]}
                    activeOpacity={0.8}
                    onPress={() => setIsPrivate(true)}
                  >
                    <Ionicons name="lock-closed" size={16} color={isPrivate ? "#DC2626" : "#64748B"} />
                    <View>
                      <Text style={[styles.segmentTitle, isPrivate && { color: '#DC2626', fontWeight: '800' }]}>
                        Riêng tư
                      </Text>
                      <Text style={styles.segmentSub}>Duyệt đơn thủ công</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Max Members */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quy mô tối đa (Thành viên)</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="people" size={18} color="#64748B" />
                  <TextInput
                    style={styles.inputField}
                    placeholder="VD: 50"
                    value={maxMembers}
                    onChangeText={setMaxMembers}
                    keyboardType="numeric"
                    placeholderTextColor="#94A3B8"
                  />
                  <Text style={styles.inputSuffix}>người</Text>
                </View>

                {/* Member presets */}
                <View style={styles.presetChipsRow}>
                  {MEMBER_LIMIT_PRESETS.map((limit) => {
                    const isSelected = parseInt(maxMembers, 10) === limit;
                    return (
                      <TouchableOpacity
                        key={limit}
                        style={[styles.presetChip, isSelected && styles.presetChipActive]}
                        onPress={() => setMaxMembers(String(limit))}
                      >
                        <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                          {limit} người
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* 4. Area & Activity Frequency */}
            <View style={styles.formCard}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="location" size={18} color="#059669" />
                <Text style={styles.cardHeaderTitle}>Địa bàn & Mức độ sinh hoạt</Text>
              </View>

              {/* Province Picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tỉnh / Thành phố</Text>
                <TouchableOpacity 
                  style={styles.selectorBtn}
                  onPress={() => setIsProvinceModalVisible(true)}
                >
                  <Ionicons name="business-outline" size={17} color="#64748B" />
                  <Text style={[styles.selectorText, !area && styles.selectorTextPlaceholder]}>
                    {area || 'Chọn tỉnh thành...'}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Ward Picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quận / Huyện / Phường</Text>
                <TouchableOpacity 
                  style={[styles.selectorBtn, !selectedProvinceCode && styles.selectorBtnDisabled]}
                  disabled={!selectedProvinceCode}
                  onPress={() => setIsWardModalVisible(true)}
                >
                  <Ionicons name="map-outline" size={17} color="#64748B" />
                  <Text style={[styles.selectorText, !ward && styles.selectorTextPlaceholder]}>
                    {ward || (selectedProvinceCode ? 'Chọn phường xã...' : 'Vui lòng chọn tỉnh thành trước')}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Activity Level */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mức độ hoạt động</Text>
                <View style={styles.presetChipsRow}>
                  {ACTIVITY_LEVELS.map((lvl) => {
                    const isSelected = activityLevel === lvl;
                    return (
                      <TouchableOpacity
                        key={lvl}
                        style={[styles.activityChip, isSelected && styles.activityChipActive]}
                        onPress={() => setActivityLevel(lvl)}
                      >
                        <Ionicons 
                          name="time-outline" 
                          size={13} 
                          color={isSelected ? COLORS.primary : "#64748B"} 
                        />
                        <Text style={[styles.activityChipText, isSelected && styles.activityChipTextActive]}>
                          {lvl}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity 
              style={[styles.saveMainBtn, isSubmitting && styles.saveMainBtnDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.saveMainBtnText}>Lưu thay đổi cài đặt</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaProvider>

      {/* Media & Location Pickers */}
      <CoverPickerModal
        visible={isCoverModalVisible}
        onClose={() => setIsCoverModalVisible(false)}
        covers={MOCK_COVERS}
        onSelectCover={(cover: CoverItem) => {
          setCoverImage(cover.url);
          setIsCoverModalVisible(false);
        }}
        onPickFromLibrary={() => handlePickFromDevice('cover')}
      />

      <AvatarPickerModal
        visible={isAvatarModalVisible}
        onClose={() => setIsAvatarModalVisible(false)}
        avatars={MOCK_AVATARS}
        onSelectAvatar={(avatar: AvatarItem) => {
          setAvatarImage(avatar.url);
          setIsAvatarModalVisible(false);
        }}
        onPickFromLibrary={() => handlePickFromDevice('avatar')}
      />

      <ProvincePickerModal
        visible={isProvinceModalVisible}
        onClose={() => setIsProvinceModalVisible(false)}
        provinces={provinces}
        loading={loadingProvinces}
        onSelectProvince={(pName: string, pCode: number) => {
          setArea(pName);
          setSelectedProvinceCode(pCode);
          setWard('');
          setIsProvinceModalVisible(false);
        }}
      />

      <WardPickerModal
        visible={isWardModalVisible}
        onClose={() => setIsWardModalVisible(false)}
        wards={wards}
        loading={loadingWards}
        onSelectWard={(wName: string) => {
          setWard(wName);
          setIsWardModalVisible(false);
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerSafeArea: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  saveHeaderBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 54,
    alignItems: 'center',
  },
  saveHeaderBtnDisabled: {
    opacity: 0.6,
  },
  saveHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },

  /* 1. Media Visual Customizer */
  mediaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  coverContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  editMediaBadge: {
    position: 'absolute',
    right: 12,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editMediaBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  avatarWrapper: {
    position: 'relative',
    marginTop: -36,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  avatarCameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  /* Form Cards */
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  requiredMark: {
    color: '#EF4444',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 8,
  },
  inputField: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
  },
  inputSuffix: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  textareaField: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    fontSize: 13,
    color: '#0F172A',
    minHeight: 80,
  },
  readonlyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  readonlyText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  readonlyTag: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  presetChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  presetChipTextActive: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    marginTop: 3,
  },
  helperText: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  segmentedToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  segmentOptionActivePublic: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  segmentOptionActivePrivate: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  segmentTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  segmentSub: {
    fontSize: 10.5,
    color: '#64748B',
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 8,
  },
  selectorBtnDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  selectorText: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  selectorTextPlaceholder: {
    color: '#94A3B8',
  },
  activityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  activityChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  activityChipTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  saveMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  saveMainBtnDisabled: {
    opacity: 0.6,
  },
  saveMainBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
