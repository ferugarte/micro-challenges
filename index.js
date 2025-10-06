import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useGameStore from './src/store/useGameStore';

import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const age = useGameStore(s => s.age);
  const interests = useGameStore(s => s.interests);
  const hasProfile = !!age && Array.isArray(interests) && interests.length >= 3;

  return (
    <Stack.Navigator>
      {!hasProfile && (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ title: 'Tu perfil' }}
        />
      )}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    (async () => {
      try { await useGameStore.getState().bootstrap(); } catch {}
    })();
  }, []);

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

AppRegistry.registerComponent('main', () => App);
registerRootComponent(App);