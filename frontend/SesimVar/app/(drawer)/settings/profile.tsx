import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import useAuthRedirect from '../../../hooks/useAuthRedirect';
import { Colors } from '../../theme/colors';

export default function ProfileScreen() {
  useAuthRedirect(); // 🔐 Token yoksa yönlendir

  const [formData, setFormData] = useState({
    full_name: '',
    tc_no: '',
    phone_number: '',
    email: '',
  });

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) return;

      setToken(storedToken);
      setLoading(true);

      try {
        const res = await axios.get('http://192.168.31.73:5000/user/profile', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        setFormData({
          full_name: res.data.full_name || '',
          tc_no: res.data.tc_no || '',
          phone_number: res.data.phone_number || '',
          email: res.data.email || '',
        });
      } catch (error) {
        console.error(error);
        Alert.alert('Hata', 'Profil bilgileri alınamadı.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!token) return;

    try {
      setLoading(true);
      await axios.put('http://192.168.31.73:5000/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Başarılı', 'Bilgileriniz kaydedildi.');
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Güncelleme başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>👤 Profil Bilgileri</Text>

      <LabelledInput
        label="Ad Soyad"
        value={formData.full_name}
        onChangeText={(text) => setFormData({ ...formData, full_name: text })}
      />
      <LabelledInput
        label="TC Kimlik No"
        value={formData.tc_no}
        editable={false}
      />
      <LabelledInput
        label="Telefon"
        value={formData.phone_number}
        onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
        keyboardType="phone-pad"
      />
      <LabelledInput
        label="E-Posta"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Kaydet</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

function LabelledInput({ label, ...props }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor={Colors.gray} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: Colors.text,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
