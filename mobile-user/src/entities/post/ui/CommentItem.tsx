import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Comment } from '../model/post.types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/config/theme';

interface CommentItemProps {
  comment: Comment;
  onUserPress?: (userId: string) => void;
}

export const CommentItem = React.memo(({ comment, onUserPress }: CommentItemProps) => {
  const isOwner = comment.author.role === 'owner';
  
  // Formatting is handled by the API/store directly

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.8} onPress={() => onUserPress?.(comment.author.id)}>
        <Image source={{ uri: comment.author.avatar }} style={styles.avatar} />
      </TouchableOpacity>
      
      <View style={styles.contentBubble}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.nameContainer}
            activeOpacity={0.8}
            onPress={() => onUserPress?.(comment.author.id)}
          >
            <Text style={styles.name}>{comment.author.name}</Text>
            {isOwner && (
              <View style={styles.ownerBadge}>
                <Text style={styles.ownerBadgeText}>Chủ Sân</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.time}>{comment.createdAt}</Text>
        </View>
        
        <Text style={styles.body}>{comment.content}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceDim,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.1)',
  },
  contentBubble: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  ownerBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  ownerBadgeText: {
    fontSize: 9,
    fontFamily: 'HankenGrotesk-Bold',
    color: COLORS.onPrimary,
    fontWeight: '700',
  },
  time: {
    fontFamily: 'HankenGrotesk-Medium',
    fontSize: 11,
    color: COLORS.grayText,
  },
  body: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 14,
    color: COLORS.onSurface,
    lineHeight: 20,
  },
});
