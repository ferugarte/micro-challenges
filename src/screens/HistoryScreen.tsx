import React from 'react';
import { SafeAreaView, View, Text, FlatList, StyleSheet } from 'react-native';
import useGameStore from '../store/useGameStore';

export default function HistoryScreen() {
  const history = useGameStore((s: any) => s.history || s.completed || []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}><Text style={styles.title}>Historial</Text></View>
      <FlatList
        data={history}
        keyExtractor={(item: any, idx) => item?.id ?? String(idx)}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', opacity: 0.7 }}>Sin partidas todavía</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item?.title ?? 'Reto'}</Text>
            {!!item?.date && <Text style={styles.itemDate}>{item.date}</Text>}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { padding: 16, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700' },
  item: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e5e5e5', marginBottom: 10 },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  itemDate: { fontSize: 12, opacity: 0.6, marginTop: 4 }
});