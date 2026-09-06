import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MOCK_POSTS } from '../../../shared/api/mockCommunityDb';
import { fetchPostsApi } from '../../../shared/api/posts';
import { Post } from '../../../entities/post';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface SocialSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectUser?: (userId: string) => void;
  onSelectClub?: (clubInfo: any) => void;
  newPost?: Post | null;
}

type SearchTab = 'ALL' | 'POSTS' | 'MATCHES' | 'USERS' | 'CLUBS';

export function SocialSearchModal({
  visible,
  onClose,
  onSelectUser,
  onSelectClub,
  newPost,
}: SocialSearchModalProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('ALL');
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [apiPosts, setApiPosts] = useState<Post[]>([]);

  // Safe top padding for notch / status bar
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 47 : StatusBar.currentHeight || 24);

  // ── Smart Filter States ──
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [postTypeFilter, setPostTypeFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'NEWEST' | 'POPULAR'>('NEWEST');
  const [showSmartFilterSheet, setShowSmartFilterSheet] = useState(false);

  // Active filters count
  const activeFiltersCount = (selectedSport ? 1 : 0) + (postTypeFilter ? 1 : 0) + (sortBy === 'POPULAR' ? 1 : 0);

  // Fetch real posts from backend when search modal opens
  useEffect(() => {
    if (visible) {
      fetchPostsApi(0, 20)
        .then(({ posts }) => setApiPosts(posts))
        .catch(() => {});
    }
  }, [visible]);

  // Combine real posts + new post + mock posts (unique by ID)
  const allPostsSource = useMemo(() => {
    const list: Post[] = [];
    if (newPost) list.push(newPost);
    if (apiPosts.length > 0) list.push(...apiPosts);
    list.push(...MOCK_POSTS);

    const map = new Map<string, Post>();
    list.forEach((p) => {
      if (p && p.id && !map.has(p.id)) {
        map.set(p.id, p);
      }
    });
    return Array.from(map.values());
  }, [newPost, apiPosts]);

  // Real-time Smart Filtering across ALL posts
  const filteredPosts = useMemo(() => {
    const q = query.toLowerCase().trim();
    let list = allPostsSource;

    // Filter by Sport
    if (selectedSport) {
      list = list.filter((p) => {
        const sportName = p.matchAttachment?.sportName || p.sportName;
        return sportName?.toLowerCase().includes(selectedSport.toLowerCase());
      });
    }

    // Filter by Post Type
    if (postTypeFilter) {
      list = list.filter((p) => p.type === postTypeFilter);
    }

    // Filter by Query text
    if (q) {
      list = list.filter((p) => {
        return (
          p.content?.toLowerCase().includes(q) ||
          p.author?.name?.toLowerCase().includes(q) ||
          p.clubInfo?.name?.toLowerCase().includes(q) ||
          p.matchAttachment?.sportName?.toLowerCase().includes(q) ||
          p.matchAttachment?.venueName?.toLowerCase().includes(q) ||
          p.venuePromoAttachment?.venueName?.toLowerCase().includes(q)
        );
      });
    } else if (activeTab !== 'CLUBS' && !selectedSport && !postTypeFilter) {
      // If no query and no smart filter active, empty list for non-CLUBS tabs
      return [];
    }

    // Filter by Tab
    if (activeTab === 'CLUBS') {
      list = list.filter((p) => {
        const isClubPost = !!p.clubInfo || p.audience === 'CLUB_MEMBERS';
        if (!isClubPost) return false;
        if (selectedClubId) {
          return p.clubInfo?.id === selectedClubId;
        }
        return true;
      });
    } else if (activeTab === 'MATCHES') {
      list = list.filter((p) => p.type === 'MATCH_FINDING');
    }

    // Sort order
    if (sortBy === 'POPULAR') {
      list = [...list].sort((a, b) => {
        const totalA = (a.likesCount || a.likeCount || 0) + (a.commentsCount || 0);
        const totalB = (b.likesCount || b.likeCount || 0) + (b.commentsCount || 0);
        return totalB - totalA;
      });
    }

    return list;
  }, [query, allPostsSource, activeTab, selectedClubId, selectedSport, postTypeFilter, sortBy]);

  const filteredMatches = useMemo(() => {
    return filteredPosts.filter((p) => p.type === 'MATCH_FINDING');
  }, [filteredPosts]);

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    const map = new Map<string, any>();
    allPostsSource.forEach((p) => {
      if (p.author && (p.author.name?.toLowerCase().includes(q) || p.author.handle?.toLowerCase().includes(q))) {
        map.set(p.author.id, p.author);
      }
    });
    return Array.from(map.values());
  }, [query, allPostsSource]);

  const availableClubsList = useMemo(() => {
    const map = new Map<string, any>();
    allPostsSource.forEach((p) => {
      if (p.clubInfo) {
        map.set(p.clubInfo.id, p.clubInfo);
      }
    });
    const defaultClubs = [
      { id: 'club-1', name: 'Pickleball Cầu Giấy Official', avatarUrl: '' },
      { id: 'club-2', name: 'CLB Bóng Đá Phủi Hà Nội', avatarUrl: '' },
    ];
    defaultClubs.forEach((c) => {
      if (!map.has(c.id)) map.set(c.id, c);
    });
    return Array.from(map.values());
  }, [allPostsSource]);

  const filteredClubs = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      return activeTab === 'CLUBS' ? availableClubsList : [];
    }
    return availableClubsList.filter((c) => c.name.toLowerCase().includes(q));
  }, [query, availableClubsList, activeTab]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.safeArea, { paddingTop: topPadding }]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

        {/* ── Search Bar Header ── */}
        <View style={styles.searchHeader}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={onClose}>
            <Ionicons name="arrow-back" size={22} color={COLORS.onSurface} />
          </TouchableOpacity>

          <View style={styles.searchInputWrapper}>
            <Ionicons name="search-outline" size={18} color={COLORS.grayText} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm bài viết, câu lạc bộ, người dùng..."
              placeholderTextColor={COLORS.outline}
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
            />

            {query.length > 0 && (
              <TouchableOpacity activeOpacity={0.7} onPress={() => setQuery('')} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={18} color={COLORS.grayText} />
              </TouchableOpacity>
            )}

            <View style={styles.searchInnerDivider} />

            {/* 🎛️ 3-Line Filter Settings Button Integrated Inside Search Input */}
            <TouchableOpacity
              style={styles.inlineFilterBtn}
              activeOpacity={0.7}
              onPress={() => setShowSmartFilterSheet(true)}
            >
              <Ionicons
                name="options-outline"
                size={19}
                color={activeFiltersCount > 0 ? COLORS.primary : COLORS.grayText}
              />
              {activeFiltersCount > 0 && (
                <View style={styles.inlineFilterDot}>
                  <Text style={styles.inlineFilterDotText}>{activeFiltersCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Search Filter Tabs ── */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'ALL' && styles.tabChipActive]}
            onPress={() => setActiveTab('ALL')}
          >
            <Text style={[styles.tabText, activeTab === 'ALL' && styles.tabTextActive]}>Tất cả</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'CLUBS' && styles.tabChipActive]}
            onPress={() => setActiveTab('CLUBS')}
          >
            <Text style={[styles.tabText, activeTab === 'CLUBS' && styles.tabTextActive]}>Câu lạc bộ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'POSTS' && styles.tabChipActive]}
            onPress={() => setActiveTab('POSTS')}
          >
            <Text style={[styles.tabText, activeTab === 'POSTS' && styles.tabTextActive]}>Bài viết</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'MATCHES' && styles.tabChipActive]}
            onPress={() => setActiveTab('MATCHES')}
          >
            <Text style={[styles.tabText, activeTab === 'MATCHES' && styles.tabTextActive]}>Kèo đấu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'USERS' && styles.tabChipActive]}
            onPress={() => setActiveTab('USERS')}
          >
            <Text style={[styles.tabText, activeTab === 'USERS' && styles.tabTextActive]}>Người dùng</Text>
          </TouchableOpacity>
        </View>

        {/* ── Club Filter Chips Row (Visible on CLUBS tab) ── */}
        {activeTab === 'CLUBS' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.clubFilterRow}
            contentContainerStyle={styles.clubFilterContainer}
          >
            <TouchableOpacity
              style={[styles.subTabChip, !selectedClubId && styles.subTabChipActive]}
              onPress={() => setSelectedClubId(null)}
            >
              <Text style={[styles.subTabText, !selectedClubId && styles.subTabTextActive]}>Tất cả CLB</Text>
            </TouchableOpacity>

            {availableClubsList.map((club) => (
              <TouchableOpacity
                key={club.id}
                style={[styles.subTabChip, selectedClubId === club.id && styles.subTabChipActive]}
                onPress={() => setSelectedClubId(selectedClubId === club.id ? null : club.id)}
              >
                {club.avatarUrl && club.avatarUrl.trim() ? (
                  <Image source={{ uri: club.avatarUrl.trim() }} style={styles.microClubAvatar} />
                ) : (
                  <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} />
                )}
                <Text
                  style={[styles.subTabText, selectedClubId === club.id && styles.subTabTextActive]}
                  numberOfLines={1}
                >
                  {club.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── Search Results List ── */}
        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          {!query.trim() && activeTab !== 'CLUBS' ? (
            <View style={styles.initialState}>
              <Ionicons name="search" size={48} color={COLORS.outline} />
              <Text style={styles.initialTitle}>Tìm kiếm trên Sporta</Text>
              <Text style={styles.initialSub}>
                Nhập tên môn thể thao (Pickleball, Cầu lông), tên người dùng hoặc địa điểm sân...
              </Text>
            </View>
          ) : filteredPosts.length === 0 && filteredUsers.length === 0 && filteredClubs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={44} color={COLORS.outline} />
              <Text style={styles.emptyTitle}>Không tìm thấy kết quả nào</Text>
              <Text style={styles.emptySub}>Thử tìm kiếm với từ khóa khác xem sao!</Text>
            </View>
          ) : (
            <View style={styles.resultsList}>
              {/* Clubs Results Section */}
              {(activeTab === 'ALL' || activeTab === 'CLUBS') && filteredClubs.length > 0 && (
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionTitle}>CÂU LẠC BỘ ({filteredClubs.length})</Text>
                  {filteredClubs.map((club) => (
                    <TouchableOpacity
                      key={club.id}
                      style={styles.userCard}
                      activeOpacity={0.8}
                      onPress={() => {
                        if (onSelectClub) onSelectClub(club);
                        onClose();
                      }}
                    >
                      {club.avatarUrl && club.avatarUrl.trim() ? (
                        <Image source={{ uri: club.avatarUrl.trim() }} style={styles.userAvatar} />
                      ) : (
                        <View style={[styles.userAvatar, { backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' }]}>
                          <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
                        </View>
                      )}
                      <View style={styles.userTextGroup}>
                        <Text style={styles.userName}>{club.name}</Text>
                        <Text style={styles.userHandle}>@club_{club.id} • Bấm để xem chi tiết CLB</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={COLORS.grayText} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Users Results Section */}
              {(activeTab === 'ALL' || activeTab === 'USERS') && filteredUsers.length > 0 && (
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionTitle}>NGƯỜI DÙNG ({filteredUsers.length})</Text>
                  {filteredUsers.map((user) => (
                    <TouchableOpacity
                      key={user.id}
                      style={styles.userCard}
                      activeOpacity={0.8}
                      onPress={() => {
                        if (onSelectUser) onSelectUser(user.id);
                        onClose();
                      }}
                    >
                      {user.avatar && user.avatar.trim() ? (
                        <Image source={{ uri: user.avatar.trim() }} style={styles.userAvatar} />
                      ) : (
                        <View style={[styles.userAvatar, { backgroundColor: '#059669', justifyContent: 'center', alignItems: 'center' }]}>
                          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{(user.name || 'U').charAt(0)}</Text>
                        </View>
                      )}
                      <View style={styles.userTextGroup}>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userHandle}>{user.handle}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={COLORS.grayText} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Match Finding Results Section */}
              {(activeTab === 'ALL' || activeTab === 'MATCHES') && filteredMatches.length > 0 && (
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionTitle}>KÈO ĐẤU THỂ THAO ({filteredMatches.length})</Text>
                  {filteredMatches.map((post) => (
                    <View key={post.id} style={styles.matchResultCard}>
                      <View style={styles.matchBadgeRow}>
                        <View style={styles.sportBadge}>
                          <Text style={styles.sportBadgeText}>{post.matchAttachment?.sportName}</Text>
                        </View>
                        <Text style={styles.slotsText}>Còn {post.matchAttachment?.slotsLeft} suất</Text>
                      </View>

                      <Text style={styles.matchTimeText}>{post.matchAttachment?.timeSlot}</Text>
                      <Text style={styles.matchVenueText}>{post.matchAttachment?.venueName}</Text>
                      <Text style={styles.matchPriceText}>{post.matchAttachment?.pricePerSlot}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Posts Results Section */}
              {(activeTab === 'ALL' || activeTab === 'POSTS') && filteredPosts.length > 0 && (
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionTitle}>BÀI VIẾT BẢNG TIN ({filteredPosts.length})</Text>
                  {filteredPosts.map((post) => (
                    <View key={post.id} style={styles.postResultCard}>
                      <View style={styles.postAuthorHeader}>
                        {post.author.avatar && post.author.avatar.trim() ? (
                          <Image source={{ uri: post.author.avatar.trim() }} style={styles.miniAvatar} />
                        ) : (
                          <View style={[styles.miniAvatar, { backgroundColor: '#059669', justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>{(post.author.name || 'U').charAt(0)}</Text>
                          </View>
                        )}
                        <View>
                          <Text style={styles.authorName}>{post.author.name}</Text>
                          <Text style={styles.postTime}>{post.createdAt}</Text>
                        </View>
                      </View>
                      <Text style={styles.postContent} numberOfLines={2}>
                        {post.content}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* 🎛️ Smart Filter Sheet Modal ── */}
        <Modal
          visible={showSmartFilterSheet}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSmartFilterSheet(false)}
        >
          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setShowSmartFilterSheet(false)}
          >
            <TouchableOpacity activeOpacity={1} style={styles.sheetContent}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>🎛️ Bộ Lọc Thông Minh</Text>
                <TouchableOpacity onPress={() => setShowSmartFilterSheet(false)}>
                  <Ionicons name="close" size={24} color={COLORS.onSurface} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
                {/* 1. Môn Thể Thao */}
                <Text style={styles.filterSectionLabel}>Môn Thể Thao</Text>
                <View style={styles.filterChipGrid}>
                  {[
                    { label: 'Tất cả môn', value: null },
                    { label: '🏓 Pickleball', value: 'Pickleball' },
                    { label: '🏸 Cầu lông', value: 'Cầu lông' },
                    { label: '⚽ Bóng đá', value: 'Bóng đá' },
                    { label: '🎾 Tennis', value: 'Tennis' },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.label}
                      style={[styles.filterSheetChip, selectedSport === item.value && styles.filterSheetChipActive]}
                      onPress={() => setSelectedSport(item.value)}
                    >
                      <Text style={[styles.filterSheetChipText, selectedSport === item.value && styles.filterSheetChipTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 2. Loại Bài Viết */}
                <Text style={styles.filterSectionLabel}>Loại Nội Dung</Text>
                <View style={styles.filterChipGrid}>
                  {[
                    { label: 'Tất cả bài viết', value: null },
                    { label: '🏆 Kèo tìm đối', value: 'MATCH_FINDING' },
                    { label: '🎟️ Khuyến mãi sân', value: 'VENUE_PROMO' },
                    { label: '💬 Chia sẻ cộng đồng', value: 'COMMUNITY' },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.label}
                      style={[styles.filterSheetChip, postTypeFilter === item.value && styles.filterSheetChipActive]}
                      onPress={() => setPostTypeFilter(item.value)}
                    >
                      <Text style={[styles.filterSheetChipText, postTypeFilter === item.value && styles.filterSheetChipTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 3. Sắp Xếp */}
                <Text style={styles.filterSectionLabel}>Thứ Tự Sắp Xếp</Text>
                <View style={styles.filterChipGrid}>
                  {[
                    { label: '🕒 Mới nhất', value: 'NEWEST' },
                    { label: '🔥 Quan tâm / Tương tác cao', value: 'POPULAR' },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.label}
                      style={[styles.filterSheetChip, sortBy === item.value && styles.filterSheetChipActive]}
                      onPress={() => setSortBy(item.value as any)}
                    >
                      <Text style={[styles.filterSheetChipText, sortBy === item.value && styles.filterSheetChipTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Sheet Action Buttons */}
              <View style={styles.sheetFooterRow}>
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={() => {
                    setSelectedSport(null);
                    setPostTypeFilter(null);
                    setSortBy('NEWEST');
                  }}
                >
                  <Text style={styles.resetBtnText}>Thiết lập lại</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => setShowSmartFilterSheet(false)}
                >
                  <Text style={styles.applyBtnText}>Áp dụng bộ lọc</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
    gap: 8,
  },
  backBtn: {
    padding: 6,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurface,
    padding: 0,
  },
  clearBtn: {
    padding: 2,
  },
  searchInnerDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.surfaceContainerHigh,
    marginHorizontal: 2,
  },
  inlineFilterBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  inlineFilterDot: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: COLORS.primary,
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  inlineFilterDotText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  // Sheet Modal Styles
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  sheetTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  sheetBody: {
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.md,
  },
  filterSectionLabel: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 13,
    color: COLORS.onSurface,
    marginTop: 12,
    marginBottom: 8,
  },
  filterChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterSheetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  filterSheetChipActive: {
    backgroundColor: COLORS.primaryOpacity08,
    borderColor: COLORS.primary,
  },
  filterSheetChipText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  filterSheetChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  sheetFooterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: 12,
    gap: 12,
  },
  resetBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  resetBtnText: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontWeight: '700',
  },
  applyBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  applyBtnText: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
    gap: 8,
  },
  clubFilterRow: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
    maxHeight: 44,
  },
  clubFilterContainer: {
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: 6,
    alignItems: 'center',
    gap: 8,
  },
  subTabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    gap: 6,
  },
  subTabChipActive: {
    backgroundColor: COLORS.primaryOpacity08,
    borderColor: COLORS.primary,
  },
  subTabText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  subTabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  microClubAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  tabChipActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  initialState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: SPACING.xl,
  },
  initialTitle: {
    ...TYPOGRAPHY.titleLg,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginTop: 12,
  },
  initialSub: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.grayText,
    textAlign: 'center',
    marginTop: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: 10,
  },
  emptySub: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.grayText,
    marginTop: 4,
  },
  resultsList: {
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  sectionBlock: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
  },
  sectionTitle: {
    fontFamily: 'HankenGrotesk-ExtraBold',
    fontSize: 11,
    color: COLORS.grayText,
    paddingHorizontal: SPACING.marginMobile,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  userTextGroup: {
    flex: 1,
  },
  userName: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  userHandle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.grayText,
  },
  matchResultCard: {
    marginHorizontal: SPACING.marginMobile,
    marginVertical: 4,
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    gap: 4,
  },
  matchBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sportBadge: {
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sportBadgeText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 11,
    color: COLORS.primary,
  },
  slotsText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 11,
    color: '#D97706',
  },
  matchTimeText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 14,
    color: COLORS.onSurface,
    marginTop: 4,
  },
  matchVenueText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  matchPriceText: {
    fontFamily: 'HankenGrotesk-ExtraBold',
    fontSize: 13,
    color: COLORS.primary,
    marginTop: 2,
  },
  postResultCard: {
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
    gap: 6,
  },
  postAuthorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  authorName: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  postTime: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    color: COLORS.grayText,
  },
  postContent: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
});
