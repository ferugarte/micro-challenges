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
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import useGameStore from '../store/useGameStore';
import { useSubscription } from '../store/useSubscription';
import { track } from '../lib/analytics';

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  // Game state
  const todayChallenge = useGameStore(state => state.getTodaysChallenge());
  const checkAnswer = useGameStore(s => s.checkAnswer);
  const checkOption = useGameStore(s => s.checkOption);
  const solvedToday = useGameStore(s => s.solvedToday);
  const advanceToNext = useGameStore(s => s.advanceToNext);
  const randomizeToday = useGameStore(s => s.randomizeToday);

  // Subscription / trial
  const { isPro, startTrialUse, resetIfNewMonth } = useSubscription();

  const [answer, setAnswer] = React.useState('');
  const [startedId, setStartedId] = React.useState<string | null>(null);
  const [startMs, setStartMs] = React.useState<number>(Date.now());

  useFocusEffect(
    React.useCallback(() => {
      resetIfNewMonth();
      randomizeToday();
    }, [randomizeToday, resetIfNewMonth])
  );

  React.useEffect(() => {
    if (!todayChallenge) return;
    // Gating visual: si es premium y no pro, marcamos trial
    // Analytics: start de actividad
    setStartedId(todayChallenge.id);
    setStartMs(Date.now());
    track('activity_start', { id: todayChallenge.id, premium: !!todayChallenge.premium });
  }, [todayChallenge]);

  function ensurePremiumAccess(): boolean {
    if (!todayChallenge?.premium) return true;
    if (isPro) return true;
    const ok = startTrialUse();
    if (ok) {
      // consumió 1 intento premium del trial
      track('trial_start', { id: todayChallenge.id });
      return true;
    }
    // Sin trial disponible → paywall
    Alert.alert(
      'Contenido Premium',
      'Has alcanzado el límite de prueba. Suscríbete para continuar.',
      [
        { text: 'Más tarde', style: 'cancel' },
        { text: 'Ver planes', onPress: () => navigation.navigate('Paywall') },
      ]
    );
    return false;
  }

  function endAnalytics(correct?: boolean) {
    if (!startedId) return;
    track('activity_end', { id: startedId, correct, time_spent_ms: Date.now() - startMs });
  }

  function onSubmit() {
    if (!ensurePremiumAccess()) return;
    const ok = typeof checkAnswer === 'function' ? checkAnswer(answer) : false;
    endAnalytics(ok);
    if (ok) {
      Alert.alert('¡Correcto!', 'Sumaste a tu racha 🔥 (+10 pts)');
      setAnswer('');
      setTimeout(() => advanceToNext(), 600);
    } else {
      Alert.alert('Intenta de nuevo', 'Esa no es la respuesta 😅');
    }
  }

  function onSelectOption(index: number) {
    if (!ensurePremiumAccess()) return;
    const ok = typeof checkOption === 'function' ? checkOption(index) : false;
    endAnalytics(ok);
    if (ok) {
      Alert.alert('¡Correcto!', 'Sumaste a tu racha 🔥 (+10 pts)');
      setTimeout(() => advanceToNext(), 600);
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
        {/* CTA Premium / Gestión de suscripción */}
        <View style={styles.topCtaRow}>
          {!isPro ? (
            <TouchableOpacity
              onPress={() => { track('paywall_view', { source: 'home_cta' }); navigation.navigate('Paywall'); }}
              style={styles.ctaBtn}
            >
              <Text style={styles.ctaText}>Explorar Premium</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate('Paywall')}
              style={styles.manageBtn}
            >
              <Text>Gestionar suscripción</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.challengeCard}>
          {/* Banda premium trial */}
          {todayChallenge.premium && !isPro && (
            <View style={styles.premiumBadge}><Text style={styles.premiumBadgeText}>Premium (trial)</Text></View>
          )}

          <Text style={styles.title}>{todayChallenge.title}</Text>
          <Text style={styles.text}>{todayChallenge.text}</Text>
          {todayChallenge.hint && <Text style={styles.hint}>Pista: {todayChallenge.hint}</Text>}

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
  premiumBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF3C4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  premiumBadgeText: { fontSize: 12, fontWeight: '600', color: '#8A6D00' },
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
  optionText: { fontSize: 16 },
  // Premium CTA styles
  topCtaRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 },
  ctaBtn: { backgroundColor: '#000', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  ctaText: { color: '#fff', fontWeight: '600' },
  manageBtn: { borderWidth: 1, borderColor: '#ddd', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
});