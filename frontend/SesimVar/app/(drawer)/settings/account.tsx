import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../theme/colors';
import useAuthRedirect from '../../../hooks/useAuthRedirect'; // 🔒 Giriş koruması eklendi

export default function AccountSettingsScreen() {
  useAuthRedirect(); // 🔒 Giriş yapılmadıysa login sayfasına yönlendir

  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('full_name');
    Alert.alert('Çıkış yapıldı');
    router.replace('/login');
  };

  const handleDelete = () => {
    Alert.alert(
      'Hesabı Sil',
      'Bu işlem geri alınamaz. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const token = await AsyncStorage.getItem('token');
            try {
              await axios.delete('http://10.196.232.32:5000/user/profile', {
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert('Hesap silindi');
              handleLogout();
            } catch (err) {
              console.error('Silme hatası:', err);
              Alert.alert('Hata', 'Hesap silinemedi.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handlePasswordChange = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      await axios.put(
        'http://10.196.232.32:5000/user/password', // ⚠️ Bu endpoint backend'de varsa çalışır
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert('Başarılı', 'Şifreniz güncellendi.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      console.error('Şifre değiştirme hatası:', err);
      Alert.alert('Hata', 'Şifre güncellenemedi.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Şifre Güncelle</Text>

      <TextInput
        placeholder="Mevcut Şifre"
        style={styles.input}
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />

      <TextInput
        placeholder="Yeni Şifre"
        style={styles.input}
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handlePasswordChange}>
        <Text style={styles.buttonText}>Şifreyi Güncelle</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🚪 Oturum</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Çıkış Yap</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.buttonText}>Hesabı Sil</Text>
      </TouchableOpacity>
    </View>
  );
}

AccountSettingsScreen.options = {
  title: 'Hesap Ayarları',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
    color: Colors.text,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 15,
    color: Colors.text,
  },
  button: {
    backgroundColor: Colors.safe,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  deleteButton: {
    backgroundColor: '#B71C1C',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
