import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
import useAuthRedirect from '../../../hooks/useAuthRedirect';
import { Colors } from '../../../theme/colors';

export default function AccountSettingsScreen() {
  useAuthRedirect();

  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'full_name']);
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
    if (!currentPassword || !newPassword) {
      Alert.alert('Eksik Bilgi', 'Her iki şifre alanını da doldurun.');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    try {
      setLoading(true);
      await axios.put(
        'http://10.196.232.32:5000/user/password',
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handlePasswordChange}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Şifreyi Güncelle</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.title}>🚪 Oturum</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Çıkış Yap</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.buttonText}>Hesabı Sil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

AccountSettingsScreen.options = {
  title: 'Hesap Ayarları',
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.safe,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteButton: {
    backgroundColor: '#B71C1C',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
