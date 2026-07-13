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
import { Button } from '../../../shared/ui';
import { useClubs } from '../../../entities/club';
import { CoverPickerModal, CoverItem } from './components/CoverPickerModal';
import { AvatarPickerModal, AvatarItem } from './components/AvatarPickerModal';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageApi } from '../../../shared/api/upload';
import { ProvincePickerModal, ProvinceItem } from './components/ProvincePickerModal';
import { WardPickerModal, WardItem } from './components/WardPickerModal';
import { useEffect } from 'react';

// Mock Cover Images (Gradients and free Unsplash URLs)
const MOCK_COVERS: CoverItem[] = [
  { id: 'cover-1', name: 'Bóng đá sân cỏ', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60', color: COLORS.primary },
  { id: 'cover-2', name: 'Bóng rổ rực lửa', url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=60', color: COLORS.amber },
  { id: 'cover-3', name: 'Cầu lông năng động', url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=60', color: '#1E3A8A' },
  { id: 'cover-4', name: 'Pickleball nhiệt huyết', url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=60', color: COLORS.pickleball }
];

// Mock Avatar Images
const MOCK_AVATARS: AvatarItem[] = [
  { id: 'avatar-1', name: 'Hải âu', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', icon: 'sports-soccer' },
  { id: 'avatar-2', name: 'Chiến binh', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80', icon: 'sports-basketball' },
  { id: 'avatar-3', name: 'Bồ câu', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', icon: 'sports-cricket' },
  { id: 'avatar-4', name: 'Sư tử', url: 'https://images.unsplash.com/photo-1527983359383-4758693f760c?w=150&auto=format&fit=crop&q=80', icon: 'sports-tennis' }
];

const SPORTS_LIST = [
  { id: 1, name: 'Bóng đá', icon: 'sports-soccer' },
  { id: 2, name: 'Cầu lông', icon: 'sports-cricket' },
  { id: 3, name: 'Pickleball', icon: 'sports-tennis' },
  { id: 4, name: 'Bóng rổ', icon: 'sports-basketball' }
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
  const [submitting, setSubmitting] = useState(false);
  
  // Pickers State
  const [selectedCover, setSelectedCover] = useState(MOCK_COVERS[0]);
  const [selectedAvatar, setSelectedAvatar] = useState(MOCK_AVATARS[0]);
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
  const [ward, setWard] = useState('');
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

  const pickImageFromLibrary = async (type: 'avatar' | 'cover') => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      setAlertTitle('Quyền truy cập');
      setAlertMessage('Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh.');
      setAlertType('error');
      setIsAlertVisible(true);
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

      // Close pickers immediately for smooth UX
      if (type === 'avatar') {
        setIsAvatarModalVisible(false);
      } else {
        setIsCoverModalVisible(false);
      }

      // Try uploading to backend
      try {
        const uploadType = type === 'avatar' ? 'avatar' : 'court_cover';
        const uploadedUrl = await uploadImageApi(pickedUri, uploadType);
        
        if (type === 'avatar') {
          setSelectedAvatar({
            id: `custom-avatar-${Date.now()}`,
            name: 'Ảnh thiết bị',
            url: uploadedUrl,
            icon: 'portrait'
          });
        } else {
          setSelectedCover({
            id: `custom-cover-${Date.now()}`,
            name: 'Ảnh thiết bị',
            url: uploadedUrl,
            color: COLORS.primary
          });
        }
      } catch (error) {
        // Fallback to local device URI if offline/error
        if (type === 'avatar') {
          setSelectedAvatar({
            id: `custom-avatar-${Date.now()}`,
            name: 'Ảnh thiết bị',
            url: pickedUri,
            icon: 'portrait'
          });
        } else {
          setSelectedCover({
            id: `custom-cover-${Date.now()}`,
            name: 'Ảnh thiết bị',
            url: pickedUri,
            color: COLORS.primary
          });
        }
      }
    }
  };

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
    if (!ward.trim()) tempErrors.ward = 'Phường/Xã không được để trống';
    if (!description.trim()) tempErrors.description = 'Mô tả hoạt động không được để trống';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setAlertTitle('Lỗi nhập liệu');
      setAlertMessage('Vui lòng điền đầy đủ thông tin bắt buộc.');
      setAlertType('error');
      setIsAlertVisible(true);
      return;
    }

    setSubmitting(true);
    try {
      const selectedSportItem = SPORTS_LIST.find(s => s.name === sport);
      const sportId = selectedSportItem ? selectedSportItem.id : 1;
      const fullArea = `${ward}, ${area}`;

      await createClub({
        name: name.trim(),
        description: description.trim(),
        sportId,
        maxMembers,
        isPrivate,
        coverImage: selectedCover.url,
        avatarImage: selectedAvatar.url,
        area: fullArea,
        activityLevel: 'Mới thành lập'
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
                <MaterialIcons name="photo-camera" size={20} color={COLORS.white} />
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
                <MaterialIcons name="photo-camera" size={16} color={COLORS.white} />
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
              
              <View style={styles.locationRow}>
                {/* Province Selection */}
                <View style={styles.locationCol}>
                  <TouchableOpacity
                    style={[
                      styles.input,
                      styles.dropdownInput,
                      errors.area ? styles.inputError : null
                    ]}
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
                      !area && styles.dropdownDisabled,
                      errors.ward ? styles.inputError : null
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
              {errors.area ? <Text style={styles.errorText}>{errors.area}</Text> : null}
              {errors.ward ? <Text style={styles.errorText}>{errors.ward}</Text> : null}
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
              title={submitting ? 'Đang tạo...' : 'Tạo câu lạc bộ'}
              icon="add-circle"
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={submitting}
              loading={submitting}
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
            router.replace('/my-clubs');
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
                  router.replace('/my-clubs');
                }
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Reusable Cover Picker Modal */}
      <CoverPickerModal 
        visible={isCoverModalVisible}
        onClose={() => setIsCoverModalVisible(false)}
        covers={MOCK_COVERS}
        onSelectCover={(cover) => {
          setSelectedCover(cover);
          setIsCoverModalVisible(false);
        }}
        onPickFromLibrary={() => pickImageFromLibrary('cover')}
      />

      {/* Reusable Avatar Picker Modal */}
      <AvatarPickerModal 
        visible={isAvatarModalVisible}
        onClose={() => setIsAvatarModalVisible(false)}
        avatars={MOCK_AVATARS}
        onSelectAvatar={(avatar) => {
          setSelectedAvatar(avatar);
          setIsAvatarModalVisible(false);
        }}
        onPickFromLibrary={() => pickImageFromLibrary('avatar')}
      />

      {/* Reusable Province Picker Modal */}
      <ProvincePickerModal
        visible={isProvinceModalVisible}
        onClose={() => setIsProvinceModalVisible(false)}
        provinces={provinces}
        onSelectProvince={(name, code) => {
          setArea(name);
          setSelectedProvinceCode(code);
          setWard(''); // Reset ward on province change
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
    borderBottomColor: COLORS.primaryOpacity10,
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
    color: COLORS.primary,
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
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.blackOpacity50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.xs,
  },
  changeCoverText: {
    color: COLORS.white,
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
  },
  avatarPickerContainer: {
    position: 'absolute',
    bottom: -30,
    left: SPACING.marginMobile,
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 3,
    borderColor: COLORS.surface,
    backgroundColor: COLORS.surfaceContainer,
    overflow: 'hidden',
    shadowColor: COLORS.shadowBlack,
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
    backgroundColor: COLORS.blackOpacity30,
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
    color: COLORS.onSurface,
    ...TYPOGRAPHY.labelMd,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity20,
    borderRadius: BORDER_RADIUS.default,
    paddingHorizontal: SPACING.sm,
    height: 48,
    color: COLORS.onSurface,
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: SPACING.xs,
  },
  dropdownInputText: {
    color: COLORS.onSurface,
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
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
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  locationCol: {
    flex: 1,
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
    ...TYPOGRAPHY.labelSm,
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
    borderColor: COLORS.primaryOpacity12,
    gap: SPACING.base,
  },
  sportChipActive: {
    backgroundColor: COLORS.primaryOpacity05,
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  sportChipText: {
    color: COLORS.onSurfaceVariant,
    ...TYPOGRAPHY.labelMd,
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
    borderColor: COLORS.primaryOpacity20,
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
    borderColor: COLORS.primaryOpacity20,
    borderRadius: BORDER_RADIUS.default,
    backgroundColor: COLORS.surface,
    textAlign: 'center',
    ...TYPOGRAPHY.bodyMd,
    fontFamily: 'HankenGrotesk-SemiBold',
    fontWeight: '600',
    color: COLORS.onSurface,
    padding: 0,
  },
  counterSuffix: {
    color: COLORS.onSurfaceVariant,
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
  },
  helperText: {
    color: COLORS.outline,
    ...TYPOGRAPHY.labelSm,
  },
  privacyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  privacyCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  privacyCardActive: {
    backgroundColor: COLORS.primaryOpacity05,
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
  },
  privacyTitle: {
    color: COLORS.onSurfaceVariant,
    ...TYPOGRAPHY.labelMd,
  },
  privacyTitleActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  privacyDesc: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.xs,
  },
  submitBtn: {
    marginTop: SPACING.md,
    height: 48,
    borderRadius: BORDER_RADIUS.default,
  },
  alertModalOverlay: {
    flex: 1,
    backgroundColor: COLORS.blackOpacity50,
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
    color: COLORS.onSurface,
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  alertModalMessage: {
    color: COLORS.onSurfaceVariant,
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
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
