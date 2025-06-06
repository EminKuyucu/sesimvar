import axios from 'axios';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/Colors';

export default function SettingsScreen() {
  const [formData, setFormData] = useState({
    name: '',
    tc: '',
    phone: '',
    email: '',
    password: '',
    health: '',
    blood: '',
    address: '',
  });

  const token = 'JWT_TOKEN_STRING'; // 🔐 Gerçek token buraya gelecek

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://192.168.1.10:5000/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;

        setFormData({
          name: data.name || '',
          tc: data.tc || '',
          phone: data.phone || '',
          email: data.email || '',
          password: '',
          health: data.health || '',
          blood: data.blood || '',
          address: data.address || '',
        });
      } catch (err) {
        console.error('Profil verisi alınamadı:', err);
        Alert.alert('Hata', 'Kullanıcı bilgileri alınamadı.');
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSave = async () => {
    try {
      await axios.put('http://192.168.1.10:5000/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Başarılı', 'Bilgileriniz güncellendi.');
    } catch (err) {
      console.error('Güncelleme hatası:', err);
      Alert.alert('Hata', 'Bilgiler güncellenemedi.');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Hesabı Sil',
      'Bu işlem geri alınamaz. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete('http://192.168.1.10:5000/user/delete', {
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert('Hesap silindi', 'Çıkış yapılıyor...');
              // TODO: Giriş ekranına yönlendirme yapılabilir
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>👤 Kullanıcı Bilgileri</Text>

      <TextInput style={styles.input} placeholder="Ad Soyad" value={formData.name} onChangeText={(text) => handleChange('name', text)} />
      <TextInput style={styles.input} placeholder="T.C. Kimlik No" value={formData.tc} keyboardType="numeric" onChangeText={(text) => handleChange('tc', text)} />
      <TextInput style={styles.input} placeholder="Telefon" value={formData.phone} keyboardType="phone-pad" onChangeText={(text) => handleChange('phone', text)} />
      <TextInput style={styles.input} placeholder="E-posta" value={formData.email} keyboardType="email-address" onChangeText={(text) => handleChange('email', text)} />
      <TextInput style={styles.input} placeholder="Şifre" value={formData.password} secureTextEntry onChangeText={(text) => handleChange('password', text)} />

      <Text style={styles.sectionTitle}>🚑 Afet Bilgileri</Text>

      <TextInput style={styles.input} placeholder="Sağlık Problemleri" value={formData.health} onChangeText={(text) => handleChange('health', text)} />
      <TextInput style={styles.input} placeholder="Kan Grubu" value={formData.blood} onChangeText={(text) => handleChange('blood', text)} />
      <TextInput style={styles.input} placeholder="Adres / Konum Bilgisi" value={formData.address} onChangeText={(text) => handleChange('address', text)} />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Bilgileri Kaydet</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>⚠️ Hesap İşlemleri</Text>
      <TouchableOpacity style={styles.dangerButton} onPress={handleDelete}>
        <Text style={styles.dangerButtonText}>Hesabı Sil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    color: Colors.text,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
    paddingVertical: 8,
    marginBottom: 15,
    fontSize: 15,
    color: Colors.text,
  },
  saveButton: {
    backgroundColor: Colors.safe,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dangerButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  dangerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
