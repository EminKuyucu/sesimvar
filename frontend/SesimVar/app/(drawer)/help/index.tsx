import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
import useAuthRedirect from '../../../hooks/useAuthRedirect';
import { Colors } from '../../../theme/colors';

export default function HelpScreen() {
  useAuthRedirect();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
    };
    loadToken();
  }, []);

  const handleSendHelp = async () => {
    if (!token) return alert('Giriş yapmadan yardım gönderemezsiniz.');
    if (message.trim() === '') return alert('Lütfen bir mesaj yazın.');

    setLoading(true);
    setSuccess(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Konum izni reddedildi');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const res = await axios.post(
        'http://10.196.232.32:5000/user/help-calls',
        {
          latitude,
          longitude,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.status === 200 || res.status === 201) {
        setSuccess(true);
        setMessage('');
      }
    } catch (err) {
      console.error('Yardım gönderme hatası:', err);
      alert('Yardım gönderilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Konumunuzu bildirerek yardım çağırabilirsiniz.</Text>

      <TextInput
        style={styles.input}
        placeholder="Yardım mesajınızı yazın..."
        placeholderTextColor={Colors.gray}
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleSendHelp} disabled={loading}>
        <Text style={styles.buttonText}>🆘 Yardım Çağır</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />}
      {success && <Text style={styles.success}>✅ Yardım çağrınız iletildi!</Text>}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 16, marginBottom: 20, textAlign: 'center', color: Colors.text },
  input: {
    width: '100%',
    height: 100,
    borderColor: Colors.gray,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 20,
    color: Colors.text,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  success: { marginTop: 20, fontSize: 16, color: Colors.safe },
});
