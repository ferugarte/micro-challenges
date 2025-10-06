import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, TouchableOpacity, Button, Alert } from 'react-native';
import useGameStore from '../store/useGameStore';
// Asegúrate de tener este archivo (o usa tu interests.json actual)
import interestsData from '../data/interests.json';

const AGE_RANGES = ['4–6', '7–9', '10–12', '13–15', '16–18'];

export default function OnboardingChildScreen({ navigation }: any) {
  const setProfile = useGameStore(s => s.setProfile);
  const [ageRange, setAgeRange] = React.useState<string>('');
  const [selected, setSelected] = React.useState<string[]>([]);

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function onContinue() {
    if (!ageRange) {
      Alert.alert('Edad', 'Elegí un rango de edad');
      return;
    }
    if (selected.length < 3) {
      Alert.alert('Intereses', 'Seleccioná al menos 3 intereses');
      return;
    }
    // Tomamos el límite inferior del rango como edad aproximada
    const approxAge = Number(ageRange.split('–')[0]);
    setProfile?.(approxAge || 10, selected, 'child', null);
    navigation.replace('Home');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>¡Hola! 👋</Text>
        <Text style={styles.subtitle}>Contanos tu edad e intereses para ajustar los retos.</Text>
      </View>

      <View style={styles.box}>
        <Text style={styles.label}>Edad:</Text>
        <View style={styles.ageWrap}>
          {AGE_RANGES.map(r => {
            const active = r === ageRange;
            return (
              <TouchableOpacity key={r} onPress={() => setAgeRange(r)}
                style={[styles.ageBtn, active && styles.ageBtnActive]}>
                <Text style={[styles.ageText, active && styles.ageTextActive]}>{r}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Text style={[styles.label, { marginHorizontal: 16 }]}>Elegí al menos 3 intereses:</Text>
      <FlatList
        data={interestsData}
        keyExtractor={(item: any) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 12 }}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }: any) => {
          const active = selected.includes(item.id);
          return (
            <TouchableOpacity onPress={() => toggle(item.id)} style={[styles.chip, active && styles.chipActive]}>
              <Text style={styles.chipText}>{item.emoji ?? '⭐️'} {item.name}</Text>
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
  box: { paddingHorizontal: 16, marginBottom: 10 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  ageWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ageBtn: { paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, backgroundColor: '#fafafa' },
  ageBtnActive: { backgroundColor: '#e6f7ff', borderColor: '#66c2ff' },
  ageText: { fontSize: 16, fontWeight: '600', color: '#333' },
  ageTextActive: { color: '#007aff' },
  chip: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: '#fafafa' },
  chipActive: { backgroundColor: '#e6f7ff', borderColor: '#66c2ff' },
  chipText: { fontSize: 15, fontWeight: '600' },
});