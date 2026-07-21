import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommunityFeed } from '../../../features/community-feed';
import { CreatePostModal } from '../../../features/create-post';
import { ReactionOverlayProvider } from '../../../features/like-post';
import { CURRENT_USER } from '../../../shared/api/mockCommunityDb';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

export function SocialScreen() {
  const [createModalVisible, setCreateModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Cộng đồng</Text>
          <Text style={styles.headerSubtitle}>Giao lưu & chia sẻ đam mê</Text>
        </View>
        <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.onSurface} />
        </TouchableOpacity>
      </View>

      <ReactionOverlayProvider>
        <View style={styles.container}>
          {/* ── Quick Compose Box ── */}
          <View style={styles.composeBox}>
            <Image source={{ uri: CURRENT_USER.avatar }} style={styles.avatar} />
            <TouchableOpacity
              style={styles.composeInputPlaceholder}
              activeOpacity={0.8}
              onPress={() => setCreateModalVisible(true)}
            >
              <Text style={styles.composePlaceholderText}>Bạn muốn chia sẻ điều gì hôm nay?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imageIconBtn}
              activeOpacity={0.7}
              onPress={() => setCreateModalVisible(true)}
            >
              <Ionicons name="image" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* ── Newsfeed ── */}
          <View style={styles.feedWrapper}>
            <CommunityFeed />
          </View>
        </View>
      </ReactionOverlayProvider>

      {/* ── Floating Action Button ── */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => setCreateModalVisible(true)}
      >
        <Ionicons name="create" size={24} color={COLORS.onPrimary} />
      </TouchableOpacity>

      {/* ── Create Post Modal Overlay ── */}
      <CreatePostModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  headerTitleContainer: {
    gap: 2,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineLgMobile,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.grayText,
    fontWeight: '500',
  },
  headerIconButton: {
    padding: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  composeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
    gap: SPACING.sm,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceDim,
  },
  composeInputPlaceholder: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  composePlaceholderText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.outline,
    fontSize: 13,
  },
  imageIconBtn: {
    padding: 4,
  },
  feedWrapper: {
    flex: 1,
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90, // Above bottom tab bar
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    // Diffused shadow from DESIGN_web_owner.md
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
});

export default SocialScreen;
