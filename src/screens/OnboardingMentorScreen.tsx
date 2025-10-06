import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, TouchableOpacity, Button, Alert } from 'react-native';
import useGameStore from '../store/useGameStore';
// Si ya tenés objectives.json, usalo. Si no, crealo con ids: attention_focus, memory, reasoning, emotion_regulation, executive_functions
import objectivesData from '../data/objectives.json';

const AGE_RANGES = ['4–6', '7–9', '10–12', '13–15', '16–18', '18+'];

export default function OnboardingMentorScreen({ navigation }: any) {
  const setProfile = useGameStore(s => s.setProfile);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [ageRange, setAgeRange] = React.useState<string>('');

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function onContinue() {
    if (!ageRange) {
      Alert.alert('Edad', 'Elegí un rango de edad del niño/adolescente');
      return;
    }
    if (selected.length < 1) {
      Alert.alert('Objetivos', 'Seleccioná al menos 1 objetivo');
      return;
    }
    // Tomamos el límite inferior del rango como edad aproximada del niño
    const approxAge = ageRange === '18+' ? 18 : Number(ageRange.split('–')[0]);
    setProfile?.(approxAge || null, null as any, 'mentor', selected);
    navigation.replace('Home');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurar acompañamiento</Text>
        <Text style={styles.subtitle}>Elegí la edad del niño/adolescente y tus objetivos educativos para personalizar los retos.</Text>
      </View>

      {/* Edad del niño/adolescente */}
      <View style={styles.box}>
        <Text style={styles.label}>Edad del niño/adolescente:</Text>
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

      {/* Objetivos del mentor */}
      <Text style={[styles.label, { marginHorizontal: 16 }]}>Elegí tus objetivos (mínimo 1):</Text>
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
  box: { paddingHorizontal: 16, marginBottom: 10 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  ageWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ageBtn: { paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, backgroundColor: '#fafafa' },
  ageBtnActive: { backgroundColor: '#e6f7ff', borderColor: '#66c2ff' },
  ageText: { fontSize: 16, fontWeight: '600', color: '#333' },
  ageTextActive: { color: '#007aff' },
  row: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, backgroundColor: '#fafafa' },
  rowActive: { backgroundColor: '#e6f7ff', borderColor: '#66c2ff' },
  rowText: { fontSize: 16, fontWeight: '700' },
  rowSub: { fontSize: 12, opacity: 0.7, marginTop: 2 }
});