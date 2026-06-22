import React, { useState } from 'react';
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
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button, Card, Badge } from '../../../shared/ui';
import { useClubs } from '../../../entities/club';

// Mock Cover Images (Gradients and free Unsplash URLs)
const MOCK_COVERS = [
  { id: 'cover-1', name: 'Bóng đá sân cỏ', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60', color: '#064E3B' },
  { id: 'cover-2', name: 'Bóng rổ rực lửa', url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=60', color: '#B45309' },
  { id: 'cover-3', name: 'Cầu lông năng động', url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=60', color: '#1E3A8A' },
  { id: 'cover-4', name: 'Pickleball nhiệt huyết', url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=60', color: '#0D9488' }
];

// Mock Avatar Images
const MOCK_AVATARS = [
  { id: 'avatar-1', name: 'Hải âu', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', icon: 'sports-soccer' },
  { id: 'avatar-2', name: 'Chiến binh', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80', icon: 'sports-basketball' },
  { id: 'avatar-3', name: 'Bồ câu', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', icon: 'sports-cricket' },
  { id: 'avatar-4', name: 'Sư tử', url: 'https://images.unsplash.com/photo-1527983359383-4758693f760c?w=150&auto=format&fit=crop&q=80', icon: 'sports-tennis' }
];

const SPORTS_LIST = [
  { name: 'Bóng đá', icon: 'sports-soccer' },
  { name: 'Bóng rổ', icon: 'sports-basketball' },
  { name: 'Cầu lông', icon: 'sports-cricket' },
  { name: 'Pickleball', icon: 'sports-tennis' }
];

export function CreateClubScreen() {
  const router = useRouter();
  const { createClub } = useClubs();

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sport, setSport] = useState('Bóng đá');
  const [area, setArea] = useState('');
  const [maxMembers, setMaxMembers] = useState(30);
  const [isPrivate, setIsPrivate] = useState(false);
  
  // Pickers State
  const [selectedCover, setSelectedCover] = useState(MOCK_COVERS[0]);
  const [selectedAvatar, setSelectedAvatar] = useState(MOCK_AVATARS[0]);
  const [isCoverModalVisible, setIsCoverModalVisible] = useState(false);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);

  // Field Focus State
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Error State
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDecrement = () => {
    if (maxMembers > 2) {
      setMaxMembers(prev => prev - 1);
    }
  };

  const handleIncrement = () => {
    if (maxMembers < 50) {
      setMaxMembers(prev => prev + 1);
    }
  };

  const handleNumberChange = (val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    if (!cleanVal) {
      setMaxMembers(2);
      return;
    }
    const num = parseInt(cleanVal, 10);
    if (num > 50) {
      setMaxMembers(50);
    } else if (num < 2) {
      setMaxMembers(2);
    } else {
      setMaxMembers(num);
    }
  };

  // Custom Alert Modal State
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!name.trim()) tempErrors.name = 'Tên câu lạc bộ không được để trống';
    if (!area.trim()) tempErrors.area = 'Khu vực hoạt động không được để trống';
    if (!description.trim()) tempErrors.description = 'Mô tả hoạt động không được để trống';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      setAlertTitle('Lỗi nhập liệu');
      setAlertMessage('Vui lòng điền đầy đủ thông tin bắt buộc.');
      setAlertType('error');
      setIsAlertVisible(true);
      return;
    }

    const sportIcon = SPORTS_LIST.find(s => s.name === sport)?.icon || 'sports-soccer';

    createClub({
      name: name.trim(),
      description: description.trim(),
      sport,
      sportIcon,
      maxMembers,
      isPrivate,
      coverImage: selectedCover.url,
      avatarImage: selectedAvatar.url,
      area: area.trim(),
      activityLevel: 'Mới thành lập'
    });

    setAlertTitle('Thành công');
    setAlertMessage(`Đã tạo thành công câu lạc bộ "${name}"!`);
    setAlertType('success');
    setIsAlertVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          activeOpacity={0.7} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          Tạo câu lạc bộ mới
        </Text>
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
          {/* Images Section */}
          <View style={styles.imagesContainer}>
            {/* Cover Image Picker */}
            <TouchableOpacity 
              style={styles.coverPicker} 
              activeOpacity={0.9} 
              onPress={() => setIsCoverModalVisible(true)}
            >
              <Image source={{ uri: selectedCover.url }} style={styles.coverImage} />
              <View style={styles.coverOverlay}>
                <MaterialIcons name="photo-camera" size={20} color="#FFFFFF" />
                <Text style={styles.changeCoverText}>Đổi ảnh bìa</Text>
              </View>
            </TouchableOpacity>

            {/* Avatar Picker */}
            <TouchableOpacity 
              style={styles.avatarPickerContainer} 
              activeOpacity={0.9} 
              onPress={() => setIsAvatarModalVisible(true)}
            >
              <Image source={{ uri: selectedAvatar.url }} style={styles.avatarImage} />
              <View style={styles.avatarOverlay}>
                <MaterialIcons name="photo-camera" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Club Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên câu lạc bộ <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'name' && styles.inputFocused,
                  errors.name ? styles.inputError : null
                ]}
                placeholder="Nhập tên câu lạc bộ..."
                placeholderTextColor={COLORS.outline}
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            {/* Sport Category selection (Chips) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Môn thể thao hoạt động</Text>
              <View style={styles.sportsGrid}>
                {SPORTS_LIST.map((item) => {
                  const isSelected = sport === item.name;
                  return (
                    <TouchableOpacity
                      key={item.name}
                      style={[
                        styles.sportChip,
                        isSelected && styles.sportChipActive
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setSport(item.name)}
                    >
                      <MaterialIcons 
                        name={item.icon as any} 
                        size={18} 
                        color={isSelected ? COLORS.primary : COLORS.onSurfaceVariant} 
                      />
                      <Text style={[
                        styles.sportChipText,
                        isSelected && styles.sportChipTextActive
                      ]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Activity Area */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Khu vực hoạt động <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'area' && styles.inputFocused,
                  errors.area ? styles.inputError : null
                ]}
                placeholder="Ví dụ: Quận Cầu Giấy, Hà Nội..."
                placeholderTextColor={COLORS.outline}
                value={area}
                onChangeText={setArea}
                onFocus={() => setFocusedField('area')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.area ? <Text style={styles.errorText}>{errors.area}</Text> : null}
            </View>

            {/* Member Limit */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Giới hạn thành viên (Tối đa 50)</Text>
              <View style={styles.memberLimitContainer}>
                <TouchableOpacity 
                  style={[styles.counterBtn, maxMembers <= 2 && styles.counterBtnDisabled]} 
                  onPress={handleDecrement}
                  disabled={maxMembers <= 2}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="remove" size={20} color={maxMembers <= 2 ? COLORS.outlineVariant : COLORS.primary} />
                </TouchableOpacity>
                
                <TextInput
                  style={styles.counterInput}
                  keyboardType="numeric"
                  value={maxMembers.toString()}
                  onChangeText={handleNumberChange}
                />
                
                <TouchableOpacity 
                  style={[styles.counterBtn, maxMembers >= 50 && styles.counterBtnDisabled]} 
                  onPress={handleIncrement}
                  disabled={maxMembers >= 50}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="add" size={20} color={maxMembers >= 50 ? COLORS.outlineVariant : COLORS.primary} />
                </TouchableOpacity>

                <Text style={styles.counterSuffix}>thành viên</Text>
              </View>
              <Text style={styles.helperText}>Giới hạn tối thiểu là 2 và tối đa là 50 người.</Text>
            </View>

            {/* Bio / Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mô tả / Tiểu sử câu lạc bộ <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[
                  styles.input,
                  styles.multilineInput,
                  focusedField === 'description' && styles.inputFocused,
                  errors.description ? styles.inputError : null
                ]}
                placeholder="Nhập mô tả hoạt động, thời gian sinh hoạt, trình độ của thành viên..."
                placeholderTextColor={COLORS.outline}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
            </View>

            {/* Privacy Setting (Public/Private Cards) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quyền riêng tư câu lạc bộ</Text>
              <View style={styles.privacyContainer}>
                {/* Public Option */}
                <TouchableOpacity
                  style={[
                    styles.privacyCard,
                    !isPrivate && styles.privacyCardActive
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setIsPrivate(false)}
                >
                  <View style={styles.privacyHeader}>
                    <MaterialIcons 
                      name="lock-open" 
                      size={20} 
                      color={!isPrivate ? COLORS.primary : COLORS.onSurfaceVariant} 
                    />
                    <Text style={[
                      styles.privacyTitle,
                      !isPrivate && styles.privacyTitleActive
                    ]}>
                      Công khai
                    </Text>
                  </View>
                  <Text style={styles.privacyDesc}>
                    Bất kỳ ai cũng có thể vào trực tiếp CLB để giao lưu mà không cần duyệt.
                  </Text>
                </TouchableOpacity>

                {/* Private Option */}
                <TouchableOpacity
                  style={[
                    styles.privacyCard,
                    isPrivate && styles.privacyCardActive
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setIsPrivate(true)}
                >
                  <View style={styles.privacyHeader}>
                    <MaterialIcons 
                      name="lock" 
                      size={20} 
                      color={isPrivate ? COLORS.primary : COLORS.onSurfaceVariant} 
                    />
                    <Text style={[
                      styles.privacyTitle,
                      isPrivate && styles.privacyTitleActive
                    ]}>
                      Riêng tư
                    </Text>
                  </View>
                  <Text style={styles.privacyDesc}>
                    Yêu cầu chủ câu lạc bộ phê duyệt đơn xin tham gia mới có thể vào.
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <Button
              variant="primary"
              title="Tạo câu lạc bộ"
              icon="add-circle"
              style={styles.submitBtn}
              onPress={handleSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Alert Modal */}
      <Modal
        visible={isAlertVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setIsAlertVisible(false);
          if (alertType === 'success') {
            router.push('/my-clubs');
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
                  router.push('/my-clubs');
                }
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Cover Image Picker Modal */}
      <Modal
        visible={isCoverModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCoverModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ảnh bìa mẫu</Text>
              <TouchableOpacity onPress={() => setIsCoverModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalGrid}>
              {MOCK_COVERS.map((cover) => (
                <TouchableOpacity
                  key={cover.id}
                  style={styles.coverThumbnailContainer}
                  onPress={() => {
                    setSelectedCover(cover);
                    setIsCoverModalVisible(false);
                  }}
                >
                  <Image source={{ uri: cover.url }} style={styles.coverThumbnail} />
                  <Text style={styles.thumbnailLabel}>{cover.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Avatar Picker Modal */}
      <Modal
        visible={isAvatarModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAvatarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ảnh đại diện mẫu</Text>
              <TouchableOpacity onPress={() => setIsAvatarModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalGridAvatars}>
              {MOCK_AVATARS.map((avatar) => (
                <TouchableOpacity
                  key={avatar.id}
                  style={styles.avatarThumbnailContainer}
                  onPress={() => {
                    setSelectedAvatar(avatar);
                    setIsAvatarModalVisible(false);
                  }}
                >
                  <Image source={{ uri: avatar.url }} style={styles.avatarThumbnail} />
                  <Text style={styles.thumbnailLabel}>{avatar.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    height: 56,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(6, 78, 59, 0.1)',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: SPACING.xl * 2,
  },
  imagesContainer: {
    height: 180,
    backgroundColor: COLORS.surfaceContainerLow,
    position: 'relative',
    marginBottom: 40, // space for overlapping avatar
  },
  coverPicker: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.xl,
    gap: 4,
  },
  changeCoverText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
  },
  avatarPickerContainer: {
    position: 'absolute',
    bottom: -30,
    left: SPACING.marginMobile,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.surface,
    backgroundColor: COLORS.surfaceContainer,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    paddingHorizontal: SPACING.marginMobile,
    gap: SPACING.lg,
  },
  inputGroup: {
    gap: SPACING.base,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.2)',
    borderRadius: BORDER_RADIUS.default,
    paddingHorizontal: SPACING.sm,
    height: 48,
    fontSize: 14,
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  multilineInput: {
    height: 100,
    paddingVertical: SPACING.sm,
    textAlignVertical: 'top',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    marginTop: -4,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: SPACING.base,
  },
  sportChip: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.default,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.12)',
    gap: SPACING.base,
  },
  sportChipActive: {
    backgroundColor: 'rgba(6, 78, 59, 0.05)',
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  sportChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
  },
  sportChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  memberLimitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
  },
  counterBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.default,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.2)',
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnDisabled: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderColor: COLORS.outlineVariant,
  },
  counterInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.2)',
    borderRadius: BORDER_RADIUS.default,
    backgroundColor: COLORS.surface,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurface,
    padding: 0,
  },
  counterSuffix: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.outline,
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
  },
  privacyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  privacyCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.12)',
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  privacyCardActive: {
    backgroundColor: 'rgba(6, 78, 59, 0.05)',
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
  },
  privacyTitleActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  privacyDesc: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    lineHeight: 16,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    marginTop: SPACING.xs,
  },
  submitBtn: {
    marginTop: SPACING.md,
    height: 48,
    borderRadius: BORDER_RADIUS.default,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(6, 78, 59, 0.1)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
  },
  modalGrid: {
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  modalGridAvatars: {
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  coverThumbnailContainer: {
    width: '100%',
    height: 100,
    borderRadius: BORDER_RADIUS.default,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.12)',
  },
  coverThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarThumbnailContainer: {
    width: '45%',
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.default,
    overflow: 'hidden',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.12)',
    paddingTop: SPACING.base,
  },
  avatarThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 30,
    resizeMode: 'cover',
  },
  thumbnailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    marginTop: 4,
    textAlign: 'center',
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingVertical: 2,
  },
  alertModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  alertModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  modalAlertIcon: {
    marginBottom: SPACING.md,
  },
  alertModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  alertModalMessage: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
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
