import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import useAuthRedirect from '../../../hooks/useAuthRedirect'; // 🔒 Koruma eklendi
import { Colors } from '../../../theme/colors';

export default function EmergencyInfoScreen() {
  useAuthRedirect(); // 🔒 Giriş kontrolü

  const [formData, setFormData] = useState({
    health_status: '',
    blood_type: '',
    address: '',
  });

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);

      try {
        const res = await axios.get('http://10.196.232.32:5000/user/profile', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        setFormData({
          health_status: res.data.health_status || '',
          blood_type: res.data.blood_type || '',
          address: res.data.address || '',
        });
      } catch (err) {
        console.error('Bilgi alınamadı:', err);
        Alert.alert('Hata', 'Afet bilgileri yüklenemedi.');
      }
    };

    loadData();
  }, []);

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSave = async () => {
    try {
      await axios.put('http://10.196.232.32:5000/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Başarılı', 'Afet bilgileri kaydedildi.');
    } catch (err) {
      console.error('Kaydetme hatası:', err);
      Alert.alert('Hata', 'Bilgiler kaydedilemedi.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🚑 Afet / Yardım Bilgileri</Text>

      <TextInput
        style={styles.input}
        placeholder="Sağlık Problemleri"
        value={formData.health_status}
        onChangeText={(text) => handleChange('health_status', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Kan Grubu"
        value={formData.blood_type}
        onChangeText={(text) => handleChange('blood_type', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Adres / Konum (opsiyonel)"
        value={formData.address}
        onChangeText={(text) => handleChange('address', text)}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Kaydet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

EmergencyInfoScreen.options = {
  title: 'Afet Bilgileri',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.text,
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
    paddingVertical: 8,
    marginBottom: 20,
    fontSize: 15,
    color: Colors.text,
  },
  saveButton: {
    backgroundColor: Colors.safe,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
