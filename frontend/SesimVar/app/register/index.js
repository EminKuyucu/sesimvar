import { Ionicons } from '@expo/vector-icons'; // 👈 ikonlar için
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [tcNo, setTcNo] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 👁️ kontrol

  const isPasswordValid = (pw) => {
    return (
      pw.length >= 8 &&
      /[A-Z]/.test(pw) &&
      /[0-9]/.test(pw)
    );
  };

  const handleRegister = () => {
    if (!fullName || !tcNo || !phone || !password) {
      Alert.alert('Lütfen tüm alanları doldurun!');
      return;
    }

    if (tcNo.length !== 11 || isNaN(tcNo)) {
      Alert.alert('TC Kimlik numarası 11 haneli olmalıdır!');
      return;
    }

    if (phone.length < 10) {
      Alert.alert('Telefon numarası eksik görünüyor!');
      return;
    }

    if (!isPasswordValid(password)) {
      Alert.alert('Şifre en az 8 karakter, 1 büyük harf ve 1 sayı içermelidir!');
      return;
    }

    Alert.alert('Kayıt başarılı!');
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>

      <TextInput
        style={styles.input}
        placeholder="Ad Soyad"
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={styles.input}
        placeholder="TC Kimlik No"
        value={tcNo}
        onChangeText={setTcNo}
        keyboardType="numeric"
        maxLength={11}
      />

      <TextInput
        style={styles.input}
        placeholder="Telefon Numarası"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      {/* Şifre + göz simgesi */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? 'eye' : 'eye-off'}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.passwordNote}>
        Şifre en az 8 karakter, 1 büyük harf ve 1 sayı içermelidir.
      </Text>

      <Button title="Kayıt Ol" onPress={handleRegister} />

      <Text style={styles.link} onPress={() => router.push('/login')}>
        Zaten hesabın var mı? Giriş yap
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 10 },
  passwordNote: { fontSize: 12, color: '#666', marginBottom: 15 },
  link: { marginTop: 15, color: 'blue', textAlign: 'center' },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
  },
});
