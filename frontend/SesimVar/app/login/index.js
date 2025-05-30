import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [tcNo, setTcNo] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!tcNo || !password) {
      Alert.alert('Lütfen TC ve şifre giriniz!');
      return;
    }

    if (tcNo.length !== 11 || isNaN(tcNo)) {
      Alert.alert('TC Kimlik numarası 11 haneli olmalıdır!');
      return;
    }

    try {
      const response = await axios.post('http://10.95.68.129:5000/user/login', {
        tc_no: tcNo,
        password: password
      });

      if (response.data.status === 'success') {
        Alert.alert('Giriş başarılı!');
        await AsyncStorage.setItem('token', response.data.token);
        router.push('/home');
      } else {
        Alert.alert('Giriş başarısız: ' + response.data.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Yap</Text>

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
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Giriş Yap" onPress={handleLogin} />

      <Text style={styles.link} onPress={() => router.push('/register')}>
        Hesabın yok mu? Kayıt ol
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 10 },
  link: { marginTop: 15, color: 'blue', textAlign: 'center' },
});
