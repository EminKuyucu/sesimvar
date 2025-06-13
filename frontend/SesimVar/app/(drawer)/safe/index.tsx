import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../theme/colors';
import useAuthRedirect from '../../../hooks/useAuthRedirect'; // 🔐 Token kontrolü

export default function SafeScreen() {
  useAuthRedirect(); // ⛔ Token yoksa login'e yönlendir

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    const getToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
    };
    getToken();
  }, []);

  const handleSendSafe = async () => {
    setLoading(true);
    setSuccess(false);
    setLocationError('');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Konum izni verilmedi. Lütfen ayarlardan izin verin.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const res = await axios.post(
        'http://10.196.232.32:5000/user/safe-status',
        { latitude, longitude },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.status === 201 || res.status === 200) {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Güvende bildirimi hatası:', err);
      setLocationError('Bildirim gönderilemedi. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Konumunuzu bildirerek güvende olduğunuzu belirtebilirsiniz.
      </Text>

      <TouchableOpacity
        style={[styles.button, success && styles.buttonSuccess]}
        onPress={handleSendSafe}
        disabled={loading || success}
      >
        <Text style={styles.buttonText}>
          {success ? '✅ Gönderildi' : '✅ Güvendeyim'}
        </Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" color={Colors.safe} style={{ marginTop: 20 }} />
      )}

      {locationError !== '' && (
        <Text style={styles.error}>{locationError}</Text>
      )}

      {success && (
        <Text style={styles.success}>✅ Bildiriminiz başarıyla gönderildi!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 16, marginBottom: 30, textAlign: 'center', color: Colors.text },
  button: {
    backgroundColor: Colors.safe,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonSuccess: {
    backgroundColor: '#2E7D32',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  success: { marginTop: 20, fontSize: 16, color: Colors.safe },
  error: { marginTop: 20, fontSize: 14, color: 'red', textAlign: 'center' },
});
