import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Club } from '../../../../entities/club';
import { MatchHistoryCard, MatchItem } from './MatchHistoryCard';
import { CreateMatchModal } from './CreateMatchModal';

export interface MatchHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  club: Club;
  matches: MatchItem[];
  isLeadership?: boolean;
  onRefreshMatches?: () => void;
}

export function MatchHistoryModal({ 
  visible, 
  onClose, 
  club, 
  matches,
  isLeadership = false,
  onRefreshMatches,
}: MatchHistoryModalProps) {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaProvider>
        <View style={styles.fullScreenModalContainer}>
          <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
            <View style={styles.fullScreenModalHeader}>
              <TouchableOpacity 
                style={styles.closeModalButton} 
                activeOpacity={0.7} 
                onPress={onClose}
              >
                <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.fullScreenModalTitle}>Lịch sử đối đầu</Text>
              <View style={styles.headerPlaceholder} />
            </View>
          </SafeAreaView>
          
          <View style={styles.contentContainer}>
            <ScrollView contentContainerStyle={styles.fullScreenModalScroll} showsVerticalScrollIndicator={false}>
              {/* Leader Banner to add new match */}
              {isLeadership && (
                <TouchableOpacity 
                  style={styles.createBanner}
                  activeOpacity={0.85}
                  onPress={() => setIsCreateModalVisible(true)}
                >
                  <View style={styles.createBannerLeft}>
                    <View style={styles.createIconCircle}>
                      <MaterialIcons name="sports-score" size={22} color={COLORS.primary} />
                    </View>
                    <View>
                      <Text style={styles.createBannerTitle}>Ghi nhận trận đấu mới</Text>
                      <Text style={styles.createBannerSub}>Cập nhật kết quả thi đấu đối đầu của CLB</Text>
                    </View>
                  </View>
                  <MaterialIcons name="add-circle" size={24} color={COLORS.primary} />
                </TouchableOpacity>
              )}

              {matches.length > 0 ? (
                <View style={styles.historyList}>
                  {matches.map((match) => (
                    <MatchHistoryCard 
                      key={match.id}
                      match={match}
                      club={club}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="sports-soccer" size={48} color={COLORS.outline} />
                  <Text style={styles.emptyTitle}>Chưa có lịch sử thi đấu</Text>
                  <Text style={styles.emptySub}>
                    {isLeadership 
                      ? 'Nhấn vào nút "Ghi nhận trận đấu mới" ở trên để lưu lại các trận giao hữu của CLB.'
                      : 'Các kết quả thi đấu đối đầu của câu lạc bộ sẽ hiển thị tại đây.'}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Modal Ghi nhận trận đấu mới */}
        <CreateMatchModal
          visible={isCreateModalVisible}
          onClose={() => setIsCreateModalVisible(false)}
          club={club}
          onSuccess={() => {
            if (onRefreshMatches) onRefreshMatches();
          }}
        />
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerSafeArea: {
    backgroundColor: COLORS.surface,
  },
  contentContainer: {
    flex: 1,
  },
  fullScreenModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    height: 64,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  closeModalButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  fullScreenModalTitle: {
    position: 'absolute',
    left: 60,
    right: 80,
    textAlign: 'center',
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  addHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.primaryOpacity10,
    borderRadius: BORDER_RADIUS.full,
    gap: 2,
  },
  addHeaderBtnText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
  fullScreenModalScroll: {
    padding: SPACING.marginMobile,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  createBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity20,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  createBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  createIconCircle: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createBannerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  createBannerSub: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  historyList: {
    gap: SPACING.md,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  emptyTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.onSurface,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  emptySub: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
    lineHeight: 20,
  },
});
