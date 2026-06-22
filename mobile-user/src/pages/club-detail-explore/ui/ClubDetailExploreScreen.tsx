import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Avatar, Button, Badge } from '../../../shared/ui';
import { useClubs } from '../../../entities/club';

export function ClubDetailExploreScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clubs, joinClub } = useClubs();

  // Custom Modal Alert State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalIcon, setModalIcon] = useState<'check-circle' | 'mail-outline'>('check-circle');

  const club = clubs.find(c => c.id === id);

  if (!club) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            activeOpacity={0.7} 
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết câu lạc bộ</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Không tìm thấy câu lạc bộ này</Text>
          <Button title="Quay lại" onPress={() => router.back()} style={styles.errorBtn} />
        </View>
      </SafeAreaView>
    );
  }

  const handleJoinPress = () => {
    joinClub(club.id);
    if (club.isPrivate) {
      setModalTitle('Đã gửi yêu cầu');
      setModalMessage(`Đã gửi yêu cầu tham gia câu lạc bộ "${club.name}" cho chủ CLB.`);
      setModalIcon('mail-outline');
    } else {
      setModalTitle('Tham gia thành công');
      setModalMessage(`Bạn đã tham gia câu lạc bộ "${club.name}" thành công!`);
      setModalIcon('check-circle');
    }
    setIsModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Custom Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          activeOpacity={0.7} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          Chi tiết câu lạc bộ
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Cover Photo */}
        <View style={styles.coverContainer}>
          {club.coverImage ? (
            <Image source={{ uri: club.coverImage }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverImage, { backgroundColor: COLORS.primary }]} />
          )}
        </View>

        {/* Avatar overlapping cover */}
        <View style={styles.avatarContainer}>
          <Avatar 
            size={80} 
            source={club.avatarImage} 
            fallbackIcon={club.sportIcon as any}
            style={styles.avatar}
          />
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.clubName}>{club.name}</Text>
          
          {/* Badges row */}
          <View style={styles.badgesRow}>
            <Badge text={club.sport} variant="success" />
            <Badge 
              text={club.isPrivate ? 'Riêng tư (Private)' : 'Công khai (Public)'} 
              variant={club.isPrivate ? 'warning' : 'info'} 
            />
            <Badge text={club.activityLevel || 'Mới thành lập'} variant="default" />
          </View>

          {/* Location & Members Details */}
          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <MaterialIcons name="location-on" size={20} color={COLORS.primary} style={styles.metaIcon} />
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Khu vực hoạt động</Text>
                <Text style={styles.metaValue}>{club.area || 'Chưa cập nhật khu vực'}</Text>
              </View>
            </View>
            
            <View style={styles.metaRow}>
              <MaterialIcons name="people" size={20} color={COLORS.primary} style={styles.metaIcon} />
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Thành viên hiện tại</Text>
                <Text style={styles.metaValue}>
                  {club.members} / {club.maxMembers} thành viên (Tối đa {club.maxMembers})
                </Text>
              </View>
            </View>
          </View>

          {/* Bio / Description */}
          <Text style={styles.sectionTitle}>Giới thiệu câu lạc bộ</Text>
          <Text style={styles.description}>
            {club.description || 'Không có mô tả chi tiết cho câu lạc bộ này.'}
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Footer */}
      <View style={styles.footer}>
        <Button
          variant="primary"
          title={club.isPrivate ? "Gửi yêu cầu tham gia" : "Tham gia câu lạc bộ"}
          icon="person-add"
          style={styles.actionBtn}
          onPress={handleJoinPress}
        />
      </View>

      {/* Custom Alert Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setIsModalVisible(false);
          router.back();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertModalContent}>
            <MaterialIcons 
              name={modalIcon} 
              size={48} 
              color={modalIcon === 'check-circle' ? COLORS.primary : COLORS.secondary} 
              style={styles.modalAlertIcon}
            />
            <Text style={styles.alertModalTitle}>{modalTitle}</Text>
            <Text style={styles.alertModalMessage}>{modalMessage}</Text>
            <Button
              variant="primary"
              title="Đóng"
              style={styles.alertModalBtn}
              onPress={() => {
                setIsModalVisible(false);
                router.back();
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
  scroll: {
    flex: 1,
  },
  coverContainer: {
    height: 180,
    width: '100%',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarContainer: {
    alignItems: 'flex-start',
    paddingLeft: SPACING.marginMobile,
    marginTop: -40,
    zIndex: 10,
  },
  avatar: {
    borderWidth: 3,
    borderColor: COLORS.surface,
    backgroundColor: COLORS.surfaceContainer,
  },
  infoSection: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  clubName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.base,
    marginBottom: SPACING.md,
  },
  metaContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.08)',
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  metaIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(6, 78, 59, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    lineHeight: 36,
  },
  metaContent: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    marginBottom: SPACING.base,
    marginTop: 0,
  },
  description: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    lineHeight: 22,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    marginBottom: SPACING.lg,
  },
  footer: {
    padding: SPACING.marginMobile,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(6, 78, 59, 0.08)',
  },
  actionBtn: {
    width: '100%',
    height: 48,
    borderRadius: BORDER_RADIUS.default,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.base,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
  },
  errorBtn: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  modalOverlay: {
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

export default ClubDetailExploreScreen;
