import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../model/post.types';
import { updatePostAudienceApi } from '../../../shared/api/posts';
import { getJoinedClubsApi } from '../../../shared/api/clubs';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ChangeAudienceModalProps {
  visible: boolean;
  post: Post | null;
  onClose: () => void;
  onSaveSuccess: (
    audience: 'PUBLIC' | 'CLUB',
    clubInfo?: { id: string; name: string; avatar?: string; avatarUrl?: string }
  ) => void;
}

export const ChangeAudienceModal = React.memo(({
  visible,
  post,
  onClose,
  onSaveSuccess,
}: ChangeAudienceModalProps) => {
  const [selectedAudience, setSelectedAudience] = useState<'PUBLIC' | 'CLUB'>('PUBLIC');
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [clubs, setClubs] = useState<any[]>([]);
  const [loadingClubs, setLoadingClubs] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible && post) {
      const isClub = post.audience === 'CLUB' || !!post.clubInfo;
      setSelectedAudience(isClub ? 'CLUB' : 'PUBLIC');
      setSelectedClubId(post.clubInfo ? Number(post.clubInfo.id) : null);
      setErrorMessage(null);

      // Fetch user's joined clubs
      setLoadingClubs(true);
      getJoinedClubsApi()
        .then((data) => {
          setClubs(data || []);
          if (isClub && post.clubInfo && (!selectedClubId || selectedClubId === null)) {
            setSelectedClubId(Number(post.clubInfo.id));
          } else if (isClub && data && data.length > 0 && !post.clubInfo) {
            setSelectedClubId(data[0].id);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingClubs(false));
    }
  }, [visible, post]);

  if (!visible || !post) return null;

  const handleSave = async () => {
    if (selectedAudience === 'CLUB' && !selectedClubId) {
      setErrorMessage('Vui lòng chọn một câu lạc bộ');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await updatePostAudienceApi(post.id, selectedAudience, selectedClubId || undefined);
    setIsSubmitting(false);

    if (res.success) {
      const selectedClub = clubs.find((c) => Number(c.id) === Number(selectedClubId));
      onSaveSuccess(
        selectedAudience,
        selectedAudience === 'CLUB' && selectedClub
          ? {
              id: String(selectedClub.id),
              name: selectedClub.name,
              avatar: selectedClub.avatarImage || selectedClub.avatarUrl,
              avatarUrl: selectedClub.avatarImage || selectedClub.avatarUrl,
            }
          : undefined
      );
      onClose();
    } else {
      setErrorMessage(res.message || 'Không thể cập nhật đối tượng xem');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop - tap to dismiss */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        {/* Bottom Sheet Container */}
        <View style={styles.sheetContainer}>
          <SafeAreaView style={styles.safeArea}>
            {/* Minimalist Top Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.headerBtn} onPress={onClose} disabled={isSubmitting}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Thay đổi đối tượng xem</Text>

              <TouchableOpacity
                style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Lưu</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Error banner */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Content ScrollView */}
            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.description}>
                Ai có thể nhìn thấy bài viết này của bạn trên Sporta?
              </Text>

              {/* Option 1: PUBLIC */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  selectedAudience === 'PUBLIC' && styles.optionCardActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedAudience('PUBLIC')}
              >
                <View style={[styles.optionIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="globe-outline" size={22} color="#2563EB" />
                </View>
                <View style={styles.optionTextBox}>
                  <Text style={styles.optionTitle}>Công khai</Text>
                  <Text style={styles.optionSub}>Bất kỳ ai trên Sporta đều có thể xem bài viết</Text>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    selectedAudience === 'PUBLIC' && styles.radioOuterActive,
                  ]}
                >
                  {selectedAudience === 'PUBLIC' && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>

              {/* Option 2: CLUB */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  selectedAudience === 'CLUB' && styles.optionCardActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedAudience('CLUB')}
              >
                <View style={[styles.optionIconBox, { backgroundColor: '#FDF4FF' }]}>
                  <Ionicons name="shield-checkmark-outline" size={22} color="#9333EA" />
                </View>
                <View style={styles.optionTextBox}>
                  <Text style={styles.optionTitle}>Câu lạc bộ tự chọn</Text>
                  <Text style={styles.optionSub}>Chỉ thành viên trong câu lạc bộ được chọn mới có thể xem</Text>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    selectedAudience === 'CLUB' && styles.radioOuterActive,
                  ]}
                >
                  {selectedAudience === 'CLUB' && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>

              {/* Club Selector List (if CLUB selected) */}
              {selectedAudience === 'CLUB' && (
                <View style={styles.clubSelectSection}>
                  <Text style={styles.clubSectionHeading}>Chọn câu lạc bộ của bạn:</Text>

                  {loadingClubs ? (
                    <View style={styles.loadingBox}>
                      <ActivityIndicator size="small" color={COLORS.primary} />
                      <Text style={styles.loadingText}>Đang tải danh sách câu lạc bộ...</Text>
                    </View>
                  ) : clubs.length === 0 ? (
                    <View style={styles.emptyClubBox}>
                      <Ionicons name="people-outline" size={24} color="#94A3B8" />
                      <Text style={styles.emptyClubsText}>
                        Bạn chưa tham gia câu lạc bộ nào để chia sẻ riêng.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.clubsList}>
                      {clubs.map((c) => {
                        const isSelected = selectedClubId === Number(c.id);
                        return (
                          <TouchableOpacity
                            key={c.id}
                            style={[
                              styles.clubItem,
                              isSelected && styles.clubItemActive,
                            ]}
                            activeOpacity={0.7}
                            onPress={() => setSelectedClubId(Number(c.id))}
                          >
                            <Image
                              source={
                                c.avatarImage
                                  ? { uri: c.avatarImage }
                                  : require('../../../../assets/logo/club/699x699__1_-removebg-preview.png')
                              }
                              style={styles.clubAvatar}
                            />
                            <View style={styles.clubInfo}>
                              <Text style={styles.clubName} numberOfLines={1}>
                                {c.name}
                              </Text>
                              <Text style={styles.clubSport}>
                                {c.sport || 'Câu lạc bộ'} • {c.members || 1} thành viên
                              </Text>
                            </View>
                            <Ionicons
                              name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                              size={22}
                              color={isSelected ? COLORS.primary : '#CBD5E1'}
                            />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
    minHeight: 440,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 16,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    marginHorizontal: SPACING.md,
    marginTop: 10,
    borderRadius: BORDER_RADIUS.default,
  },
  errorText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.error,
    flex: 1,
    fontSize: 13,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: SPACING.md,
    gap: 12,
    paddingBottom: 40,
  },
  description: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  optionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
  },
  optionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextBox: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  optionSub: {
    ...TYPOGRAPHY.bodySm,
    fontSize: 12,
    color: '#64748B',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  clubSelectSection: {
    marginTop: 8,
    gap: 8,
  },
  clubSectionHeading: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
  },
  emptyClubBox: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.default,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyClubsText: {
    ...TYPOGRAPHY.bodySm,
    color: '#94A3B8',
    fontSize: 13,
  },
  clubsList: {
    gap: 8,
  },
  clubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: BORDER_RADIUS.default,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  clubItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
  },
  clubAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E2E8F0',
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  clubSport: {
    fontSize: 11,
    color: '#64748B',
  },
});
