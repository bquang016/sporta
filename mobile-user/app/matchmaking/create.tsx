import React from 'react';
import { useRouter } from 'expo-router';
import { CreateMatchRoomScreen } from '../../src/pages/matchmaking/ui/CreateMatchRoomScreen';

export default function CreateMatchRoomRoute() {
  const router = useRouter();

  const navigationMock = {
    goBack: () => router.back(),
  };

  return <CreateMatchRoomScreen navigation={navigationMock} />;
}
