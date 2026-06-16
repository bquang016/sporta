import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Club } from '../model/types';

interface ClubCardProps {
  club: Club;
  renderActions?: () => React.ReactNode;
}

// Helper function to return icon name based on sport
const getSportIcon = (sport: string): keyof typeof Ionicons.glyphMap => {
  switch (sport) {
    case 'Bóng đá':
      return 'football';
    case 'Bóng rổ':
      return 'basketball';
    case 'Pickle ball':
      return 'tennisball';
    default:
      return 'people';
  }
};

export function ClubCard({ club, renderActions }: ClubCardProps) {
  const showDetailStats = club.isPrivate !== undefined || club.area !== undefined || club.memberLimit !== undefined;

  return (
    <View style={styles.clubCard}>
      <View style={styles.cardMain}>
        {/* Circular sport icon on the left (8% secondary green background tint) */}
        <View style={styles.sportIconWrapper}>
          {club.sport === 'Cầu lông' ? (
            <MaterialCommunityIcons name="badminton" size={24} color="#2b6954" />
          ) : (
            <Ionicons name={getSportIcon(club.sport)} size={24} color="#2b6954" />
          )}
        </View>

        <View style={styles.clubInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.clubName} numberOfLines={1}>{club.name}</Text>
            <View style={styles.sportTag}>
              <Text style={styles.sportTagText}>{club.sport}</Text>
            </View>
          </View>
          
          <Text style={styles.clubDesc} numberOfLines={2}>
            {club.description}
          </Text>

          {/* Privacy & Area & Member Stats Row (Optional, based on detail page/my-clubs) */}
          {showDetailStats && (
            <View style={styles.statsRow}>
              {club.isPrivate !== undefined && (
                <View style={styles.privacyTag}>
                  <Ionicons 
                    name={club.isPrivate ? "lock-closed-outline" : "earth-outline"} 
                    size={14} 
                    color="#6B7280" 
                  />
                  <Text style={styles.statsTagText}>
                    {club.isPrivate ? "Riêng tư" : "Công khai"}
                  </Text>
                </View>
              )}
              {club.area !== undefined && (
                <View style={styles.areaTag}>
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text style={styles.statsTagText}>
                    {club.area}
                  </Text>
                </View>
              )}
              {club.memberLimit !== undefined && (
                <View style={styles.limitTag}>
                  <Ionicons name="bar-chart-outline" size={14} color="#6B7280" />
                  <Text style={styles.statsTagText}>
                    Giới hạn: {club.memberLimit}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.cardFooter}>
            <View style={styles.memberInfo}>
              <Ionicons name="people-outline" size={16} color={club.memberLimit ? "#2b6954" : "#444748"} />
              <Text style={[
                styles.memberText, 
                club.memberLimit ? styles.memberTextActive : styles.memberTextNormal
              ]}>
                {club.members}{club.memberLimit ? `/${club.memberLimit}` : ''} thành viên
              </Text>
            </View>
            
            {renderActions && renderActions()}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clubCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8, // small card radius
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(43, 105, 84, 0.15)', // secondary green at 15% opacity
  },
  cardMain: {
    flexDirection: 'row',
  },
  sportIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(43, 105, 84, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  clubInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  clubName: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#191c20',
    flex: 1,
    marginRight: 8,
  },
  sportTag: {
    backgroundColor: 'rgba(43, 105, 84, 0.06)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sportTagText: {
    fontFamily: 'HankenGrotesk-Bold',
    color: '#2b6954',
    fontSize: 10,
    fontWeight: 'bold',
  },
  clubDesc: {
    fontFamily: 'HankenGrotesk-Regular',
    color: '#444748',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  privacyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  areaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  limitTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsTagText: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 12,
    color: '#444748',
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(43, 105, 84, 0.1)',
    paddingTop: 12,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberText: {
    marginLeft: 6,
  },
  memberTextNormal: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 12,
    color: '#444748',
  },
  memberTextActive: {
    fontFamily: 'HankenGrotesk-SemiBold',
    fontSize: 12,
    color: '#2b6954',
    fontWeight: '600',
  },
});
