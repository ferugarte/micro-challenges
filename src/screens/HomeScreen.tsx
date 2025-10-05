import { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { showHintRewarded } from '../services/ads';
import { trackEvent } from '../services/analytics';
import ChallengeCard from '../components/ChallengeCard';

export default function HomeScreen({ navigation }: any) {
  const { getTodaysChallenge, checkAnswer, premium } = useGameStore();
  const c = getTodaysChallenge();
  const [answer, setAnswer] = useState('');

  const onSubmit = () => {
    const ok = checkAnswer(answer);
    trackEvent('submit_answer', { ok });
    ok ? Alert.alert('¡Correcto!') : Alert.alert('Intenta de nuevo');
  };

  const onHint = async () => {
    if (premium) return Alert.alert('Pista', c.hint);
    const got = await showHintRewarded();
    if (got) Alert.alert('Pista', c.hint);
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <ChallengeCard title={c.title}>
        <Text>{c.text}</Text>
      </ChallengeCard>
      <TextInput
        placeholder="Tu respuesta"
        value={answer}
        onChangeText={setAnswer}
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />
      <Button title="Enviar" onPress={onSubmit} />
      <Button title={premium ? 'Ver pista' : 'Ver pista (anuncio)'} onPress={onHint} />
      <Button title="Historial" onPress={() => navigation.navigate('History')} />
      <Button title="Premium" onPress={() => navigation.navigate('Paywall')} />
    </View>
  );
}
