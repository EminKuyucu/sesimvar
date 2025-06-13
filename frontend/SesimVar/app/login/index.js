import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { Colors } from '../theme/colors';

export default function LoginScreen() {
  const router = useRouter();
  const [tcNo, setTcNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Token varsa direkt home'a yönlendir
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        router.replace('/(drawer)/home');
      }
    };
    checkToken();
  }, []);

  const handleLogin = async () => {
    if (!tcNo || !password) {
      return Alert.alert('Hata', 'Tüm alanları doldurun.');
    }

    if (tcNo.length !== 11 || password.length < 4) {
      return Alert.alert('Hata', 'Geçerli bir TC kimlik numarası ve şifre giriniz.');
    }

    try {
      setLoading(true);

      const res = await axios.post('http://10.196.232.32:5000/user/login', {
        tc_no: tcNo,
        password
      });

      console.log("Login yanıtı:", res.data);

      const token = res.data?.data?.token;
      const fullName = res.data?.data?.full_name || 'Kullanıcı';

      if (!token) {
        Alert.alert('Hata', 'Sunucudan geçerli bir token alınamadı.');
        return;
      }

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('full_name', fullName);

      Alert.alert('Başarılı', 'Giriş başarılı!');
      router.replace('/(drawer)/home');
    } catch (err) {
      console.error('Giriş hatası:', err?.response?.data || err);
      Alert.alert('Hata', 'TC Kimlik No veya şifre yanlış.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Giriş Yap</Text>

      <TextInput
        placeholder="TC Kimlik No"
        value={tcNo}
        onChangeText={setTcNo}
        style={styles.input}
        keyboardType="numeric"
        maxLength={11}
        placeholderTextColor={Colors.gray}
      />

      <TextInput
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor={Colors.gray}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Giriş Yap</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.link}>Hesabın yok mu? Kayıt ol</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: Colors.background },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.text, marginBottom: 20, textAlign: 'center' },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: {
    color: Colors.info,
    marginTop: 16,
    textAlign: 'center',
    textDecorationLine: 'underline'
  }
});
