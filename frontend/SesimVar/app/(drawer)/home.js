import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Location from 'expo-location';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import useAuthRedirect from '../../hooks/useAuthRedirect'; // 🔐
import { Colors } from '../theme/colors'; // ✅ düzeltildi

export default function HomeScreen() {
  useAuthRedirect(); // 🔐 Token kontrolü

  const handleHelp = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Hata', 'Token bulunamadı. Lütfen yeniden giriş yap.');
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Konum İzni Reddedildi', 'Yardım çağrısı için konum izni gereklidir.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      await axios.post(
        'http://192.168.31.73:5000/user/help-calls',
        {
          message: 'Yardım edin!',
          latitude,
          longitude,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Başarılı', 'Yardım çağrısı gönderildi!');
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Yardım çağrısı gönderilemedi.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hoş geldin 👋</Text>
      <Text style={styles.subtitle}>
        Afet anında hızlıca yardım çağırabilirsin.
      </Text>

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
