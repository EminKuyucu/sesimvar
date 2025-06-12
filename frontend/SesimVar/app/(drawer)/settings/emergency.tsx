import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { Colors } from '../../theme/Colors';

export default function EmergencyInfoScreen() {
  const [formData, setFormData] = useState({
    health: '',
    blood: '',
    address: '',
  });

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);

      try {
        const res = await axios.get('http://10.192.237.249:5000/user/emergency', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        setFormData({
          health: res.data.health || '',
          blood: res.data.blood || '',
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
      await axios.put('http://10.192.237.249:5000/user/emergency', formData, {
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
        value={formData.health}
        onChangeText={(text) => handleChange('health', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Kan Grubu"
        value={formData.blood}
        onChangeText={(text) => handleChange('blood', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Adres / Konum"
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
