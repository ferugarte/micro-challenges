import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useGameStore from './src/store/useGameStore';
import { ActivityIndicator, View } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PaywallScreen from './src/screens/PaywallScreen';

import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import OnboardingChildScreen from './src/screens/OnboardingChildScreen';
import OnboardingMentorScreen from './src/screens/OnboardingMentorScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const role = useGameStore(s => s.role);
  const age = useGameStore(s => s.age);
  const interests = useGameStore(s => s.interests);
  const objectives = useGameStore(s => s.objectives);

  const hasChildProfile = role === 'child' && !!age && Array.isArray(interests) && interests.length >= 3;
  const hasMentorProfile = role === 'mentor' && Array.isArray(objectives) && objectives.length >= 1;
  const hasProfile = hasChildProfile || hasMentorProfile;

  return (
    <Stack.Navigator>
      {!hasProfile && (
        <>
          <Stack.Screen name="RoleSelect" component={RoleSelectionScreen} options={{ title: '¿Quién usará la app?' }} />
          <Stack.Screen name="OnboardingChild" component={OnboardingChildScreen} options={{ title: 'Tu perfil' }} />
          <Stack.Screen name="OnboardingMentor" component={OnboardingMentorScreen} options={{ title: 'Perfil de Tutor' }} />
        </>
      )}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [ready, setReady] = React.useState(false);
  
  useEffect(() => {
    (async () => {
      try { await useGameStore.getState().bootstrap(); } catch {}
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

AppRegistry.registerComponent('main', () => App);
registerRootComponent(App);
