import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../theme/Colors';

export default function HomeScreen() {
  const router = useRouter();

  const handleHelp = () => {
    Alert.alert("Uyarı", "Yardım sayfasına gidiliyor...");
    router.push('/help');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hoş geldin, Sara 👋</Text>
      <Text style={styles.subtitle}>Afet anında hızlıca yardım çağırabilirsin.</Text>

      <TouchableOpacity style={styles.button} onPress={handleHelp}>
        <Ionicons name="alert-circle" size={28} color="#fff" />
        <Text style={styles.buttonText}>Acil Yardım Çağrısı</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
