import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ReportMatchResultScreen } from '../../src/pages/matchmaking/ui/ReportMatchResultScreen';

export default function ReportMatchResultRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const navigationMock = {
    goBack: () => router.back(),
  };

  return <ReportMatchResultScreen route={{ params }} navigation={navigationMock} />;
}
