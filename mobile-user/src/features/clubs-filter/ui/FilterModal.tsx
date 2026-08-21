import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';
import { ClubFilterState } from '../model/types';
import {
  SPORT_OPTIONS,
  MEMBER_OPTIONS,
  ELO_OPTIONS,
  PRIVACY_OPTIONS,
} from '../model/constants';
import { SegmentedFilterRow } from './SegmentedFilterRow';
import { LocationFilterCard } from './LocationFilterCard';
import { useProvinces } from '../hooks/useProvinces';
import { useWards } from '../hooks/useWards';
import { ProvinceItem } from '../../../pages/create-club/ui/components/ProvincePickerModal';
import { WardItem } from '../../../pages/create-club/ui/components/WardPickerModal';

export interface FilterModalProps {
  visible: boolean;
  filters: ClubFilterState;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
  onSelectField: <K extends keyof ClubFilterState>(key: K, value: ClubFilterState[K]) => void;
  onSelectProvince: (name: string, code: number) => void;
  onSelectWard: (name: string) => void;
  onClearProvince: () => void;
  onClearWard: () => void;
}

type ModalViewMode = 'main' | 'province' | 'ward';

const POPULAR_CITIES = [
  { name: 'Thành phố Hà Nội', short: 'Hà Nội' },
  { name: 'Thành phố Hồ Chí Minh', short: 'TP. HCM' },
  { name: 'Thành phố Đà Nẵng', short: 'Đà Nẵng' },
  { name: 'Thành phố Hải Phòng', short: 'Hải Phòng' },
  { name: 'Tỉnh Bình Dương', short: 'Bình Dương' },
  { name: 'Thành phố Cần Thơ', short: 'Cần Thơ' },
];

export function FilterModal({
  visible,
  filters,
  onClose,
  onApply,
  onReset,
  onSelectField,
  onSelectProvince,
  onSelectWard,
  onClearProvince,
  onClearWard,
}: FilterModalProps) {
  const [viewMode, setViewMode] = useState<ModalViewMode>('main');
  const [searchLocationQuery, setSearchLocationQuery] = useState('');

  // Fetch cached provinces and wards
  const { provinces, loading: loadingProvinces } = useProvinces();
  const { wards, loading: loadingWards } = useWards(filters.provinceCode);

  // Filter provinces by search text
  const filteredProvinces = useMemo(() => {
    if (!searchLocationQuery.trim()) return provinces;
    const q = searchLocationQuery.toLowerCase();
    return provinces.filter((p) => p.name.toLowerCase().includes(q));
  }, [provinces, searchLocationQuery]);

  // Filter wards by search text
  const filteredWards = useMemo(() => {
    if (!searchLocationQuery.trim()) return wards;
    const q = searchLocationQuery.toLowerCase();
    return wards.filter((w) => w.name.toLowerCase().includes(q));
  }, [wards, searchLocationQuery]);

  // Calculate active draft filter count
  const draftCount = useMemo(() => {
    let count = 0;
    if (filters.sport !== 'all') count++;
    if (filters.memberCount !== 'all') count++;
    if (filters.eloRange !== 'all') count++;
    if (filters.province !== 'all') count++;
    if (filters.ward !== 'all') count++;
    if (filters.privacy !== 'all') count++;
    return count;
  }, [filters]);

  const handleCloseModal = () => {
    setViewMode('main');
    setSearchLocationQuery('');
    onClose();
  };

  const handlePickProvince = (item: ProvinceItem) => {
    onSelectProvince(item.name, item.code);
    setSearchLocationQuery('');
    setViewMode('main');
  };

  const handlePickWard = (name: string) => {
    onSelectWard(name);
    setSearchLocationQuery('');
    setViewMode('main');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCloseModal}
    >
      <View style={styles.overlay}>
        {/* Backdrop dismiss */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleCloseModal}
        />

        <View style={styles.sheetContainer}>
          {/* Top Grabber Handle */}
          <View style={styles.handleBarWrapper}>
            <View style={styles.handleBar} />
          </View>

          {/* ===================== VIEW 1: MAIN FILTER CONTROLS ===================== */}
          {viewMode === 'main' && (
            <View style={styles.flexOne}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleGroup}>
                  <View style={styles.headerIconCircle}>
                    <MaterialIcons name="tune" size={20} color={COLORS.primary} />
                  </View>
                  <View>
                    <View style={styles.titleRow}>
                      <Text style={styles.modalTitle}>Bộ Lọc Câu Lạc Bộ</Text>
                      {draftCount > 0 && (
                        <View style={styles.activeCountBadge}>
                          <Text style={styles.activeCountBadgeText}>{draftCount}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.modalSubtitle}>Tùy chỉnh tiêu chí tìm kiếm của bạn</Text>
                  </View>
                </View>

                {draftCount > 0 ? (
                  <TouchableOpacity
                    onPress={onReset}
                    style={styles.resetBtn}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="refresh" size={14} color="#EF4444" />
                    <Text style={styles.resetBtnText}>Đặt lại</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleCloseModal}
                    style={styles.closeIconBtn}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="close" size={22} color="#64748B" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Scrollable Body */}
              <ScrollView
                style={styles.bodyScroll}
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={false}
              >
                {/* 1. Sport Filter */}
                <SegmentedFilterRow
                  title="Môn thể thao"
                  headerIcon="sports"
                  options={SPORT_OPTIONS}
                  selectedValue={filters.sport}
                  onSelect={(id) => onSelectField('sport', id)}
                />

                {/* 2. Location Filter (Drill down) */}
                <LocationFilterCard
                  province={filters.province}
                  ward={filters.ward}
                  onOpenProvincePicker={() => {
                    setSearchLocationQuery('');
                    setViewMode('province');
                  }}
                  onOpenWardPicker={() => {
                    setSearchLocationQuery('');
                    setViewMode('ward');
                  }}
                  onClearProvince={onClearProvince}
                  onClearWard={onClearWard}
                />

                {/* 3. Member Size Filter */}
                <SegmentedFilterRow
                  title="Quy mô thành viên"
                  headerIcon="groups"
                  options={MEMBER_OPTIONS}
                  selectedValue={filters.memberCount}
                  onSelect={(id) => onSelectField('memberCount', id)}
                />

                {/* 4. ELO Rank Filter */}
                <SegmentedFilterRow
                  title="Trình độ / Điểm ELO"
                  headerIcon="military-tech"
                  options={ELO_OPTIONS}
                  selectedValue={filters.eloRange}
                  onSelect={(id) => onSelectField('eloRange', id)}
                />

                {/* 5. Privacy Mode */}
                <SegmentedFilterRow
                  title="Chế độ câu lạc bộ"
                  headerIcon="verified-user"
                  options={PRIVACY_OPTIONS}
                  selectedValue={filters.privacy}
                  onSelect={(id) => onSelectField('privacy', id)}
                />
              </ScrollView>

              {/* Footer Actions */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleCloseModal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>Đóng</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={onApply}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="check-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.applyBtnText}>
                    {draftCount > 0 ? `Áp dụng (${draftCount})` : 'Xem tất cả'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ===================== VIEW 2: PROVINCE SELECTOR ===================== */}
          {viewMode === 'province' && (
            <View style={styles.flexOne}>
              {/* Drill-down Header */}
              <View style={styles.drillHeader}>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setViewMode('main')}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="arrow-back" size={22} color={COLORS.primary} />
                  <Text style={styles.backBtnText}>Quay lại</Text>
                </TouchableOpacity>

                <Text style={styles.drillTitle}>Chọn Tỉnh / Thành phố</Text>

                {filters.province !== 'all' ? (
                  <TouchableOpacity
                    style={styles.clearHeaderChip}
                    onPress={() => {
                      onClearProvince();
                      setViewMode('main');
                    }}
                  >
                    <Text style={styles.clearHeaderChipText}>Bỏ chọn</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ width: 60 }} />
                )}
              </View>

              {/* Search Box */}
              <View style={styles.searchSection}>
                <View style={styles.searchInputRow}>
                  <MaterialIcons name="search" size={20} color="#94A3B8" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm tỉnh thành toàn quốc..."
                    placeholderTextColor="#94A3B8"
                    value={searchLocationQuery}
                    onChangeText={setSearchLocationQuery}
                    autoCorrect={false}
                  />
                  {searchLocationQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchLocationQuery('')}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <MaterialIcons name="cancel" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Quick Select Popular Cities */}
              {!searchLocationQuery && (
                <View style={styles.popularCitiesBox}>
                  <Text style={styles.popularCitiesLabel}>Thành phố phổ biến:</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.popularCitiesRow}
                  >
                    {POPULAR_CITIES.map((city) => {
                      const matchItem = provinces.find((p) => p.name === city.name);
                      const isSelected = filters.province === city.name;
                      return (
                        <TouchableOpacity
                          key={city.name}
                          style={[
                            styles.popularCityChip,
                            isSelected && styles.popularCityChipSelected,
                          ]}
                          onPress={() => {
                            if (matchItem) {
                              handlePickProvince(matchItem);
                            } else {
                              onSelectProvince(city.name, 1);
                              setViewMode('main');
                            }
                          }}
                        >
                          <Text
                            style={[
                              styles.popularCityText,
                              isSelected && styles.popularCityTextSelected,
                            ]}
                          >
                            {city.short}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Provinces List */}
              {loadingProvinces ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Đang tải 63 tỉnh thành...</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredProvinces}
                  keyExtractor={(item) => item.code.toString()}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
                  ListHeaderComponent={
                    <TouchableOpacity
                      style={[
                        styles.locationItemRow,
                        filters.province === 'all' && styles.locationItemRowActive,
                      ]}
                      onPress={() => {
                        onClearProvince();
                        setViewMode('main');
                      }}
                    >
                      <View style={styles.locationItemLeft}>
                        <View style={styles.allIconBox}>
                          <MaterialIcons name="public" size={18} color={COLORS.primary} />
                        </View>
                        <View>
                          <Text style={styles.locationItemName}>Tất cả tỉnh thành</Text>
                          <Text style={styles.locationItemSub}>Xem CLB trên toàn quốc</Text>
                        </View>
                      </View>
                      {filters.province === 'all' && (
                        <MaterialIcons name="check" size={20} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  }
                  renderItem={({ item }) => {
                    const isSelected = filters.provinceCode === item.code || filters.province === item.name;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.locationItemRow,
                          isSelected && styles.locationItemRowActive,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handlePickProvince(item)}
                      >
                        <View style={styles.locationItemLeft}>
                          <View
                            style={[
                              styles.locationPinBox,
                              isSelected && styles.locationPinBoxSelected,
                            ]}
                          >
                            <MaterialIcons
                              name="location-on"
                              size={17}
                              color={isSelected ? COLORS.white : '#64748B'}
                            />
                          </View>
                          <View>
                            <Text
                              style={[
                                styles.locationItemName,
                                isSelected && styles.locationItemNameSelected,
                              ]}
                            >
                              {item.name}
                            </Text>
                            <Text style={styles.locationItemDivision}>
                              {item.division_type || 'Tỉnh / Thành phố'}
                            </Text>
                          </View>
                        </View>

                        {isSelected && (
                          <View style={styles.checkCircle}>
                            <MaterialIcons name="check" size={14} color={COLORS.white} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
            </View>
          )}

          {/* ===================== VIEW 3: WARD / DISTRICT SELECTOR ===================== */}
          {viewMode === 'ward' && (
            <View style={styles.flexOne}>
              {/* Drill-down Header */}
              <View style={styles.drillHeader}>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setViewMode('main')}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="arrow-back" size={22} color={COLORS.primary} />
                  <Text style={styles.backBtnText}>Quay lại</Text>
                </TouchableOpacity>

                <View style={styles.drillTitleCol}>
                  <Text style={styles.drillTitle}>Chọn Quận / Huyện</Text>
                  <Text style={styles.drillSubTitle} numberOfLines={1}>
                    {filters.province}
                  </Text>
                </View>

                {filters.ward !== 'all' ? (
                  <TouchableOpacity
                    style={styles.clearHeaderChip}
                    onPress={() => {
                      onClearWard();
                      setViewMode('main');
                    }}
                  >
                    <Text style={styles.clearHeaderChipText}>Bỏ chọn</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ width: 60 }} />
                )}
              </View>

              {/* Search Box */}
              <View style={styles.searchSection}>
                <View style={styles.searchInputRow}>
                  <MaterialIcons name="search" size={20} color="#94A3B8" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder={`Tìm quận/huyện ở ${filters.province}...`}
                    placeholderTextColor="#94A3B8"
                    value={searchLocationQuery}
                    onChangeText={setSearchLocationQuery}
                    autoCorrect={false}
                  />
                  {searchLocationQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchLocationQuery('')}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <MaterialIcons name="cancel" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Wards / District List */}
              {loadingWards ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Đang nạp danh sách quận huyện...</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredWards}
                  keyExtractor={(item) => item.code.toString()}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
                  ListHeaderComponent={
                    <TouchableOpacity
                      style={[
                        styles.locationItemRow,
                        filters.ward === 'all' && styles.locationItemRowActive,
                      ]}
                      onPress={() => {
                        onClearWard();
                        setViewMode('main');
                      }}
                    >
                      <View style={styles.locationItemLeft}>
                        <View style={styles.allIconBox}>
                          <MaterialIcons name="explore" size={18} color={COLORS.primary} />
                        </View>
                        <View>
                          <Text style={styles.locationItemName}>
                            Tất cả quận/huyện ở {filters.province}
                          </Text>
                          <Text style={styles.locationItemSub}>Không giới hạn khu vực nhỏ</Text>
                        </View>
                      </View>
                      {filters.ward === 'all' && (
                        <MaterialIcons name="check" size={20} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  }
                  renderItem={({ item }) => {
                    const isSelected = filters.ward === item.name;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.locationItemRow,
                          isSelected && styles.locationItemRowActive,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handlePickWard(item.name)}
                      >
                        <View style={styles.locationItemLeft}>
                          <View
                            style={[
                              styles.locationPinBox,
                              isSelected && styles.locationPinBoxSelected,
                            ]}
                          >
                            <MaterialIcons
                              name="place"
                              size={17}
                              color={isSelected ? COLORS.white : '#64748B'}
                            />
                          </View>
                          <View>
                            <Text
                              style={[
                                styles.locationItemName,
                                isSelected && styles.locationItemNameSelected,
                              ]}
                            >
                              {item.name}
                            </Text>
                            <Text style={styles.locationItemDivision}>
                              {item.division_type || 'Quận / Huyện'}
                            </Text>
                          </View>
                        </View>

                        {isSelected && (
                          <View style={styles.checkCircle}>
                            <MaterialIcons name="check" size={14} color={COLORS.white} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '86%',
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  handleBarWrapper: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
  },
  handleBar: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  flexOne: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  activeCountBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
  },
  activeCountBadgeText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  closeIconBtn: {
    padding: 6,
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingBottom: Platform.OS === 'ios' ? 34 : 14,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  applyBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    gap: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  applyBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  drillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingRight: 8,
  },
  backBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  drillTitle: {
    fontSize: 15,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  drillTitleCol: {
    alignItems: 'center',
  },
  drillSubTitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  clearHeaderChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  clearHeaderChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    padding: 0,
  },
  popularCitiesBox: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  popularCitiesLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  popularCitiesRow: {
    gap: 6,
  },
  popularCityChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  popularCityChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  popularCityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  popularCityTextSelected: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingVertical: 6,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 60,
  },
  locationItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  locationItemRowActive: {
    backgroundColor: COLORS.primaryOpacity05,
  },
  locationItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  allIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationPinBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationPinBoxSelected: {
    backgroundColor: COLORS.primary,
  },
  locationItemName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  locationItemNameSelected: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  locationItemSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  locationItemDivision: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
});
