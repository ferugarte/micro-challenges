import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useProfile } from "@/store/useProfile";
import { recommendChallenges } from "@/lib/recommend";
import { useSubscription } from "@/store/useSubscription";
import { track } from "@/lib/analytics";
import { useNavigation } from "@react-navigation/native";

type Props = {
  challengeId: string;
  accuracy: number;       // 0..100
  correct: number;        // respuestas correctas
  total: number;          // total actividades
  onRetry: () => void;    // volver a correr el mismo challenge
  onHome: () => void;     // volver al Home
  onStartChallenge: (id: string) => void; // abrir un recomendado
  timeMs: number;         // tiempo total del challenge en ms
};

export default function EndScreen({
  challengeId, accuracy, correct, total,
  onRetry, onHome, onStartChallenge,
  timeMs
}: Props) {
  const nav = useNavigation<any>();
  const { age, interests } = useProfile();
  const { isPro } = useSubscription();

  // Recomendaciones
  // Regla simple: si accuracy >= 80 → sugerir el challenge con mayor dificultad
  // sino sugerir free del mismo rango.
  const base = recommendChallenges(age ?? 12, interests ?? [], 3); // 3 sugerencias
  const recommended = base.filter(id => id !== challengeId).slice(0, 2);

  React.useEffect(()=>{
    track("challenge_end", { id: challengeId, accuracy, correct, total });
  }, [challengeId, accuracy, correct, total]);

  const premiumHint = accuracy >= 80 && !isPro;

  const timeLabel = `${Math.round(timeMs/1000)}s`;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>¡Buen trabajo!</Text>
      <Text style={styles.metric}>Precisión: <Text style={styles.bold}>{accuracy}%</Text></Text>
      <Text style={styles.sub}>Correctas: {correct}/{total}</Text>
      <Text style={styles.sub}>Tiempo total: {timeLabel}</Text>

      {premiumHint && (
        <>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Tip: tu nivel es alto. Prueba un track Premium para más desafío 🔓</Text>
          </View>
          <TouchableOpacity
            onPress={() => { track('paywall_view', { source: 'end_challenge_upsell' }); nav.navigate('Paywall'); }}
            style={[styles.primary, { marginTop: 8 }]}
          >
            <Text style={styles.primaryText}>Explorar Premium</Text>
          </TouchableOpacity>
        </>
      )}

      <View style={{ height: 12 }} />

      <View style={styles.row}>
        <TouchableOpacity onPress={onRetry} style={styles.primary}>
          <Text style={styles.primaryText}>Repetir</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onHome} style={styles.secondary}>
          <Text>Inicio</Text>
        </TouchableOpacity>
      </View>

      {recommended.length > 0 && (
        <>
          <View style={{ height: 16 }} />
          <Text style={styles.sectionTitle}>Recomendados para continuar</Text>
          <View style={styles.recoWrap}>
            {recommended.map(id => (
              <TouchableOpacity key={id} onPress={() => onStartChallenge(id)} style={styles.recoBtn}>
                <Text style={styles.recoText}>{id}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  title: { fontSize: 22, fontWeight: "bold" },
  metric: { marginTop: 6, fontSize: 16 },
  bold: { fontWeight: "700" },
  sub: { color: "#555", marginTop: 2 },
  badge: {
    marginTop: 10,
    backgroundColor: "#EAF5FF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  badgeText: { fontSize: 12, color: "#0A62A9" },
  row: { flexDirection: "row", gap: 10, marginTop: 12 },
  primary: { backgroundColor: "#000", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  primaryText: { color: "#fff", fontWeight: "600" },
  secondary: { borderWidth: 1, borderColor: "#ddd", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  recoWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  recoBtn: { borderWidth: 1, borderColor: "#ddd", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  recoText: { fontSize: 14 }
});