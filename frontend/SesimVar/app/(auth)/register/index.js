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
import { Colors } from '../../../theme/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [tcNo, setTcNo] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        router.replace('/(drawer)/home');
      }
    };
    checkToken();
  }, [router]);

  const handleRegister = async () => {
    if (!fullName || !tcNo || !phone || !password) {
      return Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurun.');
    }

    if (tcNo.length !== 11) {
      return Alert.alert('TC Kimlik No Hatası', 'TC Kimlik numarası 11 haneli olmalıdır.');
    }

    if (phone.length < 10) {
      return Alert.alert('Telefon Hatası', 'Geçerli bir telefon numarası girin.');
    }

    if (password.length < 4) {
      return Alert.alert('Şifre Hatası', 'Şifre en az 4 karakter olmalıdır.');
    }

    try {
      setLoading(true);
      const res = await axios.post('http://10.196.232.32:5000/user/register', {
        full_name: fullName,
        tc_no: tcNo,
        phone_number: phone,
        password
      });

      const message = res.data?.message || 'Kayıt başarılı!';
      Alert.alert('Başarılı', message);
      router.replace('/login');
    } catch (err) {
      console.error('Kayıt hatası:', err?.response?.data || err);
      Alert.alert('Hata', 'Kayıt başarısız. TC Kimlik No zaten kayıtlı olabilir.');
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
        <Text style={styles.title}>Kayıt Ol</Text>

        <TextInput
          placeholder="Ad Soyad"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
          placeholderTextColor={Colors.gray}
        />
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
          placeholder="Telefon Numarası"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          keyboardType="phone-pad"
          maxLength={15}
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
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={styles.link}>Zaten hesabın var mı? Giriş Yap</Text>
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
    backgroundColor: Colors.safe,
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
