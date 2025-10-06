import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import useGameStore from '../store/useGameStore';

export default function RoleSelectionScreen({ navigation }: any) {
  // Si tu store ya tiene setRole o setProfile, úsalo; si no, navegamos directo
  const setProfile = useGameStore.getState?.().setProfile as
    | ((age: number | null, interests: string[] | null, role?: 'child' | 'mentor', objectives?: string[] | null) => void)
    | undefined;

  function pick(role: 'child' | 'mentor') {
    // Si hay setter, guardamos el rol y seguimos
    try { setProfile?.(null as any, null as any, role, null); } catch {}
    if (role === 'child') navigation.replace('OnboardingChild');
    else navigation.replace('OnboardingMentor');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.box}>
        <Text style={styles.title}>¿Quién usará la app?</Text>
        <Text style={styles.subtitle}>Elegí tu perfil para personalizar la experiencia.</Text>

        <TouchableOpacity style={styles.btn} onPress={() => pick('child')}>
          <Text style={styles.btnText}>🧒 Soy niño / adolescente</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.outline]} onPress={() => pick('mentor')}>
          <Text style={[styles.btnText, styles.outlineText]}>👩‍🏫 Soy padre / tutor / mentor</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff', padding: 16, justifyContent: 'center' },
  box: { gap: 16 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 14, opacity: 0.7 },
  btn: { backgroundColor: '#0b6efd', padding: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  outline: { backgroundColor: '#eef6ff', borderWidth: 1, borderColor: '#0b6efd' },
  outlineText: { color: '#0b6efd' },
});