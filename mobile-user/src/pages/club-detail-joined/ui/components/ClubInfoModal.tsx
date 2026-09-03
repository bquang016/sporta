import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Club, getSafeCoverSource, getSafeAvatarSource } from '../../../../entities/club';

export interface ClubInfoModalProps {
  visible: boolean;
  onClose: () => void;
  club: Club;
  onLeavePress?: () => void;
  isSoleMember?: boolean;
  showLeaveButton?: boolean;
}

export function ClubInfoModal({ 
  visible, 
  onClose, 
  club, 
  onLeavePress,
  isSoleMember = false,
  showLeaveButton = true,
}: ClubInfoModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={onClose} 
        />

        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderTitleRow}>
              <Ionicons name="information-circle" size={20} color={COLORS.primary} />
              <Text style={styles.modalTitle}>Thông tin câu lạc bộ</Text>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Mini Cover & Avatar Row */}
            <View style={styles.heroPreview}>
              <Image 
                source={getSafeCoverSource(club.sport, club.coverImage)} 
                style={styles.heroCover} 
                resizeMode="cover"
              />
              <View style={styles.heroAvatarRow}>
                <Image 
                  source={getSafeAvatarSource(club.sport, club.avatarImage)} 
                  style={styles.heroAvatar} 
                />
                <View style={styles.heroInfoText}>
                  <Text style={styles.heroClubName} numberOfLines={1}>{club.name}</Text>
                  <Text style={styles.heroSportText}>{club.sport || 'Bóng đá'} • {club.area || 'Toàn quốc'}</Text>
                </View>
              </View>
            </View>

            {/* Description Card */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>MÔ TẢ & GIỚI THIỆU</Text>
              <Text style={styles.descriptionText}>
                {club.description || 'Chưa có thông tin mô tả chi tiết cho câu lạc bộ này.'}
              </Text>
            </View>

            {/* Detailed Parameters Card */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>THÔNG TIN HOẠT ĐỘNG</Text>

              <View style={styles.infoRow}>
                <View style={styles.infoRowLeft}>
                  <FontAwesome5 name="futbol" size={14} color="#64748B" />
                  <Text style={styles.infoRowLabel}>Môn thể thao</Text>
                </View>
                <Text style={styles.infoRowValue}>{club.sport || 'Bóng đá'}</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoRowLeft}>
                  <Ionicons name={club.isPrivate ? "lock-closed" : "globe-outline"} size={15} color="#64748B" />
                  <Text style={styles.infoRowLabel}>Chế độ gia nhập</Text>
                </View>
                <Text style={[styles.infoRowValue, { color: club.isPrivate ? '#DC2626' : '#059669' }]}>
                  {club.isPrivate ? 'Phê duyệt (Riêng tư)' : 'Tự do (Công khai)'}
                </Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoRowLeft}>
                  <Ionicons name="location-outline" size={15} color="#64748B" />
                  <Text style={styles.infoRowLabel}>Khu vực</Text>
                </View>
                <Text style={styles.infoRowValue}>{club.area || 'Toàn quốc'}</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoRowLeft}>
                  <Ionicons name="time-outline" size={15} color="#64748B" />
                  <Text style={styles.infoRowLabel}>Mức độ hoạt động</Text>
                </View>
                <Text style={styles.infoRowValue}>{club.activityLevel || 'Hàng tuần'}</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoRowLeft}>
                  <Ionicons name="people-outline" size={15} color="#64748B" />
                  <Text style={styles.infoRowLabel}>Quy mô tối đa</Text>
                </View>
                <Text style={styles.infoRowValue}>{club.maxMembers || 50} thành viên</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoRowLeft}>
                  <Ionicons name="person-outline" size={15} color="#64748B" />
                  <Text style={styles.infoRowLabel}>Người sáng lập</Text>
                </View>
                <Text style={styles.infoRowValue}>{club.creatorName || 'Trưởng CLB'}</Text>
              </View>

              {club.createdAt && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <View style={styles.infoRowLeft}>
                      <Ionicons name="calendar-outline" size={15} color="#64748B" />
                      <Text style={styles.infoRowLabel}>Ngày thành lập</Text>
                    </View>
                    <Text style={styles.infoRowValue}>{club.createdAt}</Text>
                  </View>
                </>
              )}
            </View>

            {/* Leave / Dissolve Action */}
            {showLeaveButton && onLeavePress && (
              <TouchableOpacity 
                style={styles.leaveActionBtn}
                activeOpacity={0.8}
                onPress={() => {
                  onClose();
                  setTimeout(() => onLeavePress(), 250);
                }}
              >
                <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                <Text style={styles.leaveActionText}>
                  {isSoleMember ? 'Giải tán câu lạc bộ' : 'Rời khỏi câu lạc bộ'}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  scroll: {
    padding: 16,
  },
  heroPreview: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  heroCover: {
    width: '100%',
    height: 70,
  },
  heroAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  heroAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginTop: -20,
  },
  heroInfoText: {
    flex: 1,
  },
  heroClubName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroSportText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  sectionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  descriptionText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoRowLabel: {
    fontSize: 12.5,
    color: '#64748B',
  },
  infoRowValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  leaveActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 16,
  },
  leaveActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
});
