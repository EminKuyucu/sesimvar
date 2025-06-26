import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Neighborhood = {
  id: number;
  name: string;
  district: string;
  city: string;
};

export default function AddressScreen() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [selectedId, setSelectedId] = useState<number>(0);
  const [street, setStreet] = useState('');
  const [coords, setCoords] = useState({ latitude: 0, longitude: 0 });
  const [loading, setLoading] = useState(false);
  const [hasAddress, setHasAddress] = useState(false); // 🟡 Adres var mı kontrolü

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // 🟢 Mahalle listesi
        const res = await axios.get('http://192.168.31.73:5000/neighborhoods');
        setNeighborhoods(res.data);

        // 🟢 Mevcut adresi çek
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const addressRes = await axios.get('http://192.168.31.73:5000/user/address', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = addressRes.data.data;
        setSelectedId(data.neighborhood_id);
        setStreet(data.street);
        setCoords({ latitude: data.latitude, longitude: data.longitude });
        setHasAddress(true); // ✅ Adres varsa
      } catch (err) {
        // Eğer 404 dönüyorsa adres yok demektir → bu durumda sessiz geç
        console.log('Adres bulunamadı veya hatalı:', err.response?.status);
        setHasAddress(false);
      }
    };

    loadInitialData();
  }, []);

  const handleGetLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Konum izni verilmedi.');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setCoords(location.coords);
  };

  const handleSubmit = async () => {
    if (!selectedId || !street.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen mahalle ve sokak bilgisini girin.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const payload = {
        neighborhood_id: selectedId,
        street: street.trim(),
        latitude: coords.latitude,
        longitude: coords.longitude,
      };

      const url = hasAddress
        ? 'http://192.168.31.73:5000/user/address'
        : 'http://192.168.31.73:5000/user/address';

      const method = hasAddress ? 'put' : 'post';

      await axios[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Başarılı', hasAddress ? 'Adres güncellendi.' : 'Adres kaydedildi.');
      setHasAddress(true); // Artık adres olduğu kesin
    } catch (error) {
      console.error('Adres gönderme hatası:', error);
      Alert.alert('Hata', 'İşlem sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {hasAddress ? '📍 Adresini Güncelle' : '📍 Adresini Kaydet'}
      </Text>

      <Text style={styles.label}>Mahalle:</Text>
      <Picker
        selectedValue={selectedId}
        onValueChange={(val) => setSelectedId(val)}
        style={styles.picker}
      >
        <Picker.Item label="Mahalle seçin..." value={0} />
        {neighborhoods.map((n) => (
          <Picker.Item key={n.id} label={`${n.name} / ${n.district}`} value={n.id} />
        ))}
      </Picker>

      <Text style={styles.label}>Sokak:</Text>
      <TextInput
        style={styles.input}
        placeholder="1012. Sokak"
        value={street}
        onChangeText={setStreet}
      />

      <Button title="Konumumu Al" onPress={handleGetLocation} />

      <View style={{ marginTop: 16 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#1976D2" />
        ) : (
          <Button
            title={hasAddress ? 'Güncelle' : 'Kaydet'}
            onPress={handleSubmit}
            color="#1976D2"
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1976D2',
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
  },
  picker: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
});
