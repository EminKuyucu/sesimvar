import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';

type Neighborhood = {
  id: number;
  name: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
};

export default function AddressScreen() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // 🟢 Mahalleleri Çek
  useEffect(() => {
    axios
      .get('http://192.168.31.73:5000/neighborhoods')
      .then((res) => setNeighborhoods(res.data))
      .catch((err) => {
        console.error('Mahalleleri alma hatası:', err);
        Alert.alert('Hata', 'Mahalleler yüklenemedi.');
      });
  }, []);

  // 🟢 Konum al ve adresi gönder
  const handleSubmit = async () => {
    if (!selectedId) {
      Alert.alert('Uyarı', 'Lütfen bir mahalle seçin.');
      return;
    }

    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Hata', 'Konum izni verilmedi.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Hata', 'Giriş yapmadınız.');
        return;
      }

      const body = {
        neighborhood_id: selectedId,
        street: "1012. Sokak", // İstersen TextInput ekleyebilirsin
        latitude,
        longitude,
      };

      const res = await axios.post(
        'http://192.168.31.73:5000/user/address',
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.status === 200 || res.status === 201) {
        Alert.alert('Başarılı', 'Adres kaydedildi.');
      } else {
        Alert.alert('Hata', 'Sunucu hatası.');
      }
    } catch (error) {
      console.error('Adres gönderme hatası:', error);
      Alert.alert('Hata', 'Adres gönderilirken sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Mahalleni Seç:</Text>
      <Picker
        selectedValue={selectedId}
        onValueChange={(itemValue) => setSelectedId(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Mahalle seçin..." value={null} />
        {neighborhoods.map((n) => (
          <Picker.Item
            key={n.id}
            label={`${n.name} / ${n.district}`}
            value={n.id}
          />
        ))}
      </Picker>

      <Button
        title={loading ? 'Gönderiliyor...' : 'Adresi Kaydet'}
        onPress={handleSubmit}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  picker: {
    marginBottom: 20,
  },
});
