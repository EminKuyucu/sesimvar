import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Colors } from '../../theme/colors';
import useAuthRedirect from '../../../hooks/useAuthRedirect'; // 🔐 Koruma

export default function ProfileScreen() {
  useAuthRedirect(); // 🔐 Token yoksa login'e yönlendir

  const [formData, setFormData] = useState({
    full_name: '',
    tc_no: '',
    phone_number: '',
    blood_type: '',
    health_status: '',
  });

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);

      try {
        const res = await axios.get('http://10.196.232.32:5000/user/profile', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        setFormData({
          full_name: res.data.full_name || '',
          tc_no: res.data.tc_no || '',
          phone_number: res.data.phone_number || '',
          blood_type: res.data.blood_type || '',
          health_status: res.data.health_status || '',
        });
      } catch (error) {
        console.error(error);
        Alert.alert('Hata', 'Profil verileri alınamadı.');
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      await axios.put(
        'http://10.196.232.32:5000/user/profile',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Başarılı', 'Profil güncellendi.');
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Güncelleme başarısız.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Ad Soyad</Text>
      <TextInput
        style={styles.input}
        value={formData.full_name}
        onChangeText={(text) => setFormData({ ...formData, full_name: text })}
      />

      <Text style={styles.label}>T.C. Kimlik No</Text>
      <TextInput
        style={styles.input}
        value={formData.tc_no}
        onChangeText={(text) => setFormData({ ...formData, tc_no: text })}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Telefon</Text>
      <TextInput
        style={styles.input}
        value={formData.phone_number}
        onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Kan Grubu</Text>
      <TextInput
        style={styles.input}
        value={formData.blood_type}
        onChangeText={(text) => setFormData({ ...formData, blood_type: text })}
      />

      <Text style={styles.label}>Sağlık Durumu</Text>
      <TextInput
        style={styles.input}
        value={formData.health_status}
        onChangeText={(text) => setFormData({ ...formData, health_status: text })}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Kaydet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.safe,
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.gray,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
