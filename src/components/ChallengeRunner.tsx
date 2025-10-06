import React from "react";
import EndScreen from "@/components/EndScreen";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { getChallengeActivities } from "@/lib/launchChallenge";
import ActivityRunner from "@/components/ActivityRunner";
import { useProgress } from "@/store/useProgress";
import { track } from "@/lib/analytics";

type Props = {
  challengeId: string;
  onFinish?: () => void;
  onExit?: () => void;
};

export default function ChallengeRunner({ challengeId, onFinish, onExit }: Props) {
  const [queue, setQueue] = React.useState<string[]>([]);
  const [idx, setIdx] = React.useState(0);
  const [done, setDone] = React.useState(false);

  const { results } = useProgress();

  React.useEffect(() => {
    const ids = getChallengeActivities(challengeId);
    setQueue(ids);
    setIdx(0);
    setDone(false);
    track("challenge_start", { id: challengeId, total: ids.length });
  }, [challengeId]);

  const current = queue[idx];

  function next() {
    const n = idx + 1;
    if (n < queue.length) {
      setIdx(n);
    } else {
      // calcular accuracy simple con lo que dejó ActivityRunner en useProgress
      const answered = queue.map(id => results[id]).filter(Boolean);
      const correctCount = answered.filter(r => r.correct === true).length;
      const accuracy = queue.length ? Math.round((correctCount / queue.length) * 100) : 0;
      const timeMs = answered.reduce((sum, r) => sum + (r.timeSpentMs || 0), 0);

      track("challenge_end", {
        id: challengeId,
        total: queue.length,
        answered: answered.length,
        correct: correctCount,
        accuracy,
        time_spent_ms: timeMs
      });

      setDone(true);
      onFinish?.();
    }
  }

  if (!current && !done) {
    return (
      <View style={styles.card}>
        <Text style={styles.text}>No hay actividades en este challenge.</Text>
        <TouchableOpacity onPress={onExit} style={styles.secondaryBtn}>
          <Text>Salir</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (done) {
    const answered = queue.map(id => results[id]).filter(Boolean);
    const correctCount = answered.filter(r => r.correct === true).length;
    const accuracy = queue.length ? Math.round((correctCount / queue.length) * 100) : 0;
    const timeMs = answered.reduce((sum, r) => sum + (r.timeSpentMs || 0), 0);

    return (
        <EndScreen
        challengeId={challengeId}
        accuracy={accuracy}
        correct={correctCount}
        total={queue.length}
        timeMs={timeMs}
        onRetry={() => {
            setIdx(0);
            setDone(false);
        }}
        onHome={onExit ?? (()=>{})}
        onStartChallenge={(id)=> {
            // reinicia con otro challenge recomendado
            const ids = getChallengeActivities(id);
            setQueue(ids);
            setIdx(0);
            setDone(false);
        }}
        />
    );
    }

  const progressPct = queue.length ? ((idx + 1) / queue.length) * 100 : 0;

  return (
    <View style={styles.wrapper}>
      {/* progreso */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
      </View>
      <Text style={styles.progressLabel}>
        {idx + 1} / {queue.length}
      </Text>

      {/* actividad */}
      <ActivityRunner activityId={current} onNext={next} onExit={onExit} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingVertical: 8 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 6 },
  text: { fontSize: 16, color: "#333" },
  progressBar: {
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 99,
    overflow: "hidden",
    marginHorizontal: 16,
    marginBottom: 6
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#000"
  },
  progressLabel: {
    alignSelf: "flex-end",
    marginRight: 16,
    marginBottom: 8,
    fontSize: 12,
    color: "#666"
  },
  primaryBtn: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: "flex-start"
  },
  primaryBtnText: { color: "#fff", fontWeight: "600" },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 8
  }
});