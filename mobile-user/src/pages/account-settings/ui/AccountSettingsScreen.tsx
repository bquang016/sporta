import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/config/theme';
import { ConfirmModal } from '../../../shared/ui/Modal/ConfirmModal';

import {
  useAccountSettings,
  ChangePasswordModal,
  SecurityGroup,
  NotificationGroup,
  PrivacyDangerGroup
} from '../../../features/account-settings';

export function AccountSettingsScreen() {
  const router = useRouter();
  
  const {
    loading,
    notifBooking,
    notifPromo,
    notifMatchmake,
    enableBiometrics,
    privateMode,
    isChangePasswordModal,
    isDeleteConfirmModal,
    setIsChangePasswordModal,
    setIsDeleteConfirmModal,
    setNotifBooking,
    setNotifPromo,
    setNotifMatchmake,
    setEnableBiometrics,
    setPrivateMode,
    handleToggleSetting,
    handleDeleteAccount,
  } = useAccountSettings();

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải cài đặt tài khoản...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            activeOpacity={0.7} 
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cài Đặt Tài Khoản</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: Security Group */}
        <SecurityGroup
          enableBiometrics={enableBiometrics}
          onOpenChangePasswordModal={() => setIsChangePasswordModal(true)}
          onToggleBiometrics={(val) => { setEnableBiometrics(val); handleToggleSetting('enableBiometrics', val); }}
        />

        {/* Section 2: Notification Settings */}
        <NotificationGroup
          notifBooking={notifBooking}
          notifPromo={notifPromo}
          notifMatchmake={notifMatchmake}
          onToggleBooking={(val) => { setNotifBooking(val); handleToggleSetting('notifBooking', val); }}
          onTogglePromo={(val) => { setNotifPromo(val); handleToggleSetting('notifPromo', val); }}
          onToggleMatchmake={(val) => { setNotifMatchmake(val); handleToggleSetting('notifMatchmake', val); }}
        />

        {/* Section 3: Privacy & Danger Zone */}
        <PrivacyDangerGroup
          privateMode={privateMode}
          onTogglePrivateMode={(val) => { setPrivateMode(val); handleToggleSetting('privateMode', val); }}
          onOpenDeleteModal={() => setIsDeleteConfirmModal(true)}
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      <ChangePasswordModal
        visible={isChangePasswordModal}
        onClose={() => setIsChangePasswordModal(false)}
      />

      <ConfirmModal
        visible={isDeleteConfirmModal}
        title="Yêu cầu xóa tài khoản?"
        message="Hành động này sẽ gửi yêu cầu xóa vĩnh viễn tài khoản cá nhân khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục không?"
        confirmText="Xóa tài khoản"
        cancelText="Giữ tài khoản"
        confirmVariant="primary"
        icon="delete-forever"
        iconColor={COLORS.error}
        useViewOverlay={true}
        onConfirm={() => {
          setIsDeleteConfirmModal(false);
          handleDeleteAccount();
        }}
        onCancel={() => setIsDeleteConfirmModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  headerSafeArea: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    height: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: SPACING.marginMobile,
    gap: SPACING.md,
  },
});
