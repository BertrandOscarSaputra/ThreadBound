/**
 * Root layout for Expo Router
 */
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#1a1a2e",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "600",
        },
        contentStyle: {
          backgroundColor: "#16213e",
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: "My Library" }} />
      <Stack.Screen name="reader" options={{ headerShown: false }} />
      <Stack.Screen name="ai-companion" options={{ title: "Reading Companion" }} />
    </Stack>
  );
}
