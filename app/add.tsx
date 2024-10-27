import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';

export default function AddScreen() {
  const router = useRouter();

  const handleAddPress = () => {
    // Navigate to the input flow
    router.push('/add/input-flow');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Add Assessment' }} />
      <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 40,
    color: 'white',
  },
});
