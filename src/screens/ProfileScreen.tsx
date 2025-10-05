import { View, Text } from 'react-native';
import { useGameStore } from '../store/useGameStore';

export default function ProfileScreen() {
  const { premium } = useGameStore();
  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Perfil</Text>
      <Text>Estado: {premium ? 'Premium' : 'Gratis'}</Text>
    </View>
  );
}
