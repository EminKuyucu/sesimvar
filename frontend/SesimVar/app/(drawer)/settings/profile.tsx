::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::                   import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../../theme/colors';

export default function ProfileScreen() {
  const [formData, setFormData] = useState({
    name: '',
    tc: '',
    phone: '',
    email: '',
    password: '',
  });

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        setToken(storedToken);

        const res = await axios.get('http://<IP_ADRESINIZ>:5000/user/profile', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        const data = res.data.data;
        setFormData({
          name: data.full_name || '',
          tc: data.tc_no || '',
          phone: data.phone_number || '',
          email: data.email || '',
          password: '', // Güvenlik nedeniyle boş gösteriyoruz
        });
      } catch (err) {
        console.error(err);
        Alert.alert('Hata', 'Profil verileri alınamadı.');
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      await axios.put(
        'http://<IP_ADRESINIZ>:5000/user/profile',
        {
          full_name: formData.name,
          tc_no: formData.tc,
          phone_number: formData.phone,
          email: formData.email,
          password: formData.password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Başarılı', 'Profil güncellendi.');
    } catch (err) {
      console.error(err);
      Alert.alert('Hata', 'Profil güncellenemedi.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Ad Soyad</Text>
      <TextInput
        style={styles.input}
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />

      <Text style={styles.label}>T.C. Kimlik No</Text>
      <TextInput
        style={styles.input}
        value={formData.tc}
        onChangeText={(text) => setFormData({ ...formData, tc: text })}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Telefon Numarası</Text>
      <TextInput
        style={styles.input}
        value={formData.phone}
        onChangeText={(text) => setFormData({ ...formData, phone: text })}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>E-posta</Text>
      <TextInput
        style={styles.input}
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Şifre</Text>
      <TextInput
        style={styles.input}
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        secureTextEntry
        placeholder="Yeni şifre giriniz"
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
    borderColor: Colors.border,
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
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
                                                                                                                                              