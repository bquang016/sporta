import React from 'react';
import { useRouter } from 'expo-router';
import { CreateMatchRoomScreen } from '../../src/pages/matchmaking/ui/CreateMatchRoomScreen';

export default function CreateMatchRoomRoute() {
  const router = useRouter();

  const navigationMock = {
    goBack: () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/matchmaking');
      }
    },
    navigate: (screenName: string, params?: any) => {
      if (screenName === 'MatchRoomDetail') {
        router.replace({ pathname: '/matchmaking/[id]', params: { id: params?.roomId } });
      } else {
        router.replace('/matchmaking');
      }
    },
  };

  return <CreateMatchRoomScreen navigation={navigationMock} />;
}
