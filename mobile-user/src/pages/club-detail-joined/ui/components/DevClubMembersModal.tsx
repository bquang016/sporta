import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import {
  DevClubCandidate,
  getDevClubCandidatesApi,
  devAssignClubMembersApi,
} from '../../../../shared/api/clubs';

export interface DevClubMembersModalProps {
  visible: boolean;
  onClose: () => void;
  clubId: number;
  clubName?: string;
  onSuccess: (count: number) => void;
}

export function DevClubMembersModal({
  visible,
  onClose,
  clubId,
  clubName,
  onSuccess,
}: DevClubMembersModalProps) {
  const [candidates, setCandidates] = useState<DevClubCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterRole, setFilterRole] = useState<'ALL' | 'PLAYER' | 'TESTER'>('ALL');

  // Load candidates when modal opens
  useEffect(() => {
    if (visible && clubId) {
      loadCandidates();
    } else {
      setSearchQuery('');
      setSelectedUserIds([]);
      setFilterRole('ALL');
    }
  }, [visible, clubId]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await getDevClubCandidatesApi(clubId);
      setCandidates(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('[DevClubMembersModal] Lỗi lấy danh sách ứng viên:', error);
      Alert.alert('Lỗi', error?.message || 'Không thể tải danh sách người dùng trong hệ thống');
    } finally {
      setLoading(false);
    }
  };

  // Filter candidates by search query and role filter
  const filteredCandidates = useMemo(() => {
    let list = candidates;

    if (filterRole === 'TESTER') {
      list = list.filter((c) => c.isDevTester);
    } else if (filterRole === 'PLAYER') {
      list = list.filter((c) => !c.role || c.role === 'PLAYER');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.fullName?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.role?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [candidates, searchQuery, filterRole]);

  // Toggle user selection
  const handleToggleUser = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Select all visible candidates
  const handleSelectAllVisible = () => {
    const visibleIds = filteredCandidates.map((c) => c.id);
    const allSelected = visibleIds.every((id) => selectedUserIds.includes(id));

    if (allSelected) {
      // Unselect all visible
      setSelectedUserIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      // Select all visible
      const newSet = new Set([...selectedUserIds, ...visibleIds]);
      setSelectedUserIds(Array.from(newSet));
    }
  };

  // Clear all selections
  const handleClearAll = () => {
    setSelectedUserIds([]);
  };

  // Submit assignment
  const handleSubmit = async () => {
    if (selectedUserIds.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất 1 người dùng để thêm vào câu lạc bộ');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await devAssignClubMembersApi(clubId, selectedUserIds);
      const count = res?.addedCount ?? selectedUserIds.length;
      onSuccess(count);
      onClose();
    } catch (error: any) {
      console.error('[DevClubMembersModal] Lỗi gán thành viên:', error);
      Alert.alert('Thất bại', error?.message || 'Có lỗi xảy ra khi thêm thành viên vào câu lạc bộ');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visible) return null;

  const isAllVisibleSelected =
    filteredCandidates.length > 0 &&
    filteredCandidates.every((c) => selectedUserIds.includes(c.id));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.devBadge}>
                <Ionicons name="construct" size={13} color="#FFFFFF" />
                <Text style={styles.devBadgeText}>DEV PANEL</Text>
              </View>
              <Text style={styles.modalTitle}>Gán Thành Viên Vào CLB</Text>
              {clubName ? (
                <Text style={styles.clubSubtitle} numberOfLines={1}>
                  CLB: {clubName}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Search & Filter Bar */}
          <View style={styles.searchSection}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={18} color="#94A3B8" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm theo tên, email..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterTabsRow}>
              <TouchableOpacity
                style={[styles.filterChip, filterRole === 'ALL' && styles.filterChipActive]}
                activeOpacity={0.7}
                onPress={() => setFilterRole('ALL')}
              >
                <Text style={[styles.filterChipText, filterRole === 'ALL' && styles.filterChipTextActive]}>
                  Tất cả ({candidates.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterChip, filterRole === 'TESTER' && styles.filterChipActive]}
                activeOpacity={0.7}
                onPress={() => setFilterRole('TESTER')}
              >
                <Text style={[styles.filterChipText, filterRole === 'TESTER' && styles.filterChipTextActive]}>
                  Dev Testers ({candidates.filter((c) => c.isDevTester).length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterChip, filterRole === 'PLAYER' && styles.filterChipActive]}
                activeOpacity={0.7}
                onPress={() => setFilterRole('PLAYER')}
              >
                <Text style={[styles.filterChipText, filterRole === 'PLAYER' && styles.filterChipTextActive]}>
                  Players
                </Text>
              </TouchableOpacity>
            </View>

            {/* Selection Toolbar */}
            <View style={styles.selectionToolbar}>
              <Text style={styles.selectionCountText}>
                Đã chọn: <Text style={styles.selectionCountHighlight}>{selectedUserIds.length}</Text> / {candidates.length} người
              </Text>

              <View style={styles.toolbarActionBtns}>
                {filteredCandidates.length > 0 && (
                  <TouchableOpacity
                    style={styles.actionTextBtn}
                    activeOpacity={0.7}
                    onPress={handleSelectAllVisible}
                  >
                    <Ionicons
                      name={isAllVisibleSelected ? 'checkbox' : 'checkbox-outline'}
                      size={15}
                      color="#7C3AED"
                    />
                    <Text style={styles.actionTextBtnLabel}>
                      {isAllVisibleSelected ? 'Bỏ chọn trang' : 'Chọn tất cả'}
                    </Text>
                  </TouchableOpacity>
                )}

                {selectedUserIds.length > 0 && (
                  <TouchableOpacity
                    style={[styles.actionTextBtn, { marginLeft: 10 }]}
                    activeOpacity={0.7}
                    onPress={handleClearAll}
                  >
                    <Ionicons name="trash-outline" size={14} color="#EF4444" />
                    <Text style={[styles.actionTextBtnLabel, { color: '#EF4444' }]}>Xóa chọn</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Candidate List */}
          <ScrollView
            style={styles.candidateList}
            contentContainerStyle={styles.candidateListContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {loading ? (
              <View style={styles.centerBox}>
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text style={styles.loadingText}>Đang tải danh sách người dùng khả dụng...</Text>
              </View>
            ) : filteredCandidates.length === 0 ? (
              <View style={styles.centerBox}>
                <Ionicons name="people-outline" size={44} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>
                  {candidates.length === 0
                    ? 'Không có ứng viên khả dụng'
                    : 'Không tìm thấy kết quả phù hợp'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {candidates.length === 0
                    ? 'Tất cả người dùng trong hệ thống đều đã tham gia câu lạc bộ này.'
                    : 'Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc.'}
                </Text>
              </View>
            ) : (
              filteredCandidates.map((candidate) => {
                const isSelected = selectedUserIds.includes(candidate.id);
                return (
                  <TouchableOpacity
                    key={candidate.id}
                    style={[styles.candidateCard, isSelected && styles.candidateCardSelected]}
                    activeOpacity={0.75}
                    onPress={() => handleToggleUser(candidate.id)}
                  >
                    {/* Custom Checkbox */}
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>

                    {/* Avatar */}
                    {candidate.avatarUrl ? (
                      <Image source={{ uri: candidate.avatarUrl }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarFallbackText}>
                          {(candidate.fullName || candidate.email || 'U').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}

                    {/* User Details */}
                    <View style={styles.candidateInfo}>
                      <View style={styles.nameRow}>
                        <Text style={styles.candidateName} numberOfLines={1}>
                          {candidate.fullName || 'Người dùng #' + candidate.id}
                        </Text>
                        {candidate.isDevTester && (
                          <View style={styles.devTesterBadge}>
                            <Text style={styles.devTesterBadgeText}>TESTER</Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.candidateEmail} numberOfLines={1}>
                        {candidate.email}
                      </Text>

                      <View style={styles.metaRow}>
                        <View style={styles.eloBadge}>
                          <Ionicons name="trophy-outline" size={11} color="#D97706" />
                          <Text style={styles.eloText}>{candidate.elo || 1000} Elo</Text>
                        </View>
                        {candidate.role && (
                          <View style={styles.roleBadge}>
                            <Text style={styles.roleBadgeText}>{candidate.role}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.7}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Đóng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                (selectedUserIds.length === 0 || isSubmitting) && styles.confirmButtonDisabled,
              ]}
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={selectedUserIds.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="person-add" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.confirmButtonText}>
                    Gán {selectedUserIds.length > 0 ? `(${selectedUserIds.length})` : ''} vào CLB
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    minHeight: '65%',
    display: 'flex',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  devBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
    gap: 4,
  },
  devBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  clubSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    height: '100%',
  },
  filterTabsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#F3E8FF',
    borderColor: '#C084FC',
  },
  filterChipText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#7C3AED',
    fontWeight: '700',
  },
  selectionToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingVertical: 4,
  },
  selectionCountText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  selectionCountHighlight: {
    color: '#7C3AED',
    fontWeight: '700',
  },
  toolbarActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  actionTextBtnLabel: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
  },
  candidateList: {
    flex: 1,
  },
  candidateListContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 24,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 18,
  },
  candidateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  candidateCardSelected: {
    backgroundColor: '#FAF5FF',
    borderColor: '#A855F7',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarFallbackText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C3AED',
  },
  candidateInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  candidateName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    flexShrink: 1,
  },
  devTesterBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  devTesterBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#7C3AED',
  },
  candidateEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 6,
  },
  eloBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  eloText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  roleBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
  },
  confirmButtonDisabled: {
    backgroundColor: '#C4B5FD',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
