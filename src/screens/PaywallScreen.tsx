import React from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet } from 'react-native';

export default function PaywallScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.title}>Micro Challenges Premium</Text>
        <Text style={styles.subtitle}>Sin anuncios, retos extra y desafíos semanales</Text>
        <View style={{ height: 16 }} />
        <Button title="Probar Premium (placeholder)" onPress={() => {}} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 14, opacity: 0.7, textAlign: 'center', marginTop: 8 }
});