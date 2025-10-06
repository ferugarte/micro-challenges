import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import useGameStore from '../store/useGameStore';

export default function ProfileScreen() {
  const streak = useGameStore((s: any) => s.streak ?? 0);
  const points = useGameStore((s: any) => s.points ?? 0);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.line}>🔥 Racha: {streak}</Text>
        <Text style={styles.line}>⭐️ Puntos: {points}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  line: { fontSize: 16, marginTop: 6 }
});