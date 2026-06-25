import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Club } from '../../../../entities/club';
import { MatchHistoryCard, MatchItem } from './MatchHistoryCard';

export interface MatchHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  club: Club;
  matches: MatchItem[];
}

export function MatchHistoryModal({ visible, onClose, club, matches }: MatchHistoryModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaProvider>
        <View style={styles.fullScreenModalContainer}>
          <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
            <View style={styles.fullScreenModalHeader}>
              <TouchableOpacity 
                style={styles.closeModalButton} 
                activeOpacity={0.7} 
                onPress={onClose}
              >
                <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.fullScreenModalTitle}>Lịch sử đối đầu</Text>
              <View style={styles.headerPlaceholder} />
            </View>
          </SafeAreaView>
          
          <View style={styles.contentContainer}>
        
        <ScrollView contentContainerStyle={styles.fullScreenModalScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.historyList}>
            {matches.map((match) => (
              <MatchHistoryCard 
                key={match.id}
                match={match}
                club={club}
              />
            ))}
          </View>
        </ScrollView>
          </View>
        </View>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerSafeArea: {
    backgroundColor: COLORS.surface,
  },
  contentContainer: {
    flex: 1,
  },
  fullScreenModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    height: 64,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  closeModalButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  fullScreenModalTitle: {
    position: 'absolute',
    left: 60,
    right: 60,
    textAlign: 'center',
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  fullScreenModalScroll: {
    padding: SPACING.marginMobile,
    paddingBottom: SPACING.xl,
  },
  historyList: {
    gap: SPACING.md,
  },
});
