import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function RecordsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Stack.Screen options={{ title: 'Records' }} />
      <Text>Records Screen</Text>
    </View>
  );
}
