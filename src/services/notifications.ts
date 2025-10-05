import * as Notifications from 'expo-notifications';

export async function scheduleDailyReminder() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title: '🧩 Nuevo reto disponible', body: '¡Suma a tu racha hoy!' },
    trigger: { hour: 19, minute: 0, repeats: true }
  });
}
