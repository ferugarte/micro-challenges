import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Button, Alert } from 'react-native';
import useGameStore from '../store/useGameStore';
import interestsData from '../data/interests.json';

type Interest = { id: string; name: string; emoji?: string };

export default function OnboardingScreen({ navigation }: any) {
  const setProfile = useGameStore(s => s.setProfile);
  const [age, setAge] = React.useState<string>('');
  const [selected, setSelected] = React.useState<string[]>([]);

  const ageRanges = ['4–6', '7–9', '10–12', '13–15', '16–18'];

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function onContinue() {
    const nAge = Number(age.split('–')[0]);
    if (!nAge || nAge < 4 || nAge > 18) {
      Alert.alert('Edad inválida', 'Ingresa una edad entre 4 y 18');
      return;
    }
    if (selected.length < 3) {
      Alert.alert('Elige intereses', 'Selecciona al menos 3 intereses');
      return;
    }
    setProfile(nAge, selected);
    navigation.replace('Home');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>¡Bienvenido/a!</Text>
        <Text style={styles.subtitle}>Cuéntanos tu edad e intereses para personalizar los retos.</Text>
      </View>

      <View style={styles.box}>
        <Text style={styles.label}>Edad (4–18):</Text>
        {/* <TextInput
          value={age}
          onChangeText={setAge}
          keyboardType='number-pad'
          placeholder='Ej: 10'
          style={styles.input}
        /> */}
        <View style={styles.ageRangeContainer}>
          {ageRanges.map(range => {
            const selectedRange = age === range;
            return (
              <TouchableOpacity
                key={range}
                onPress={() => setAge(range)}
                style={[styles.ageRangeButton, selectedRange && styles.ageRangeButtonSelected]}
              >
                <Text style={[styles.ageRangeText, selectedRange && styles.ageRangeTextSelected]}>{range}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Text style={[styles.label, { marginHorizontal: 16 }]}>Elige al menos 3 intereses:</Text>
      <FlatList
        data={interestsData as Interest[]}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 12 }}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }) => {
          const active = selected.includes(item.id);
          return (
            <TouchableOpacity onPress={() => toggle(item.id)} style={[styles.chip, active && styles.chipActive]}>
              <Text style={styles.chipText}>{item.emoji ?? '⭐️'} {item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <View style={{ padding: 16 }}>
        <Button title='Continuar' onPress={onContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 14, opacity: 0.8, marginTop: 6 },
  box: { paddingHorizontal: 16, marginBottom: 10 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  chip: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: '#fafafa' },
  chipActive: { backgroundColor: '#e6f7ff', borderColor: '#66c2ff' },
  chipText: { fontSize: 15, fontWeight: '600' },
  ageRangeContainer: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  ageRangeButton: {
    flex: 1,
    minWidth: 60,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  ageRangeButtonSelected: {
    backgroundColor: '#e6f7ff',
    borderColor: '#66c2ff',
  },
  ageRangeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  ageRangeTextSelected: {
    color: '#007aff',
  },
});