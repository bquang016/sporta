import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="otp-verify" />
      <Stack.Screen name="personal-info" />
      <Stack.Screen name="sport-level" />
    </Stack>
  );
}
