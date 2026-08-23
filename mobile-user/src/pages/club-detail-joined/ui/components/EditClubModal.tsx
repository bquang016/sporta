import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Switch, 
  Image, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Button, Avatar } from '../../../../shared/ui';
import { Club, useClubs } from '../../../../entities/club';
import { useAlert } from '../../../../shared/contexts/AlertContext';
import { uploadImageApi } from '../../../../shared/api/upload';
import { ProvincePickerModal, ProvinceItem } from '../../../create-club/ui/components/ProvincePickerModal';
import { WardPickerModal, WardItem } from '../../../create-club/ui/components/WardPickerModal';
import { CoverPickerModal, CoverItem } from '../../../create-club/ui/components/CoverPickerModal';
import { AvatarPickerModal, AvatarItem } from '../../../create-club/ui/components/AvatarPickerModal';

const MOCK_COVERS: CoverItem[] = [
  { id: 'cover-1', name: 'Bóng đá sân cỏ', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80', color: COLORS.primary },
  { id: 'cover-2', name: 'Bóng rổ rực lửa', url: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800&auto=format&fit=crop&q=80', color: COLORS.amber },
  { id: 'cover-3', name: 'Cầu lông năng động', url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80', color: COLORS.primary },
  { id: 'cover-4', name: 'Pickleball nhiệt huyết', url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80', color: COLORS.pickleball },
];

const MOCK_AVATARS: AvatarItem[] = [
  { id: 'avatar-1', name: 'Hải âu', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80', icon: 'sports-soccer' },
  { id: 'avatar-2', name: 'Chiến binh', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80', icon: 'sports-basketball' },
  { id: 'avatar-3', name: 'Bồ câu', url: 'https://images.unsplash.com/photo-1527983359383-4758693f760c?w=200&auto=format&fit=crop&q=80', icon: 'sports-cricket' },
  { id: 'avatar-4', name: 'Sư tử', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', icon: 'sports-tennis' },
];

const ACTIVITY_LEVELS = ['Hàng tuần', '2-3 buổi/tuần', 'Tự do'];

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
  const [maxMembers, setMaxMembers] = useState(String(club?.maxMembers || 30));
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
      setMaxMembers(String(club.maxMembers || 30));
      setActivityLevel(club.activityLevel || 'Hàng tuần');
      setIsPrivate(!!club.isPrivate);
      if (club.coverImage) setCoverImage(club.coverImage);
      if (club.avatarImage) setAvatarImage(club.avatarImage);
    }
  }, [club, visible]);

  // Pick Image directly from device's library
  const pickImageFromLibrary = async (type: 'avatar' | 'cover') => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showAlert('Quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

    const finalArea = ward ? `${ward}, ${area}` : area;

    setIsSubmitting(true);
    try {
      await updateClub(club.id, {
        name: name.trim(),
        description: description.trim(),
        area: finalArea.trim(),
        maxMembers: numMax,
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
        <View style={styles.container}>
          <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.closeButton} 
                activeOpacity={0.7} 
                disabled={isSubmitting}
                onPress={onClose}
              >
                <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Sửa thông tin CLB</Text>
              <View style={styles.headerPlaceholder} />
            </View>
          </SafeAreaView>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Cover & Avatar Selector */}
            <View style={styles.mediaSection}>
              <TouchableOpacity 
                style={styles.coverContainer}
                activeOpacity={0.9}
                onPress={() => setIsCoverModalVisible(true)}
              >
                {coverImage && typeof coverImage === 'string' && !coverImage.startsWith('blob:') ? (
                  <Image source={{ uri: coverImage }} style={styles.coverImage} />
                ) : (
                  <View style={[styles.coverImage, { backgroundColor: COLORS.primary }]} />
                )}
                <View style={styles.editMediaBadge}>
                  <MaterialIcons name="photo-camera" size={16} color={COLORS.white} />
                  <Text style={styles.editMediaBadgeText}>Đổi ảnh bìa</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.avatarContainer}
                activeOpacity={0.9}
                onPress={() => setIsAvatarModalVisible(true)}
              >
                <Avatar 
                  source={avatarImage} 
                  size={80} 
                  fallbackIcon="groups"
                  style={styles.avatarImage} 
                />
                <View style={styles.avatarEditBadge}>
                  <MaterialIcons name="edit" size={14} color={COLORS.white} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              {/* Club Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tên câu lạc bộ</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Nhập tên câu lạc bộ..."
                  placeholderTextColor={COLORS.outline}
                />
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Giới thiệu câu lạc bộ</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Nhập mô tả chi tiết về câu lạc bộ..."
                  placeholderTextColor={COLORS.outline}
                  textAlignVertical="top"
                />
              </View>

              {/* Activity Area - Province & Ward Picker API */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Khu vực / Địa điểm hoạt động</Text>
                
                <View style={styles.locationRow}>
                  {/* Province Selection */}
                  <View style={styles.locationCol}>
                    <TouchableOpacity
                      style={[styles.input, styles.dropdownInput]}
                      activeOpacity={0.8}
                      onPress={() => setIsProvinceModalVisible(true)}
                    >
                      <Text 
                        style={[
                          styles.dropdownInputText,
                          !area ? styles.dropdownPlaceholderText : null
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {area || 'Chọn tỉnh, TP...'}
                      </Text>
                      <MaterialIcons name="arrow-drop-down" size={24} color={COLORS.outline} />
                    </TouchableOpacity>
                  </View>

                  {/* Ward Selection */}
                  <View style={styles.locationCol}>
                    <TouchableOpacity
                      style={[
                        styles.input,
                        styles.dropdownInput,
                        !area && styles.dropdownDisabled
                      ]}
                      activeOpacity={0.8}
                      onPress={() => area && setIsWardModalVisible(true)}
                      disabled={!area}
                    >
                      <Text 
                        style={[
                          styles.dropdownInputText,
                          !ward ? styles.dropdownPlaceholderText : null,
                          !area ? styles.dropdownDisabledText : null
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {ward || (area ? 'Chọn phường, xã...' : 'Chọn tỉnh, TP...')}
                      </Text>
                      <MaterialIcons 
                        name="arrow-drop-down" 
                        size={24} 
                        color={area ? COLORS.outline : COLORS.outlineVariant} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Max Members */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Số lượng thành viên tối đa</Text>
                <TextInput
                  style={styles.input}
                  value={maxMembers}
                  onChangeText={setMaxMembers}
                  keyboardType="numeric"
                  placeholder="30"
                  placeholderTextColor={COLORS.outline}
                />
              </View>

              {/* Activity Level Chips */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tần suất hoạt động</Text>
                <View style={styles.chipsRow}>
                  {ACTIVITY_LEVELS.map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.chip,
                        activityLevel === level && styles.chipActive
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setActivityLevel(level)}
                    >
                      <Text style={[
                        styles.chipText,
                        activityLevel === level && styles.chipTextActive
                      ]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Privacy Switch */}
              <View style={styles.switchRow}>
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchTitle}>Câu lạc bộ riêng tư</Text>
                  <Text style={styles.switchSubtitle}>
                    {isPrivate 
                      ? 'Thành viên mới phải gửi yêu cầu và chờ Trưởng nhóm phê duyệt'
                      : 'Mọi người có thể tham gia câu lạc bộ tự do'}
                  </Text>
                </View>
                <Switch
                  value={isPrivate}
                  onValueChange={setIsPrivate}
                  trackColor={{ false: COLORS.outlineVariant, true: COLORS.primaryOpacity30 || COLORS.primary }}
                  thumbColor={isPrivate ? COLORS.primary : COLORS.surface}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer Submit Button */}
          <View style={styles.footer}>
            <Button
              title="Lưu thay đổi"
              loading={isSubmitting}
              onPress={handleSubmit}
              style={styles.submitBtn}
            />
          </View>
        </View>

        {/* Province Picker Modal API */}
        <ProvincePickerModal
          visible={isProvinceModalVisible}
          onClose={() => setIsProvinceModalVisible(false)}
          provinces={provinces}
          onSelectProvince={(provinceName, provinceCode) => {
            setArea(provinceName);
            setSelectedProvinceCode(provinceCode);
            setWard('');
          }}
          loading={loadingProvinces}
        />

        {/* Ward Picker Modal API */}
        <WardPickerModal
          visible={isWardModalVisible}
          onClose={() => setIsWardModalVisible(false)}
          wards={wards}
          onSelectWard={(wardName) => setWard(wardName)}
          loading={loadingWards}
        />

        {/* Cover Image Picker Modal */}
        <CoverPickerModal
          visible={isCoverModalVisible}
          onClose={() => setIsCoverModalVisible(false)}
          covers={MOCK_COVERS}
          onSelectCover={(coverItem) => {
            setCoverImage(coverItem.url);
            setIsCoverModalVisible(false);
          }}
          onPickFromLibrary={() => pickImageFromLibrary('cover')}
        />

        {/* Avatar Image Picker Modal */}
        <AvatarPickerModal
          visible={isAvatarModalVisible}
          onClose={() => setIsAvatarModalVisible(false)}
          avatars={MOCK_AVATARS}
          onSelectAvatar={(avatarItem) => {
            setAvatarImage(avatarItem.url);
            setIsAvatarModalVisible(false);
          }}
          onPickFromLibrary={() => pickImageFromLibrary('avatar')}
        />
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  headerSafeArea: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    height: 56,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  headerPlaceholder: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  mediaSection: {
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  coverContainer: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.surfaceContainerLow,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  editMediaBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.blackOpacity50,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    gap: 6,
  },
  editMediaBadgeText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -24,
    left: SPACING.marginMobile,
    width: 68,
    height: 68,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 3,
    borderColor: COLORS.surface,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.blackOpacity50,
    alignItems: 'center',
    paddingVertical: 3,
  },
  pickerOptionsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.marginMobile,
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  pickerOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.primaryOpacity08,
    borderRadius: BORDER_RADIUS.default,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity30,
    gap: SPACING.xs,
  },
  pickerOptionBtnText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
  formContainer: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl * 2,
    gap: SPACING.lg,
  },
  inputGroup: {
    gap: SPACING.xs + 2,
  },
  label: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.default,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: 14,
    color: COLORS.onSurface,
    backgroundColor: COLORS.surface,
  },
  readOnlyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.default,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  readOnlyText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  textArea: {
    height: 100,
  },
  locationRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  locationCol: {
    flex: 1,
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: SPACING.xs,
  },
  dropdownInputText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurface,
    flex: 1,
  },
  dropdownPlaceholderText: {
    color: COLORS.outline,
  },
  dropdownDisabled: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderColor: COLORS.outlineVariant,
  },
  dropdownDisabledText: {
    color: COLORS.outlineVariant,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surface,
  },
  chipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryOpacity08,
  },
  chipText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  chipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    gap: SPACING.md,
  },
  switchTextContainer: {
    flex: 1,
  },
  switchTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  switchSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  footer: {
    padding: SPACING.marginMobile,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },
  submitBtn: {
    width: '100%',
  },
});
