import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ImageBackground, ActivityIndicator, Modal, TextInput, Platform, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';
import { Avatar, Button } from '../../../shared/ui';
import { useEditProfile } from '../hooks/useEditProfile';

type EditField = 'NAME' | 'PHONE' | 'GENDER' | 'DOB' | 'HEIGHT_WEIGHT' | null;

export function EditProfileScreen() {
  const router = useRouter();
  
  const {
    profileData,
    fullName,
    setFullName,
    phoneNumber,
    setPhoneNumber,
    gender,
    setGender,
    dateOfBirth,
    setDateOfBirth,
    avatarUri,
    handlePickImage,
    handleSave,
    isSubmitting,
    isConfirmAvatarModalVisible,
    pendingAvatarUri,
    confirmUploadAvatar,
    cancelUploadAvatar,
    alertVisible,
    alertMessage,
    isSuccess,
    handleCloseAlert,
  } = useEditProfile();

  // Local state for modals
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LINKS'>('OVERVIEW');
  const [editingField, setEditingField] = useState<EditField>(null);
  
  // Local height/weight inputs for the modal
  const [localHeight, setLocalHeight] = useState(profileData?.height?.toString() || '');
  const [localWeight, setLocalWeight] = useState(profileData?.weight?.toString() || '');
  
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (profileData) {
      setLocalHeight(profileData.height?.toString() || '');
      setLocalWeight(profileData.weight?.toString() || '');
    }
  }, [profileData]);

  const defaultAvatar = "https://ui-avatars.com/api/?name=" + encodeURIComponent(profileData?.fullName || 'User') + "&background=003527&color=fff";
  
  const onSaveField = async () => {
    let extraData = {};
    if (editingField === 'HEIGHT_WEIGHT') {
      const h = parseInt(localHeight);
      const w = parseFloat(localWeight);
      if (!isNaN(h)) extraData = { ...extraData, height: h };
      if (!isNaN(w)) extraData = { ...extraData, weight: w };
    }
    
    setEditingField(null);
    await handleSave(extraData);
  };

  const getGenderText = (g: string) => {
    if (g === 'MALE') return 'Nam';
    if (g === 'FEMALE') return 'Nữ';
    return 'Khác';
  };

  // ----------------------------------------------------
  // Renders
  // ----------------------------------------------------

  const renderModalContent = () => {
    if (!editingField) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Cập nhật {editingField === 'NAME' ? 'Họ tên' : 
                     editingField === 'PHONE' ? 'Số điện thoại' : 
                     editingField === 'GENDER' ? 'Giới tính' : 
                     editingField === 'HEIGHT_WEIGHT' ? 'Thể chất' : 'Ngày sinh'}
          </Text>

          {editingField === 'NAME' && (
            <TextInput 
              style={styles.modalInput} 
              value={fullName} 
              onChangeText={setFullName} 
              placeholder="Nhập họ tên" 
              autoFocus 
            />
          )}

          {editingField === 'PHONE' && (
            <TextInput 
              style={styles.modalInput} 
              value={phoneNumber} 
              onChangeText={setPhoneNumber} 
              placeholder="Nhập số điện thoại" 
              keyboardType="phone-pad" 
              autoFocus 
            />
          )}

          {editingField === 'GENDER' && (
            <View style={styles.genderContainer}>
              <TouchableOpacity style={[styles.genderBtn, gender === 'MALE' && styles.genderBtnActive]} onPress={() => setGender('MALE')}>
                <Text style={[styles.genderText, gender === 'MALE' && styles.genderTextActive]}>Nam</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.genderBtn, gender === 'FEMALE' && styles.genderBtnActive]} onPress={() => setGender('FEMALE')}>
                <Text style={[styles.genderText, gender === 'FEMALE' && styles.genderTextActive]}>Nữ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.genderBtn, gender === 'OTHER' && styles.genderBtnActive]} onPress={() => setGender('OTHER')}>
                <Text style={[styles.genderText, gender === 'OTHER' && styles.genderTextActive]}>Khác</Text>
              </TouchableOpacity>
            </View>
          )}

          {editingField === 'HEIGHT_WEIGHT' && (
            <View>
              <TextInput 
                style={styles.modalInput} 
                value={localHeight} 
                onChangeText={setLocalHeight} 
                placeholder="Chiều cao (cm)" 
                keyboardType="numeric" 
                autoFocus 
              />
              <TextInput 
                style={styles.modalInput} 
                value={localWeight} 
                onChangeText={setLocalWeight} 
                placeholder="Cân nặng (kg)" 
                keyboardType="numeric" 
              />
            </View>
          )}

          {editingField === 'DOB' && (
            <View style={{ width: '100%', alignItems: 'center' }}>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={dateOfBirth || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={(e, d) => d && setDateOfBirth(d)}
                  maximumDate={new Date()}
                />
              ) : (
                <TouchableOpacity style={styles.modalInput} onPress={() => setShowDatePicker(true)}>
                  <Text>{dateOfBirth ? dateOfBirth.toLocaleDateString('vi-VN') : 'Chọn ngày sinh'}</Text>
                </TouchableOpacity>
              )}
              {showDatePicker && Platform.OS === 'android' && (
                <DateTimePicker
                  value={dateOfBirth || new Date()}
                  mode="date"
                  onChange={(e, d) => {
                    setShowDatePicker(false);
                    if (d) setDateOfBirth(d);
                  }}
                  maximumDate={new Date()}
                />
              )}
            </View>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setEditingField(null)}>
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSave} onPress={() => onSaveField()}>
              {isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.modalSaveText}>Lưu</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* FIXED HEADER WITH LOGO AND BACK BUTTON */}
      <View style={styles.fixedHeader}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <MaterialIcons name="chevron-left" size={28} color="#fff" />
            </TouchableOpacity>
            <Image 
              source={require('../../../../assets/logo/logo-horizontal_1600x400.png')} 
              style={styles.logoImage} 
            />
            <View style={styles.iconButtonPlaceholder} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* GREEN SPACER */}
        <View style={styles.headerSpacer} />
        
        {/* WHITE CONTENT CONTAINER */}
        <View style={styles.mainContent}>
          {/* HEADER INFO */}
          <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <Avatar size={100} source={avatarUri || defaultAvatar} />
            <TouchableOpacity style={styles.avatarCamera} onPress={handlePickImage}>
              <MaterialIcons name="camera-alt" size={16} color="#064E3B" />
            </TouchableOpacity>
          </View>
          <Text style={styles.nameText} numberOfLines={1}>{fullName || 'Chưa cập nhật tên'}</Text>
          <TouchableOpacity onPress={() => setEditingField('NAME')} style={styles.editNameBtn}>
            <MaterialIcons name="edit" size={14} color="#064E3B" />
            <Text style={styles.editNameText}>Sửa tên</Text>
          </TouchableOpacity>
        </View>

        {/* THÔNG TIN LIÊN HỆ */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <MaterialCommunityIcons name="email-outline" size={20} color="#064E3B" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profileData?.email || 'Chưa cập nhật'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <MaterialCommunityIcons name="phone-outline" size={20} color="#064E3B" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>{phoneNumber || 'Chưa cập nhật'}</Text>
              </View>
              <TouchableOpacity onPress={() => setEditingField('PHONE')} style={styles.editIconBtn}>
                <MaterialCommunityIcons name="pencil-outline" size={18} color="#064E3B" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* THÔNG TIN CÁ NHÂN */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <MaterialCommunityIcons name="cake-variant-outline" size={20} color="#064E3B" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngày sinh</Text>
                <Text style={styles.infoValue}>{dateOfBirth ? dateOfBirth.toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</Text>
              </View>
              <TouchableOpacity onPress={() => setEditingField('DOB')} style={styles.editIconBtn}>
                <MaterialCommunityIcons name="pencil-outline" size={18} color="#064E3B" />
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <MaterialCommunityIcons name="gender-male-female" size={20} color="#064E3B" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Giới tính</Text>
                <Text style={styles.infoValue}>{getGenderText(gender)}</Text>
              </View>
              <TouchableOpacity onPress={() => setEditingField('GENDER')} style={styles.editIconBtn}>
                <MaterialCommunityIcons name="pencil-outline" size={18} color="#064E3B" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* THỂ CHẤT */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thể chất</Text>
            <TouchableOpacity onPress={() => setEditingField('HEIGHT_WEIGHT')}>
              <Text style={styles.sectionEditText}>Cập nhật</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardRow}>
            <View style={styles.physicalBox}>
              <MaterialCommunityIcons name="human-male-height" size={24} color="#064E3B" />
              <Text style={styles.physicalValue}>{profileData?.height || '--'} <Text style={styles.physicalUnit}>cm</Text></Text>
              <Text style={styles.physicalLabel}>Chiều cao</Text>
            </View>
            <View style={styles.physicalBox}>
              <MaterialCommunityIcons name="weight" size={24} color="#064E3B" />
              <Text style={styles.physicalValue}>{profileData?.weight || '--'} <Text style={styles.physicalUnit}>kg</Text></Text>
              <Text style={styles.physicalLabel}>Cân nặng</Text>
            </View>
          </View>
        </View>

        {/* MÔN THỂ THAO */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Môn thể thao & Trình độ</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.sportsContainer}>
              {profileData?.sports && profileData.sports.length > 0 ? (
                profileData.sports.map((sport, index) => {
                  let badgeBg = '#E7EEFE';
                  let textColor = '#064E3B';
                  let iconName = 'trophy-outline';
                  let levelBg = '#95D3BA';

                  if (sport.sportName.toLowerCase().includes('cầu lông')) {
                    badgeBg = '#E7EEFE'; textColor = '#064E3B'; levelBg = '#95D3BA'; iconName = 'badminton';
                  } else if (sport.sportName.toLowerCase().includes('pickleball') || sport.sportName.toLowerCase().includes('tennis')) {
                    badgeBg = '#F0F3FF'; textColor = '#003527'; levelBg = '#b0f0d6'; iconName = 'tennis';
                  } else if (sport.sportName.toLowerCase().includes('bóng đá')) {
                    badgeBg = '#e6f0ed'; textColor = '#064E3B'; levelBg = '#80bea6'; iconName = 'soccer';
                  }

                  const mapLevelToVietnamese = (lvl: string) => {
                    switch (lvl) {
                      case 'WEAK': return 'Yếu';
                      case 'WEAK_AVERAGE': return 'Yếu - TB';
                      case 'AVERAGE': return 'Trung bình';
                      case 'AVERAGE_GOOD': return 'Khá';
                      case 'GOOD': return 'Tốt';
                      case 'ALL': return 'Mọi trình độ';
                      default: return lvl.replace(/_/g, ' ');
                    }
                  };
                  const levelText = mapLevelToVietnamese(sport.level);

                  return (
                    <View key={index} style={styles.sportItemRow}>
                      <View style={[styles.sportIconCircle, { backgroundColor: badgeBg }]}>
                        <MaterialCommunityIcons name={iconName as any} size={20} color={textColor} />
                      </View>
                      <View style={styles.sportInfo}>
                        <Text style={styles.sportNameText}>{sport.sportName}</Text>
                        <View style={[styles.levelBadge, { backgroundColor: levelBg }]}>
                          <Text style={styles.levelBadgeText}>{levelText}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.emptyText}>Chưa cập nhật môn thể thao</Text>
              )}
            </View>
          </View>
        </View>

        </View>
      </ScrollView>

      {/* MODAL EDIT FIELDS */}
      <Modal visible={editingField !== null} transparent animationType="fade">
        {renderModalContent()}
      </Modal>

      {/* MODAL XÁC NHẬN AVATAR */}
      <Modal visible={isConfirmAvatarModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đổi ảnh đại diện</Text>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
               {pendingAvatarUri && <Avatar size={100} source={pendingAvatarUri} />}
               <Text style={{ marginTop: 12, ...TYPOGRAPHY.bodyMd, color: '#707974', textAlign: 'center' }}>Bạn có chắc chắn muốn cập nhật ảnh đại diện này?</Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={cancelUploadAvatar} disabled={isSubmitting}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={confirmUploadAvatar} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator size="small" color="#002117" /> : <Text style={styles.modalSaveText}>Đồng ý</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ALERT MODAL */}
      <Modal visible={alertVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isSuccess ? 'Thành công' : 'Lỗi'}</Text>
            <Text style={{ marginBottom: 20, ...TYPOGRAPHY.bodyMd, color: '#707974', textAlign: 'center' }}>
              {alertMessage}
            </Text>
            <View style={{ width: '100%' }}>
              <TouchableOpacity style={styles.modalSave} onPress={handleCloseAlert}>
                <Text style={styles.modalSaveText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003527', // The whole screen background is green to handle safe area
  },
  fixedHeader: {
    backgroundColor: '#003527',
    paddingBottom: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 44,
  },
  logoImage: {
    width: 100,
    height: 28,
    resizeMode: 'contain',
    tintColor: '#ffffff',
  },
  iconButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#003527',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerSpacer: {
    height: 60,
    backgroundColor: '#003527',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F9F9FF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: -48,
  },
  avatarWrapper: {
    position: 'relative',
    padding: 4,
    backgroundColor: '#F9F9FF',
    borderRadius: 999,
    elevation: 2,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  avatarCamera: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#FACC15', // Secondary accent
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F9F9FF',
  },
  nameText: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: '#151C27',
    marginTop: 16,
  },
  editNameBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7EEFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  editNameText: {
    ...TYPOGRAPHY.labelMd,
    color: '#064E3B',
    marginLeft: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleMd,
    color: '#151C27',
  },
  sectionEditText: {
    ...TYPOGRAPHY.labelMd,
    color: '#064E3B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F3FF',
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...TYPOGRAPHY.bodyMd,
    color: '#707974',
    marginBottom: 2,
  },
  infoValue: {
    ...TYPOGRAPHY.titleMd,
    color: '#151C27',
  },
  editIconBtn: {
    padding: 8,
    backgroundColor: '#F9F9FF',
    borderRadius: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F3FF',
    marginVertical: 12,
    marginLeft: 52,
  },
  physicalBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F3FF',
  },
  physicalValue: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: '#151C27',
    marginTop: 8,
  },
  physicalUnit: {
    ...TYPOGRAPHY.bodyMd,
    color: '#707974',
  },
  physicalLabel: {
    ...TYPOGRAPHY.labelMd,
    color: '#707974',
    marginTop: 4,
  },
  sportsContainer: {
    gap: 16,
  },
  sportItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sportInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sportNameText: {
    ...TYPOGRAPHY.titleMd,
    color: '#151C27',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    ...TYPOGRAPHY.labelMd,
    color: '#002117',
  },
  emptyText: {
    ...TYPOGRAPHY.bodyMd,
    color: '#707974',
    textAlign: 'center',
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(21, 28, 39, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '85%',
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: '#151C27',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    ...TYPOGRAPHY.bodyLg,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    ...TYPOGRAPHY.bodyMd,
    color: '#707974',
    fontWeight: '600',
  },
  modalSave: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#FACC15', // Athletic Yellow
    borderRadius: 12,
  },
  modalSaveText: {
    ...TYPOGRAPHY.bodyMd,
    color: '#002117',
    fontWeight: '700',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F8',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  genderBtnActive: {
    borderColor: '#064E3B',
    backgroundColor: '#E7EEFE',
  },
  genderText: {
    ...TYPOGRAPHY.bodyMd,
    color: '#707974',
  },
  genderTextActive: {
    color: '#064E3B',
    fontWeight: '700',
  }
});
