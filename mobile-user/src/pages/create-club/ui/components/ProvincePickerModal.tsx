import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  ActivityIndicator 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';

export interface ProvinceItem {
  name: string;
  code: number;
  codename: string;
  division_type: string;
}

export interface ProvincePickerModalProps {
  visible: boolean;
  onClose: () => void;
  provinces: ProvinceItem[];
  onSelectProvince: (name: string, code: number) => void;
  loading: boolean;
}

export function ProvincePickerModal({ 
  visible, 
  onClose, 
  provinces, 
  onSelectProvince, 
  loading 
}: ProvincePickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProvinces = provinces.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (item: ProvinceItem) => {
    onSelectProvince(item.name, item.code);
    setSearchQuery(''); // reset search query on select
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn khu vực hoạt động</Text>
            <TouchableOpacity onPress={handleClose}>
              <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color={COLORS.outline} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm tỉnh, thành phố..."
              placeholderTextColor={COLORS.outline}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="cancel" size={18} color={COLORS.outline} />
              </TouchableOpacity>
            )}
          </View>

          {/* Loading or List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Đang tải danh sách tỉnh thành...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredProvinces}
              keyExtractor={(item) => item.code.toString()}
              contentContainerStyle={styles.listContainer}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.provinceItem}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="location-on" size={18} color={COLORS.outline} />
                  <Text style={styles.provinceName}>{item.name}</Text>
                  <MaterialIcons name="chevron-right" size={20} color={COLORS.outlineVariant} style={styles.chevronIcon} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="location-off" size={48} color={COLORS.outlineVariant} />
                  <Text style={styles.emptyText}>Không tìm thấy tỉnh thành nào phù hợp</Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    height: '75%', // fixed size to display properly
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryOpacity10,
  },
  modalTitle: {
    ...TYPOGRAPHY.bodyMd,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
    borderRadius: BORDER_RADIUS.default,
    paddingHorizontal: SPACING.sm,
    height: 44,
    marginTop: SPACING.md,
    marginBottom: SPACING.base,
  },
  searchIcon: {
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    color: COLORS.onSurface,
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    paddingVertical: 0, // fix for Android cut-off
  },
  listContainer: {
    paddingVertical: SPACING.xs,
  },
  provinceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryOpacity05,
  },
  provinceName: {
    color: COLORS.onSurface,
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  chevronIcon: {
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    color: COLORS.outline,
    ...TYPOGRAPHY.labelSm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
    gap: SPACING.sm,
  },
  emptyText: {
    color: COLORS.outline,
    ...TYPOGRAPHY.labelSm,
    textAlign: 'center',
  },
});
