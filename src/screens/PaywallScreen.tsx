import { View, Text, Button } from 'react-native';
import { purchasePremium, restore } from '../services/purchases';
import { PAYWALL_COPY } from '../copy/paywall';

export default function PaywallScreen() {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>{PAYWALL_COPY.title}</Text>
      {PAYWALL_COPY.bullets.map((b, i) => <Text key={i}>• {b}</Text>)}
      <Button title={PAYWALL_COPY.cta} onPress={purchasePremium} />
      <Button title={PAYWALL_COPY.restore} onPress={restore} />
    </View>
  );
}
