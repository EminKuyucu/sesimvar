import axios from 'axios';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../theme/Colors';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [tcNo, setTcNo] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !tcNo || !phone || !password) {
      return Alert.alert('Eksik Bilgi', 'Tüm alanları doldurmalısınız.');
    }

    try {
      setLoading(true);

      const response = await axios.post('http://10.95.64.36:5000/user/register', {
        full_name: fullName,
        tc_no: tcNo,
        phone_number: phone,
        password
      });

      // ✅ API'den gelen mesajı gösteriyoruz
      const message = response.data?.message || 'Kayıt başarılı!';
      Alert.alert('Başarılı', message);
      router.replace('/login');

    } catch (err) {
      console.error('Kayıt hatası:', err);
      Alert.alert('Hata', 'Kayıt yapılamadı. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>

      <TextInput
        placeholder="Ad Soyad"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />
      <TextInput
        placeholder="TC Kimlik No"
        value={tcNo}
        onChangeText={setTcNo}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Telefon"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Kayıt Ol</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.link}>Zaten hesabın var mı? Giriş yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: Colors.background },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.text, marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#fff', padding: 12, marginBottom: 16, borderRadius: 10, borderWidth: 1, borderColor: '#ccc' },
  button: { backgroundColor: Colors.safe, padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { color: Colors.info, marginTop: 16, textAlign: 'center', textDecorationLine: 'underline' }
});