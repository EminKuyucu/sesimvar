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
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../theme/colors';

export default function LoginScreen() {
  const router = useRouter();
  const [tcNo, setTcNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Giriş yapılmışsa direkt ana sayfaya yönlendir
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) router.replace('/(drawer)/home');
    };
    checkToken();
  }, [router]); // 🔧 Hata düzeltildi: router dependency olarak eklendi

  const handleLogin = async () => {
    if (!tcNo || !password) {
      return Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurun.');
    }

    if (tcNo.length !== 11 || password.length < 4) {
      return Alert.alert('Geçersiz Giriş', 'TC Kimlik No 11 haneli olmalı, şifre en az 4 karakter olmalı.');
    }

    try {
      setLoading(true);

      const res = await axios.post('http://10.196.232.32:5000/user/login', {
        tc_no: tcNo,
        password,
      });

      const token = res.data?.data?.token;
      const fullName = res.data?.data?.full_name || 'Kullanıcı';

      if (!token) {
        return Alert.alert('Sunucu Hatası', 'Token alınamadı. Lütfen tekrar deneyin.');
      }

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('full_name', fullName);

      Alert.alert('Giriş Başarılı', 'Hoş geldiniz!');
      router.replace('/(drawer)/home');
    } catch (err) {
      console.error('Giriş hatası:', err?.response?.data || err);
      Alert.alert('Hatalı Giriş', 'TC Kimlik No veya şifre yanlış.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
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

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Giriş Yap</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.link}>Hesabın yok mu? Kayıt Ol</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  card: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fdfdfd',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  link: {
    marginTop: 16,
    color: Colors.info,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});
