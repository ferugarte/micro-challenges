import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import useGameStore from '../store/useGameStore';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const todayChallenge = useGameStore(state => state.getTodaysChallenge());
  const [answer, setAnswer] = React.useState('');
  const checkAnswer = useGameStore(s => s.checkAnswer);
  const checkOption = useGameStore(s => s.checkOption);
  const solvedToday = useGameStore(s => s.solvedToday);
  const advanceToNext = useGameStore(s => s.advanceToNext);
  const randomizeToday = useGameStore(s => s.randomizeToday);

  useFocusEffect(React.useCallback(() => {
    randomizeToday();
  }, [randomizeToday]));

  function onSubmit() {
    const ok = typeof checkAnswer === 'function' ? checkAnswer(answer) : false;
    if (ok) {
      Alert.alert('¡Correcto!', 'Sumaste a tu racha 🔥 (+10 pts)');
      setAnswer('');
      setTimeout(() => advanceToNext(), 1000);
    } else {
      Alert.alert('Intenta de nuevo', 'Esa no es la respuesta 😅');
    }
  }

  function onSelectOption(index: number) {
    const ok = typeof checkOption === 'function' ? checkOption(index) : false;
    if (ok) {
      Alert.alert('¡Correcto!', 'Sumaste a tu racha 🔥 (+10 pts)');
      setTimeout(() => advanceToNext(), 1000);
    } else {
      Alert.alert('Incorrecto', 'Prueba con otra opción 😅');
    }
  }

  if (!todayChallenge) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Cargando el reto del día...</Text>
      </SafeAreaView>
    );
  }

  const isMultipleChoice = Array.isArray(todayChallenge.options);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.challengeCard}>
          <Text style={styles.title}>{todayChallenge.title}</Text>
          <Text style={styles.text}>{todayChallenge.text}</Text>
          {todayChallenge.hint && <Text style={styles.hint}>{todayChallenge.hint}</Text>}

          <View style={{ height: 12 }} />

          {isMultipleChoice ? (
            todayChallenge.options.map((opt: string, idx: number) => (
              <TouchableOpacity
                key={idx}
                style={styles.optionButton}
                onPress={() => onSelectOption(idx)}
                disabled={solvedToday}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <>
              <TextInput
                placeholder="Tu respuesta…"
                value={answer}
                onChangeText={setAnswer}
                editable={!solvedToday}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
              <View style={{ height: 10 }} />
              <Button
                title={solvedToday ? '¡Ya lo resolviste!' : 'Comprobar'}
                onPress={onSubmit}
                disabled={solvedToday}
              />
            </>
          )}

          {solvedToday && (
            <>
              <View style={{ height: 8 }} />
              <Button title="Siguiente (práctica)" onPress={advanceToNext} />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  text: { fontSize: 16, marginBottom: 8 },
  hint: { fontSize: 14, fontStyle: 'italic', color: '#666' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
  },
  optionText: {
    fontSize: 16,
  },
});