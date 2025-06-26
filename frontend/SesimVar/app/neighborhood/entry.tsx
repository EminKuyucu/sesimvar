import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';

const damageOptions = ['Yok', 'Hafif', 'Orta', 'Ağır'];
const helperRoles = ['Doktor', 'Hemşire', 'İtfaiyeci', 'AFAD Gönüllüsü'];

export default function NeighborhoodEntryScreen() {
  const [buildingAge, setBuildingAge] = useState('');
  const [buildingFloors, setBuildingFloors] = useState('');
  const [damageStatus, setDamageStatus] = useState('');
  const [infrastructureIssues, setInfrastructureIssues] = useState('');
  const [selectedHelpers, setSelectedHelpers] = useState<string[]>([]);

  const handleHelperToggle = (role: string) => {
    if (selectedHelpers.includes(role)) {
      setSelectedHelpers(selectedHelpers.filter((r) => r !== role));
    } else {
      setSelectedHelpers([...selectedHelpers, role]);
    }
  };

  const handleSubmit = async () => {
    if (!buildingAge || !buildingFloors || !damageStatus) {
      return Alert.alert('Uyarı', 'Lütfen tüm zorunlu alanları doldurun.');
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const neighborhoodId = await AsyncStorage.getItem('neighborhood_id'); // Adres ekranında kaydetmelisin

      if (!token || !neighborhoodId) {
        return Alert.alert('Hata', 'Giriş yapılmamış veya mahalle seçilmemiş.');
      }

      const payload = {
        neighborhood_id: parseInt(neighborhoodId),
        building_age: parseInt(buildingAge),
        building_floors: parseInt(buildingFloors),
        damage_status: damageStatus,
        infrastructure_issues: infrastructureIssues,
        helper_roles: selectedHelpers,
      };

      const res = await axios.post(
        'http://10.196.232.32:5000/user/neighborhood-entry',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200 || res.status === 201) {
        Alert.alert('Başarılı', 'Bilgiler kaydedildi.');
      } else {
        Alert.alert('Hata', 'Sunucu hatası oluştu.');
      }
    } catch (error) {
      console.error('Gönderme hatası:', error);
      Alert.alert('Hata', 'Veriler gönderilemedi.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Bina Yaşı</Text>
      <TextInput
        value={buildingAge}
        onChangeText={setBuildingAge}
        keyboardType="numeric"
        style={styles.input}
        placeholder="Örnek: 25"
      />

      <Text style={styles.label}>Kat Sayısı</Text>
      <TextInput
        value={buildingFloors}
        onChangeText={setBuildingFloors}
        keyboardType="numeric"
        style={styles.input}
        placeholder="Örnek: 5"
      />

      <Text style={styles.label}>Hasar Durumu</Text>
      {damageOptions.map((opt) => (
        <TouchableOpacity
          key={opt}
          onPress={() => setDamageStatus(opt)}
          style={[
            styles.option,
            damageStatus === opt && styles.optionSelected,
          ]}
        >
          <Text>{opt}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Tesisat Sorunları</Text>
      <TextInput
        value={infrastructureIssues}
        onChangeText={setInfrastructureIssues}
        multiline
        numberOfLines={4}
        style={styles.textarea}
        placeholder="Varsa belirtin"
      />

      <Text style={styles.label}>Yardımcı Roller</Text>
      {helperRoles.map((role) => (
        <TouchableOpacity
          key={role}
          onPress={() => handleHelperToggle(role)}
          style={[
            styles.option,
            selectedHelpers.includes(role) && styles.optionSelected,
          ]}
        >
          <Text>{role}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Kaydet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 16, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    height: 100,
    borderRadius: 5,
    marginBottom: 15,
  },
  option: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginBottom: 8,
  },
  optionSelected: {
    backgroundColor: '#a0e3b2',
  },
  button: {
    backgroundColor: '#3a86ff',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
