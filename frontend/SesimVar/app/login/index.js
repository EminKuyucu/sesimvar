import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../theme/Colors';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.includes('@') || !password) {
      return Alert.alert('Hata', 'Geçerli bilgiler giriniz.');
    }

    try {
      setLoading(true);
      const res = await axios.post('http://<ip>:5000/user/login', {
        email,
        password
      });

      // ✅ Token’ı kaydet
      await AsyncStorage.setItem('token', res.data.token);

      Alert.alert('Başarılı', 'Giriş başarılı!');
      router.replace('/'); // Anasayfaya yönlendirme
    } catch (err) {
      console.error(err);
      Alert.alert('Hata', 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Yap</Text>

      <TextInput
        placeholder="E-posta"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Giriş Yap</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.link}>Hesabın yok mu? Kayıt ol</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: Colors.background },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.text, marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#fff', padding: 12, marginBottom: 16, borderRadius: 10, borderWidth: 1, borderColor: '#ccc' },
  button: { backgroundColor: Colors.primary, padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { color: Colors.info, marginTop: 16, textAlign: 'center', textDecorationLine: 'underline' }
});
