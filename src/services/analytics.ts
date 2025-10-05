import analytics from '@react-native-firebase/analytics';

export async function initAnalytics() {
  // Firebase gets initialized by the native config in Expo prebuild; with Expo Go the module is ready.
  return;
}

export const trackEvent = (name: string, params?: Record<string, any>) => {
  try { analytics().logEvent(name, params); } catch {}
};
