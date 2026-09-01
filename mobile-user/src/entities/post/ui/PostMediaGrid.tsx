import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text, Dimensions } from 'react-native';
import { BORDER_RADIUS } from '../../../shared/config/theme';

interface PostMediaGridProps {
  mediaUrls?: string[];
  onPressImage: (index: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 3;
const GRID_BORDER_RADIUS = BORDER_RADIUS.md;

export const PostMediaGrid = React.memo(({ mediaUrls, onPressImage }: PostMediaGridProps) => {
  if (!mediaUrls || mediaUrls.length === 0) return null;

  const count = mediaUrls.length;

  // ── Layout 1: Single Image ──
  if (count === 1) {
    return (
      <View style={styles.gridContainer}>
        <TouchableOpacity
          activeOpacity={0.92}
          style={styles.singleImageWrap}
          onPress={() => onPressImage(0)}
        >
          <Image
            source={{ uri: mediaUrls[0] }}
            style={styles.singleImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
    );
  }

  // ── Layout 2: Two Images Side by Side ──
  if (count === 2) {
    return (
      <View style={[styles.gridContainer, styles.twoImagesRow]}>
        <TouchableOpacity
          activeOpacity={0.92}
          style={styles.halfImageWrap}
          onPress={() => onPressImage(0)}
        >
          <Image
            source={{ uri: mediaUrls[0] }}
            style={styles.fillImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.92}
          style={styles.halfImageWrap}
          onPress={() => onPressImage(1)}
        >
          <Image
            source={{ uri: mediaUrls[1] }}
            style={styles.fillImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
    );
  }

  // ── Layout 3: Three Images (1 Large Left, 2 Stacked Right) ──
  if (count === 3) {
    return (
      <View style={[styles.gridContainer, styles.threeImagesRow]}>
        <TouchableOpacity
          activeOpacity={0.92}
          style={styles.threeMainWrap}
          onPress={() => onPressImage(0)}
        >
          <Image
            source={{ uri: mediaUrls[0] }}
            style={styles.fillImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <View style={styles.threeSideColumn}>
          <TouchableOpacity
            activeOpacity={0.92}
            style={styles.threeSideHalf}
            onPress={() => onPressImage(1)}
          >
            <Image
              source={{ uri: mediaUrls[1] }}
              style={styles.fillImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.92}
            style={styles.threeSideHalf}
            onPress={() => onPressImage(2)}
          >
            <Image
              source={{ uri: mediaUrls[2] }}
              style={styles.fillImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Layout 4+: Four or More Images (2x2 Grid with +N Badge) ──
  const displayImages = mediaUrls.slice(0, 4);
  const remainingCount = count - 4;

  return (
    <View style={styles.gridContainer}>
      <View style={styles.fourGrid}>
        {displayImages.map((url, index) => {
          const isFourthWithMore = index === 3 && remainingCount > 0;
          return (
            <TouchableOpacity
              key={`${url}-${index}`}
              activeOpacity={0.92}
              style={styles.quarterImageWrap}
              onPress={() => onPressImage(index)}
            >
              <Image
                source={{ uri: url }}
                style={styles.fillImage}
                resizeMode="cover"
              />
              {isFourthWithMore && (
                <View style={styles.moreOverlay}>
                  <Text style={styles.moreText}>+{remainingCount + 1}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  gridContainer: {
    width: '100%',
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    marginTop: 8,
    marginBottom: 4,
  },
  singleImageWrap: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: '#1E293B',
    borderRadius: 0,
  },
  singleImage: {
    width: '100%',
    height: '100%',
  },
  fillImage: {
    width: '100%',
    height: '100%',
  },
  twoImagesRow: {
    flexDirection: 'row',
    height: 240,
    gap: GRID_GAP,
  },
  halfImageWrap: {
    flex: 1,
    height: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 0,
  },
  threeImagesRow: {
    flexDirection: 'row',
    height: 270,
    gap: GRID_GAP,
  },
  threeMainWrap: {
    flex: 2,
    height: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 0,
  },
  threeSideColumn: {
    flex: 1.2,
    height: '100%',
    gap: GRID_GAP,
  },
  threeSideHalf: {
    flex: 1,
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 0,
  },
  fourGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: 280,
    gap: GRID_GAP,
  },
  quarterImageWrap: {
    width: '49.5%',
    height: '49.4%',
    backgroundColor: '#1E293B',
    position: 'relative',
    borderRadius: 0,
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
