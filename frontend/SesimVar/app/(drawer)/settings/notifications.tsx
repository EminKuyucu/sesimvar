import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Colors } from '../../theme/Colors';

export default function NotificationSettingsScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    general: false,
    emergency: true,
    silentMode: false,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);

      try {
        const res = await axios.get('http://192.168.1.10:5000/user/notifications', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        setSettings({
          general: res.data.general,
          emergency: res.data.emergency,
          silentMode: res.data.silentMode,
        });
      } catch (err) {
        console.error('Bildirim ayarları alınamadı:', err);
        Alert.alert('Hata', 'Bildirim ayarları yüklenemedi.');
      }
    };

    fetchSettings();
  }, []);

  const toggleSwitch = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      await axios.put('http://192.168.1.10:5000/user/notifications', settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Başarılı', 'Bildirim ayarları güncellendi.');
    } catch (err) {
      console.error('Kaydetme hatası:', err);
      Alert.alert('Hata', 'Ayarlar kaydedilemedi.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔔 Bildirim Ayarları</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Genel Bildirimler</Text>
        <Switch
          value={settings.general}
          onValueChange={() => toggleSwitch('general')}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Acil Durum Bildirimleri</Text>
        <Switch
          value={settings.emergency}
          onValueChange={() => toggleSwitch('emergency')}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Sessiz Mod</Text>
        <Switch
          value={settings.silentMode}
          onValueChange={() => toggleSwitch('silentMode')}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
}

NotificationSettingsScreen.options = {
  title: 'Bildirimler',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    color: Colors.text,
  },
  saveButton: {
    backgroundColor: Colors.safe,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
