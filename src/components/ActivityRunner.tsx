import React from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Activity, getActivity } from "@/lib/activities";
import { useSubscription } from "@/store/useSubscription";
import { useProgress } from "@/store/useProgress";
import { track } from "@/lib/analytics";

type Props = {
  activityId: string;
  onNext?: () => void;
  onExit?: () => void;
};

export default function ActivityRunner({ activityId, onNext, onExit }: Props) {
  const nav = useNavigation<any>();

  const [activity, setActivity] = React.useState<Activity | null>(null);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [typed, setTyped] = React.useState<string>("");
  const [feedback, setFeedback] = React.useState<string>("");
  const [startMs, setStartMs] = React.useState<number>(Date.now());
  const [revealed, setRevealed] = React.useState(false);
  const [wasCorrect, setWasCorrect] = React.useState<boolean | null>(null);

  const { isPro, startTrialUse, resetIfNewMonth } = useSubscription();
  const { saveResult, setLastActivity } = useProgress();

  React.useEffect(() => {
    const a = getActivity(activityId);
    setActivity(a);
  }, [activityId]);

  React.useEffect(() => {
    if (!activity) return;
    resetIfNewMonth();
    // Gate premium: trial o pro
    if (activity.premium && !isPro) {
      const allowed = startTrialUse();
      if (!allowed) {
        Alert.alert(
          "Contenido Premium",
          "Has alcanzado el límite de prueba. Suscríbete para continuar.",
          [
            { text: "Más tarde", style: "cancel" },
            { text: "Ver planes", onPress: () => nav.navigate("Paywall") },
          ]
        );
        return; // no continuamos montando esta actividad
      } else {
        track("trial_start", { id: activity.id });
      }
    }
    setStartMs(Date.now());
    setLastActivity(activity.id);
    track("activity_start", { id: activity.id, premium: !!activity.premium });
  }, [activity, isPro, startTrialUse, resetIfNewMonth, setLastActivity, nav]);

  if (!activity) {
    return (
      <View style={{ padding: 16 }}>
        <Text>Cargando…</Text>
      </View>
    );
  }

  const isMC = Array.isArray(activity.options);

  function submit() {
    const timeSpentMs = Date.now() - startMs;

    if (isMC) {
      if (selected === null) return;
      const correct = selected === activity.correct;
      setFeedback(
        correct
          ? "¡Bien! Respuesta correcta."
          : `Incorrecto. ${activity.hint ? "Pista: " + activity.hint : ""}`
      );
      setWasCorrect(correct);
      setRevealed(true);
      saveResult({
        id: activity.id,
        correct,
        timeSpentMs,
        ts: Date.now(),
        premium: !!activity.premium,
      });
      track("activity_end", { id: activity.id, correct, time_spent_ms: timeSpentMs });
    } else {
      const userText = typed.trim();
      const correct = !!userText; // Para abiertas, marcamos como respondida; puedes mejorar con similitud
      setFeedback(userText ? "¡Gracias! Respuesta registrada." : "Puedes escribir una respuesta breve.");
      setWasCorrect(correct);
      setRevealed(true);
      saveResult({ id: activity.id, solution: userText, timeSpentMs, ts: Date.now(), premium: !!activity.premium });
      track("activity_end", { id: activity.id, correct, time_spent_ms: timeSpentMs });
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {activity.premium && !isPro && (
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumBadgeText}>Premium (trial)</Text>
        </View>
      )}

      <Text style={styles.title}>{activity.title}</Text>
      <Text style={styles.text}>{activity.text}</Text>

      {isMC ? (
        <View style={{ marginTop: 8 }}>
          {activity.options!.map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.optionButton, selected === idx && styles.optionButtonSelected]}
              onPress={() => setSelected(idx)}
            >
              <Text style={[styles.optionText, selected === idx && styles.optionTextSelected]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <TextInput
          style={styles.input}
          placeholder="Escribe tu respuesta…"
          value={typed}
          onChangeText={setTyped}
          multiline
        />
      )}

      {activity.hint ? <Text style={styles.hint}>Pista: {activity.hint}</Text> : null}

      <View style={styles.row}>
        <TouchableOpacity onPress={submit} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Enviar</Text>
        </TouchableOpacity>
        {onNext && (
          <TouchableOpacity onPress={onNext} style={styles.secondaryBtn}>
            <Text>Siguiente</Text>
          </TouchableOpacity>
        )}
        {onExit && (
          <TouchableOpacity onPress={onExit} style={styles.secondaryBtn}>
            <Text>Salir</Text>
          </TouchableOpacity>
        )}
      </View>

      {!!feedback && (
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 14 }}>{feedback}</Text>
        </View>
      )}

      {revealed && activity.explanation && (
        <View style={{ marginTop: 8, padding: 12, borderRadius: 10, backgroundColor: '#F2F7FF' }}>
          <Text style={{ fontWeight: '600', marginBottom: 4 }}>Explicación</Text>
          <Text>{activity.explanation}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  text: { fontSize: 16, color: "#333" },
  hint: { fontSize: 14, fontStyle: "italic", color: "#666", marginTop: 8 },
  row: { flexDirection: "row", gap: 10, marginTop: 12 },
  primaryBtn: { backgroundColor: "#000", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  primaryBtnText: { color: "#fff", fontWeight: "600" },
  secondaryBtn: { borderWidth: 1, borderColor: "#ddd", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  optionButton: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, marginBottom: 8, backgroundColor: "#f8f8f8" },
  optionButtonSelected: { backgroundColor: "#000" },
  optionText: { fontSize: 16 },
  optionTextSelected: { color: "#fff" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, minHeight: 120, marginTop: 8, textAlignVertical: "top" },
  premiumBadge: { alignSelf: "flex-start", backgroundColor: "#FFF3C4", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginBottom: 8 },
  premiumBadgeText: { fontSize: 12, fontWeight: "600", color: "#8A6D00" },
});