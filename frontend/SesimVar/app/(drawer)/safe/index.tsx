import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../theme/colors';
import useAuthRedirect from '../../../hooks/useAuthRedirect';

export default function SafeScreen() {
  useAuthRedirect();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
    };
    fetchToken();
  }, []);

  const handleSendSafe = useCallback(async () => {
    setLoading(true);
    setSuccess(false);
    setErrorMsg('');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Konum izni verilmedi. Ayarlardan izin vermelisiniz.');
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
      } else {
        setErrorMsg('Sunucu hatası. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      console.error('Güvende bildirimi hatası:', err);
      setErrorMsg('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Konumunu bildirerek güvende olduğunu iletebilirsin.
      </Text>

      <TouchableOpacity
        style={[styles.button, success && styles.buttonSuccess]}
        onPress={handleSendSafe}
        disabled={loading || success}
      >
        <Text style={styles.buttonText}>
          {success ? '✅ Bildirildi' : '✅ Güvendeyim'}
        </Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" color={Colors.safe} style={styles.indicator} />
      )}

      {!!errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

      {success && <Text style={styles.success}>✅ Bildirim başarıyla gönderildi!</Text>}
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
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: Colors.text,
  },
  button: {
    backgroundColor: Colors.safe,
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonSuccess: {
    backgroundColor: '#2E7D32',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  indicator: {
    marginTop: 20,
  },
  success: {
    color: Colors.safe,
    fontSize: 16,
    marginTop: 20,
  },
  error: {
    color: 'red',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },
});
