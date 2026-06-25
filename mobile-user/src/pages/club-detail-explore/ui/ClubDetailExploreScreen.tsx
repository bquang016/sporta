import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button, Card } from '../../../shared/ui';
import { useClubs, ClubDetailHeader } from '../../../entities/club';

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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* Header wrapper to color the status bar and notch area white */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            activeOpacity={0.7} 
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            {club.name}
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </SafeAreaView>

      {/* Main Content */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Reusable Club detail header */}
        <ClubDetailHeader club={club} />

        {/* Bio / Description */}
        <View style={styles.infoSection}>
          <Card variant="outline" style={styles.bioCard}>
            <Text style={styles.sectionTitle}>Giới thiệu câu lạc bộ</Text>
            <Text style={styles.description}>
              {club.description || 'Không có mô tả chi tiết cho câu lạc bộ này.'}
            </Text>
          </Card>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerSafeArea: {
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    height: 64,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
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
  scroll: {
    flex: 1,
  },
  infoSection: {
    paddingHorizontal: SPACING.marginMobile,
    paddingBottom: SPACING.xl * 2,
  },
  bioCard: {
    backgroundColor: COLORS.primaryOpacity05,
    borderColor: COLORS.primaryOpacity15,
    borderRadius: BORDER_RADIUS.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 16,
    color: COLORS.onSurface,
    marginBottom: SPACING.base,
    marginTop: 0,
  },
  description: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: 0,
  },
  footer: {
    padding: SPACING.marginMobile,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.primaryOpacity08,
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
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  errorBtn: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  modalOverlay: {
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
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  alertModalMessage: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
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

export default ClubDetailExploreScreen;
