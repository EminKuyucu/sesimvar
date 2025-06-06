import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from './theme/Colors';

export default function HomeScreen() {
  const router = useRouter();

  const handleHelp = async () => {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      Alert.alert("Hata", "Token bulunamadı. Lütfen yeniden giriş yap.");
      return;
    }

    const response = await axios.post('http://<ip>:5000/user/help-calls', {
      message: "Yardım edin!",
      latitude: 36.85,
      longitude: 30.76,
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    Alert.alert("Başarılı", "Yardım çağrısı gönderildi!");
  } catch (error) {
    console.error(error);
    Alert.alert("Hata", "Yardım çağrısı gönderilemedi.");
  }
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