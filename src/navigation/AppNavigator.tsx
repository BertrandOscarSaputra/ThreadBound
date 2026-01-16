/**
 * Main app navigation configuration
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

// Screens
import LibraryScreen from '../screens/LibraryScreen';
import ReaderScreen from '../screens/ReaderScreen';
import AICompanionScreen from '../screens/AICompanionScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Library"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a2e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: '#16213e',
          },
        }}
      >
        <Stack.Screen
          name="Library"
          component={LibraryScreen}
          options={{ title: 'My Library' }}
        />
        <Stack.Screen
          name="Reader"
          component={ReaderScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AICompanion"
          component={AICompanionScreen}
          options={{ title: 'Reading Companion' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
