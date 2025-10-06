import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { useSubscription } from "@/store/useSubscription";
import { track } from "@/lib/analytics";

export default function PaywallScreen() {
  const { setPro } = useSubscription();

  React.useEffect(() => {
    track("paywall_view", { source: "paywall_screen" });
  }, []);

  function subscribe(plan: string) {
    track("subscribe_click", { source: "paywall_screen", plan });
    setTimeout(() => {
      setPro(true);
      track("subscribe_success", { source: "paywall_screen", plan });
      Alert.alert("¡Gracias!", `Has activado el plan ${plan}.`);
    }, 300);
  }

  const plans = [
    {
      id: "monthly",
      title: "Plan Mensual",
      price: "$4,99 / mes",
      features: [
        "Challenges avanzados y adaptativos",
        "Estadísticas y progresión detallada",
        "Feedback y explicaciones ampliadas",
      ],
    },
    {
      id: "annual",
      title: "Plan Anual",
      price: "$39,99 / año",
      features: [
        "Ahorra más del 30%",
        "Acceso a todas las actualizaciones",
        "Nuevos desafíos cada mes",
      ],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Desbloquea Premium</Text>
        <Text style={styles.sub}>
          Acceso completo a todos los desafíos, análisis de progreso y retos exclusivos diseñados para
          tu nivel.
        </Text>

        {plans.map((plan) => (
          <View key={plan.id} style={styles.card}>
            <Text style={styles.plan}>{plan.title}</Text>
            <Text style={styles.price}>{plan.price}</Text>
            {plan.features.map((f, idx) => (
              <Text key={idx} style={styles.bullet}>• {f}</Text>
            ))}

            <TouchableOpacity onPress={() => subscribe(plan.title)} style={styles.cta}>
              <Text style={styles.ctaText}>Elegir {plan.title}</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ marginTop: 24 }}>
          <Text style={styles.footerTitle}>¿Por qué elegir Premium?</Text>
          <Text style={styles.footerText}>
            Los desafíos Premium te ayudan a desarrollar tus habilidades con niveles adaptativos,
            estadísticas personalizadas y contenido nuevo cada mes. Ideal para usuarios que quieren
            mejorar día a día.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "800", marginBottom: 4, textAlign: "center" },
  sub: { color: "#555", marginBottom: 16, textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    elevation: 3,
  },
  plan: { fontSize: 18, fontWeight: "700" },
  price: { fontSize: 22, fontWeight: "800", marginVertical: 8 },
  bullet: { color: "#333", marginTop: 4 },
  cta: {
    backgroundColor: "#000",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
    alignItems: "center",
  },
  ctaText: { color: "#fff", fontWeight: "700" },
  footerTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  footerText: { color: "#444", lineHeight: 20 },
});