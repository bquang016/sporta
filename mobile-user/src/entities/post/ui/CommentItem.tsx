import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { PostComment } from '../model/post.types';
import { COLORS, TYPOGRAPHY } from '../../../shared/config/theme';

interface CommentItemProps {
  comment: PostComment;
  onUserPress?: (userId: string) => void;
  onLikeComment?: (commentId: string) => void;
  onReplyPress?: (comment: PostComment) => void;
}

export const CommentItem = React.memo(({
  comment,
  onUserPress,
  onLikeComment,
  onReplyPress,
}: CommentItemProps) => {
  const isOwner = comment.author.role === 'owner' || comment.author.role === 'OWNER';

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.8} onPress={() => onUserPress?.(comment.author.id)}>
        <Image
          source={{
            uri:
              comment.author.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          }}
          style={styles.avatar}
        />
      </TouchableOpacity>

      <View style={styles.commentContentWrapper}>
        {/* Facebook-style Gray Bubble */}
        <View style={styles.contentBubble}>
          <TouchableOpacity
            style={styles.authorRow}
            activeOpacity={0.8}
            onPress={() => onUserPress?.(comment.author.id)}
          >
            <Text style={styles.name}>{comment.author.name}</Text>
            {isOwner && (
              <View style={styles.ownerBadge}>
                <Text style={styles.ownerBadgeText}>Chủ sân</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.body}>{comment.content}</Text>
        </View>

        {/* Footer Actions Row (Time, Like, Reply) */}
        <View style={styles.footerRow}>
          <Text style={styles.timeText}>{comment.createdAt || 'Vừa xong'}</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onLikeComment?.(comment.id)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={styles.actionText}>Thích</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onReplyPress?.(comment)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={styles.actionText}>Phản hồi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    marginTop: 2,
  },
  commentContentWrapper: {
    flex: 1,
    alignItems: 'flex-start',
  },
  contentBubble: {
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
    maxWidth: '100%',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  name: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  ownerBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  ownerBadgeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  body: {
    ...TYPOGRAPHY.bodySm,
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
    marginLeft: 8,
  },
  timeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  actionText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
});
