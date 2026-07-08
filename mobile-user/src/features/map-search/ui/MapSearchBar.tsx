import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { SearchResultItem } from '../model/useMapSearchAutocomplete';

interface MapSearchBarProps {
  query: string;
  onChangeQuery: (text: string) => void;
  results: SearchResultItem[];
  loading: boolean;
  onSelectResult: (item: SearchResultItem) => void;
}

export const MapSearchBar = ({
  query,
  onChangeQuery,
  results,
  loading,
  onSelectResult,
}: MapSearchBarProps) => {
  const handleClear = () => {
    onChangeQuery('');
    Keyboard.dismiss();
  };

  const renderItem = ({ item }: { item: SearchResultItem }) => {
    const isVenue = item.type === 'venue';
    const title = isVenue ? item.data.name : item.data.description;
    const subtitle = isVenue ? item.data.location : 'Địa điểm';
    const iconName = isVenue ? 'sports' : 'location-on';

    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => {
          onSelectResult(item);
          handleClear(); // Clear and hide results after selection
        }}
      >
        <View style={[styles.iconWrapper, isVenue ? styles.iconVenue : styles.iconPlace]}>
          <MaterialIcons name={iconName} size={18} color={isVenue ? COLORS.primary : COLORS.amber} />
        </View>
        <View style={styles.resultTextContainer}>
          <Text style={styles.resultTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.resultSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={20} color={COLORS.outline} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Tìm sân, đường, phường..."
          placeholderTextColor={COLORS.outline}
          value={query}
          onChangeText={onChangeQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {loading && <ActivityIndicator size="small" color={COLORS.primary} style={styles.loading} />}
        {query.length > 0 && !loading && (
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
            <MaterialIcons name="close" size={20} color={COLORS.outline} />
          </TouchableOpacity>
        )}
      </View>

      {query.length > 0 && results.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={results}
            keyExtractor={(item, index) =>
              item.type === 'venue' ? `venue-${item.data.id}` : `place-${item.data.place_id}-${index}`
            }
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Will be dynamically positioned in MapScreen
    width: '100%',
    zIndex: 100,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    height: 48,
    paddingHorizontal: SPACING.md,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 15,
    color: COLORS.onSurface,
    padding: 0,
    height: '100%',
  },
  clearBtn: {
    padding: SPACING.xs,
  },
  loading: {
    padding: SPACING.xs,
  },
  dropdown: {
    position: 'absolute',
    top: 56, // 48 (searchBox height) + 8 (spacing)
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 300,
    overflow: 'hidden',
  },
  list: {
    flexGrow: 0,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  iconVenue: {
    backgroundColor: COLORS.primaryOpacity10,
  },
  iconPlace: {
    backgroundColor: COLORS.amberOpacity10,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontWeight: '600' as const,
    fontSize: 14,
    color: COLORS.onSurface,
  },
  resultSubtitle: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 12,
    color: COLORS.outline,
    marginTop: 2,
  },
});
