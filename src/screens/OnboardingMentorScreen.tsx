import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, TouchableOpacity, Button, Alert } from 'react-native';
import useGameStore from '../store/useGameStore';
// Si ya tenés objectives.json, usalo. Si no, crealo con ids: attention_focus, memory, reasoning, emotion_regulation, executive_functions
import objectivesData from '../data/objectives.json';

export default function OnboardingMentorScreen({ navigation }: any) {
  const setProfile = useGameStore(s => s.setProfile);
  const [selected, setSelected] = React.useState<string[]>([]);

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function onContinue() {
    if (selected.length < 1) {
      Alert.alert('Objetivos', 'Seleccioná al menos 1 objetivo');
      return;
    }
    setProfile?.(null as any, null as any, 'mentor', selected);
    navigation.replace('Home');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurar acompañamiento</Text>
        <Text style={styles.subtitle}>Elegí tus objetivos educativos para personalizar los retos.</Text>
      </View>

      <FlatList
        data={objectivesData}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }: any) => {
          const active = selected.includes(item.id);
          return (
            <TouchableOpacity onPress={() => toggle(item.id)} style={[styles.row, active && styles.rowActive]}>
              <Text style={styles.rowText}>{item.emoji ?? '🎯'} {item.name}</Text>
              {!!item.short && <Text style={styles.rowSub}>{item.short}</Text>}
            </TouchableOpacity>
          );
        }}
      />

      <View style={{ padding: 16 }}>
        <Button title="Continuar" onPress={onContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 14, opacity: 0.8, marginTop: 6 },
  row: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, backgroundColor: '#fafafa' },
  rowActive: { backgroundColor: '#e6f7ff', borderColor: '#66c2ff' },
  rowText: { fontSize: 16, fontWeight: '700' },
  rowSub: { fontSize: 12, opacity: 0.7, marginTop: 2 }
});