import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MatchRoomDetailScreen } from '../../src/pages/matchmaking/ui/MatchRoomDetailScreen';

export default function MatchRoomDetailRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const navigationMock = {
    goBack: () => router.back(),
    navigate: (screenName: string, navParams?: any) => {
      if (screenName === 'ReportMatchResult') {
        router.push({ pathname: '/matchmaking/report', params: { roomId: navParams?.roomId } });
      }
    },
  };

  return <MatchRoomDetailScreen route={{ params }} navigation={navigationMock} />;
}
