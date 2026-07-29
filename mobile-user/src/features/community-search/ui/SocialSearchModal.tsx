import React, { useState, useMemo } from 'react';
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
import { Post } from '../../../entities/post';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface SocialSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectUser?: (userId: string) => void;
}

type SearchTab = 'ALL' | 'POSTS' | 'MATCHES' | 'USERS';

export function SocialSearchModal({
  visible,
  onClose,
  onSelectUser,
}: SocialSearchModalProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('ALL');

  // Calculate safe top padding for iPhone notch / Dynamic Island & Android status bar
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 47 : StatusBar.currentHeight || 24);

  // Real-time filtering
  const filteredPosts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return MOCK_POSTS.filter(
      (p) =>
        p.content.toLowerCase().includes(q) ||
        p.author.name.toLowerCase().includes(q) ||
        p.matchAttachment?.sportName.toLowerCase().includes(q) ||
        p.matchAttachment?.venueName?.toLowerCase().includes(q) ||
        p.venuePromoAttachment?.venueName.toLowerCase().includes(q)
    );
  }, [query]);

  const filteredMatches = useMemo(() => {
    return filteredPosts.filter((p) => p.type === 'MATCH_FINDING');
  }, [filteredPosts]);

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    const map = new Map<string, any>();
    MOCK_POSTS.forEach((p) => {
      if (p.author.name.toLowerCase().includes(q) || p.author.handle.toLowerCase().includes(q)) {
        map.set(p.author.id, p.author);
      }
    });
    return Array.from(map.values());
  }, [query]);

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
              placeholder="Tìm bài viết, kèo đấu, người dùng..."
              placeholderTextColor={COLORS.outline}
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity activeOpacity={0.7} onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.grayText} />
              </TouchableOpacity>
            )}
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

        {/* ── Search Results List ── */}
        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          {!query.trim() ? (
            <View style={styles.initialState}>
              <Ionicons name="search" size={48} color={COLORS.outline} />
              <Text style={styles.initialTitle}>Tìm kiếm trên Sporta</Text>
              <Text style={styles.initialSub}>
                Nhập tên môn thể thao (Pickleball, Cầu lông), tên người dùng hoặc địa điểm sân...
              </Text>
            </View>
          ) : filteredPosts.length === 0 && filteredUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={44} color={COLORS.outline} />
              <Text style={styles.emptyTitle}>Không tìm thấy kết quả nào</Text>
              <Text style={styles.emptySub}>Thử tìm kiếm với từ khóa khác xem sao!</Text>
            </View>
          ) : (
            <View style={styles.resultsList}>
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
                      <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
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
                        <Image source={{ uri: post.author.avatar }} style={styles.miniAvatar} />
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
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
    gap: 8,
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
