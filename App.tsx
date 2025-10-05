import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import { initAds } from './src/services/ads';
import { initPurchases } from './src/services/purchases';
import { initAnalytics } from './src/services/analytics';
import { scheduleDailyReminder } from './src/services/notifications';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    (async () => {
      try { await initAds(); } catch {}
      try { await initPurchases(); } catch {}
      try { await initAnalytics(); } catch {}
      try { await scheduleDailyReminder(); } catch {}
    })();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Reto de hoy' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Historial' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
        <Stack.Screen name="Paywall" component={PaywallScreen} options={{ title: 'Premium' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
