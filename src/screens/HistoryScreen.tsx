import { View, Text, FlatList } from 'react-native';
import challenges from '../data/challenges.json';
import { useGameStore } from '../store/useGameStore';

export default function HistoryScreen() {
  const { solvedIds, streak } = useGameStore();
  const solved = challenges.filter(c => solvedIds.includes(c.id));

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 16 }}>Racha actual: {streak} 🔥</Text>
      <FlatList
        data={solved}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (<Text>• {item.title}</Text>)}
        ListEmptyComponent={<Text>Resuelve tu primer reto de hoy 🙂</Text>}
      />
    </View>
  );
}
