import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { getJoinedClubsApi } from '../../../shared/api/clubs';

export interface UserClubItem {
  id: number;
  name: string;
  avatarImage?: string;
  sportName: string;
  sportEmoji?: string;
  crp: number;
  memberCount: number;
}

interface SelectClubSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectClub: (club: UserClubItem) => void;
}

export function SelectClubSheet({ visible, onClose, onSelectClub }: SelectClubSheetProps) {
  const [clubs, setClubs] = useState<UserClubItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchUserClubs();
    }
  }, [visible]);

  const fetchUserClubs = async () => {
    try {
      setLoading(true);
      const res = await getJoinedClubsApi();
      if (res && res.length > 0) {
        const mappedClubs: UserClubItem[] = res.map((c: any) => ({
          id: c.id,
          name: c.name,
          avatarImage: c.avatarImage,
          sportName: c.sportName || 'Bóng đá',
          sportEmoji: getSportEmoji(c.sportName),
          crp: c.crp || 100,
          memberCount: c.memberCount || 1,
        }));
        setClubs(mappedClubs);
      } else {
        // Fallback default user clubs
        setClubs([
          { id: 1, name: 'CLB Bóng đá Alpha', sportName: 'Bóng đá', sportEmoji: '⚽', crp: 120, memberCount: 15 },
          { id: 2, name: 'CLB Cầu lông SuperHit', sportName: 'Cầu lông', sportEmoji: '🏸', crp: 150, memberCount: 8 },
        ]);
      }
    } catch (err) {
      console.log('Error fetching user clubs:', err);
      setClubs([
        { id: 1, name: 'CLB Bóng đá Alpha', sportName: 'Bóng đá', sportEmoji: '⚽', crp: 120, memberCount: 15 },
        { id: 2, name: 'CLB Cầu lông SuperHit', sportName: 'Cầu lông', sportEmoji: '🏸', crp: 150, memberCount: 8 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getSportEmoji = (name?: string) => {
    if (!name) return '⚽';
    if (name.includes('Bóng rổ')) return '🏀';
    if (name.includes('Cầu lông')) return '🏸';
    if (name.includes('Pickleball')) return '🏓';
    if (name.includes('Tennis')) return '🎾';
    return '⚽';
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Chọn Câu Lạc Bộ Đại Diện</Text>
              <Text style={styles.sheetSubtitle}>Vui lòng chọn CLB bạn muốn tạo phòng ghép trận</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Club List */}
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
              {clubs.map((club) => (
                <TouchableOpacity
                  key={club.id}
                  style={styles.clubCard}
                  activeOpacity={0.85}
                  onPress={() => {
                    onSelectClub(club);
                    onClose();
                  }}
                >
                  <View style={styles.clubInfo}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{club.name.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.clubName}>{club.name}</Text>
                      <Text style={styles.sportBadge}>
                        {club.sportEmoji} {club.sportName} • {club.memberCount} Thành viên
                      </Text>
                    </View>
                  </View>

                  <View style={styles.crpBadge}>
                    <MaterialIcons name="emoji-events" size={14} color={COLORS.secondary} />
                    <Text style={styles.crpText}>{club.crp} CRP</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '75%',
    paddingBottom: SPACING.xl,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.marginMobile,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  sheetTitle: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  sheetSubtitle: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.outline,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  loadingBox: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.marginMobile,
    gap: SPACING.sm,
  },
  clubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainerHigh,
  },
  clubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.onPrimary,
    fontWeight: '800',
    fontSize: 18,
  },
  clubName: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  sportBadge: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  crpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.secondaryOpacity20,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  crpText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSecondaryContainer,
    fontWeight: '700',
  },
});
