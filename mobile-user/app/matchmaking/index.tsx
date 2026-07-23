import React from 'react';
import { useRouter } from 'expo-router';
import { MatchmakingListScreen } from '../../src/pages/matchmaking/ui/MatchmakingListScreen';

export default function MatchmakingRoute() {
  const router = useRouter();

  const navigationMock = {
    goBack: () => router.back(),
    navigate: (screenName: string, params?: any) => {
      if (screenName === 'CreateMatchRoom') {
        router.push('/matchmaking/create');
      } else if (screenName === 'MatchRoomDetail') {
        router.push({ pathname: '/matchmaking/[id]', params: { id: params?.roomId } });
      }
    },
  };

  return <MatchmakingListScreen navigation={navigationMock} />;
}
