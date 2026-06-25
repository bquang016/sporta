import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Button } from '../../../../shared/ui';

export interface MemberItem {
  id: string;
  name: string;
  role: string;
  elo: number;
  avatar: string;
}

export interface MembersModalProps {
  visible: boolean;
  onClose: () => void;
  membersCount: number;
  members: MemberItem[];
  onLeavePress: () => void;
}

export function MembersModal({ visible, onClose, membersCount, members, onLeavePress }: MembersModalProps) {
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
              <Text style={styles.fullScreenModalTitle}>Thành viên nhóm ({membersCount})</Text>
              <View style={styles.headerPlaceholder} />
            </View>
          </SafeAreaView>
          
          <View style={styles.contentContainer}>
        
        <ScrollView contentContainerStyle={styles.fullScreenModalScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.modalMembersContainer}>
            {members.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <View style={styles.memberMetaRow}>
                    <Text style={styles.memberRole}>{member.role}</Text>
                    <Text style={styles.memberDivider}>•</Text>
                    <View style={styles.memberEloContainer}>
                      <MaterialIcons name="star" size={10} color={COLORS.amberStar} style={{ marginRight: 2 }} />
                      <Text style={styles.memberElo}>{member.elo} Elo</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.chatButton} activeOpacity={0.7}>
                  <MaterialIcons name="chat-bubble-outline" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Button
            variant="outline"
            title="Rời khỏi câu lạc bộ"
            icon="exit-to-app"
            style={styles.actionBtn}
            onPress={onLeavePress}
          />
        </View>
          </View>
        </View>
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
    right: 60,
    textAlign: 'center',
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  fullScreenModalScroll: {
    padding: SPACING.marginMobile,
    paddingBottom: SPACING.xl,
  },
  modalMembersContainer: {
    borderRadius: BORDER_RADIUS.default,
    overflow: 'hidden',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurface,
  },
  memberMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  memberRole: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  memberDivider: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginHorizontal: SPACING.xs + 2,
  },
  memberEloContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberElo: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  chatButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryOpacity05,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderColor: COLORS.error,
  },
});
