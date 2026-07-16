import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ImageBackground, ActivityIndicator, Modal, TextInput, Platform 
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
    isSubmitting
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
      {/* HEADER BANNER */}
      <View style={styles.headerBanner}>
        <SafeAreaView edges={['top']} style={styles.bannerSafeArea}>
          <View style={styles.bannerTopRow}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <MaterialIcons name="chevron-left" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialIcons name="camera-alt" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* PROFILE CARD - FLOATING */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatarWrapper}>
              <Avatar size="xl" source={avatarUri || defaultAvatar} />
              <TouchableOpacity style={styles.avatarCamera} onPress={handlePickImage}>
                <MaterialIcons name="camera-alt" size={12} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.nameText} numberOfLines={1}>{fullName || 'Chưa cập nhật tên'}</Text>
                <TouchableOpacity onPress={() => setEditingField('NAME')} style={styles.editIconBtn}>
                  <MaterialIcons name="edit" size={16} color={COLORS.outline} />
                </TouchableOpacity>
              </View>
              <View style={styles.emailBadge}>
                <MaterialCommunityIcons name="email-outline" size={14} color={COLORS.outlineVariant} />
                <Text style={styles.emailText}>{profileData?.email || 'Chưa cập nhật email'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileStats}>
            <TouchableOpacity style={styles.statCol} onPress={() => setEditingField('PHONE')}>
              <View style={styles.statLabelRow}>
                <MaterialCommunityIcons name="phone" size={14} color={COLORS.outlineVariant} />
                <Text style={styles.statLabel}>Điện thoại</Text>
              </View>
              <Text style={styles.statValue}>{phoneNumber || 'Chưa có'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCol} onPress={() => setEditingField('DOB')}>
              <View style={styles.statLabelRow}>
                <MaterialCommunityIcons name="cake-variant" size={14} color={COLORS.outlineVariant} />
                <Text style={styles.statLabel}>Năm sinh</Text>
              </View>
              <Text style={styles.statValue}>{dateOfBirth ? dateOfBirth.getFullYear() : 'Chưa có'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCol} onPress={() => setEditingField('GENDER')}>
              <View style={styles.statLabelRow}>
                <MaterialCommunityIcons name="gender-male-female" size={14} color={COLORS.outlineVariant} />
                <Text style={styles.statLabel}>Giới tính</Text>
              </View>
              <Text style={styles.statValue}>{getGenderText(gender)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TABS */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'OVERVIEW' && styles.tabBtnActive]} 
            onPress={() => setActiveTab('OVERVIEW')}
          >
            <Text style={[styles.tabText, activeTab === 'OVERVIEW' && styles.tabTextActive]}>Tổng quan</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'LINKS' && styles.tabBtnActive]} 
            onPress={() => setActiveTab('LINKS')}
          >
            <Text style={[styles.tabText, activeTab === 'LINKS' && styles.tabTextActive]}>Liên kết</Text>
          </TouchableOpacity>
        </View>

        {/* TAB CONTENT: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <View style={styles.tabContent}>
            
            {/* THỂ CHẤT */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Thông tin thể chất</Text>
              <TouchableOpacity onPress={() => setEditingField('HEIGHT_WEIGHT')}>
                <MaterialCommunityIcons name="square-edit-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.physicalCard}>
              <View style={styles.physicalCol}>
                <View style={styles.statLabelRow}>
                  <MaterialCommunityIcons name="ruler" size={16} color={COLORS.outlineVariant} />
                  <Text style={styles.physicalLabel}>Chiều cao (cm)</Text>
                </View>
                <Text style={styles.physicalValue}>{profileData?.height || '0'} cm</Text>
              </View>
              <View style={styles.physicalDivider} />
              <View style={styles.physicalCol}>
                <View style={styles.statLabelRow}>
                  <MaterialCommunityIcons name="scale" size={16} color={COLORS.outlineVariant} />
                  <Text style={styles.physicalLabel}>Cân nặng (kg)</Text>
                </View>
                <Text style={styles.physicalValue}>{profileData?.weight || '0'} kg</Text>
              </View>
            </View>

            {/* GHI CHÚ */}
            <View style={styles.noteRow}>
              <MaterialCommunityIcons name="note-edit-outline" size={20} color={COLORS.onSurface} />
              <Text style={styles.noteText}>Ghi chú đặc biệt</Text>
            </View>

            {/* CÁ NHÂN HOÁ */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Cá nhân hoá</Text>
              <TouchableOpacity>
                <MaterialCommunityIcons name="square-edit-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.personItem}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color={COLORS.onSurface} />
              <Text style={styles.personLabel}>Vị trí yêu thích</Text>
            </View>
            <View style={styles.personValueRow}>
              <Text style={styles.personSubText}>Chưa cập nhật</Text>
            </View>

            <View style={styles.personItem}>
              <MaterialCommunityIcons name="trophy-outline" size={20} color={COLORS.onSurface} />
              <Text style={styles.personLabel}>Môn thể thao và trình độ</Text>
            </View>
            <View style={styles.personValueRow}>
              <View style={[styles.sportBadge, { backgroundColor: '#d1fae5' }]}>
                <MaterialCommunityIcons name="badminton" size={14} color="#065f46" />
                <Text style={[styles.sportBadgeText, { color: '#065f46' }]}>Cầu lông</Text>
                <View style={[styles.levelTag, { backgroundColor: '#10b981' }]}><Text style={styles.levelTagText}>TBY</Text></View>
              </View>
              <View style={[styles.sportBadge, { backgroundColor: '#dbeafe' }]}>
                <MaterialCommunityIcons name="tennis" size={14} color="#1e40af" />
                <Text style={[styles.sportBadgeText, { color: '#1e40af' }]}>Pickleball</Text>
                <View style={[styles.levelTag, { backgroundColor: '#3b82f6' }]}><Text style={styles.levelTagText}>1.0</Text></View>
              </View>
            </View>
            <View style={[styles.personValueRow, { marginTop: 8 }]}>
              <View style={[styles.sportBadge, { backgroundColor: '#dcfce7' }]}>
                <MaterialCommunityIcons name="soccer" size={14} color="#166534" />
                <Text style={[styles.sportBadgeText, { color: '#166534' }]}>Bóng đá</Text>
                <View style={[styles.levelTag, { backgroundColor: '#22c55e' }]}><Text style={styles.levelTagText}>PTCB</Text></View>
              </View>
            </View>

            <View style={styles.personItem}>
              <MaterialCommunityIcons name="target" size={20} color={COLORS.onSurface} />
              <Text style={styles.personLabel}>Mục tiêu</Text>
            </View>
            <View style={styles.personValueRow}>
              <Text style={styles.personSubText}>Ưu đãi giảm giá, Trải nghiệm thể thao miễn phí, Giải đấu, Tìm đội & bạn chơi, Luyện tập</Text>
            </View>

            <View style={styles.personItem}>
              <MaterialCommunityIcons name="calendar-refresh" size={20} color={COLORS.onSurface} />
              <Text style={styles.personLabel}>Tần suất chơi</Text>
            </View>
            <View style={styles.personValueRow}>
              <Text style={styles.personSubText}>💪 Tập đều đặn trong tuần, 🌙 Tối</Text>
            </View>

          </View>
        )}

      </ScrollView>

      {/* MODAL */}
      <Modal visible={editingField !== null} transparent animationType="fade">
        {renderModalContent()}
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerBanner: {
    height: 180,
    backgroundColor: '#003527', // The green from ALOBO design
    // You can also use an ImageBackground if you have a pattern
  },
  bannerSafeArea: {
    flex: 1,
  },
  bannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    marginTop: -80, // pull the content up over the banner
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCamera: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    backgroundColor: '#555',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    ...TYPOGRAPHY.titleLg,
    color: '#000',
    fontWeight: '700',
    flexShrink: 1,
  },
  editIconBtn: {
    marginLeft: 8,
    padding: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  emailText: {
    ...TYPOGRAPHY.labelSm,
    color: '#666',
    marginLeft: 4,
  },
  profileStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    ...TYPOGRAPHY.labelSm,
    color: '#777',
    marginLeft: 4,
  },
  statValue: {
    ...TYPOGRAPHY.titleMd,
    color: '#000',
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#003527',
  },
  tabBtnActive: {
    backgroundColor: '#003527',
  },
  tabText: {
    ...TYPOGRAPHY.titleMd,
    color: '#003527',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleMd,
    color: '#003527', // Green
    fontWeight: '700',
  },
  physicalCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 16,
  },
  physicalCol: {
    flex: 1,
    alignItems: 'center',
  },
  physicalDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  physicalLabel: {
    ...TYPOGRAPHY.labelSm,
    color: '#666',
    marginLeft: 4,
  },
  physicalValue: {
    ...TYPOGRAPHY.titleMd,
    color: '#000',
    fontWeight: '700',
    marginTop: 4,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  noteText: {
    ...TYPOGRAPHY.titleSm,
    fontWeight: '700',
    marginLeft: 8,
  },
  personItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  personLabel: {
    ...TYPOGRAPHY.titleSm,
    fontWeight: '700',
    marginLeft: 8,
  },
  personValueRow: {
    flexDirection: 'row',
    marginLeft: 28,
    marginTop: 4,
    flexWrap: 'wrap',
    gap: 8,
  },
  personSubText: {
    ...TYPOGRAPHY.bodyMd,
    color: '#555',
    lineHeight: 22,
  },
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  sportBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: '600',
  },
  levelTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  levelTagText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '700',
    marginBottom: 16,
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
    color: '#777',
  },
  modalSave: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#003527',
    borderRadius: 8,
  },
  modalSaveText: {
    ...TYPOGRAPHY.bodyMd,
    color: '#fff',
    fontWeight: '600',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  genderBtnActive: {
    borderColor: '#003527',
    backgroundColor: '#e6f0ed',
  },
  genderText: {
    ...TYPOGRAPHY.bodyMd,
    color: '#555',
  },
  genderTextActive: {
    color: '#003527',
    fontWeight: '700',
  }
});
