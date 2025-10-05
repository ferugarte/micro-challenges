import { View, Text } from 'react-native';
import { ReactNode } from 'react';

export default function ChallengeCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ padding: 16, borderWidth: 1, borderRadius: 12, gap: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>{title}</Text>
      {children}
    </View>
  );
}
