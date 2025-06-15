import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Colors } from '../../theme/colors';
import useAuthRedirect from '../../../hooks/useAuthRedirect';

export default function NotificationSettingsScreen() {
  useAuthRedirect();

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    general: false,
    emergency: true,
    silentMode: false,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) return;
      setToken(storedToken);
      setLoading(true);

      try {
        const res = await axios.get('http://10.196.232.32:5000/user/notifications', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        setSettings({
          general: res.data.general ?? false,
          emergency: res.data.emergency ?? true,
          silentMode: res.data.silentMode ?? false,
        });
      } catch (err) {
        console.error('Bildirim ayarları alınamadı:', err);
        Alert.alert('Hata', 'Bildirim ayarları yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const toggleSwitch = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!token) return;

    try {
      setLoading(true);
      await axios.put('http://10.196.232.32:5000/user/notifications', settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Başarılı', 'Bildirim ayarları güncellendi.');
    } catch (err) {
      console.error('Kaydetme hatası:', err);
      Alert.alert('Hata', 'Ayarlar kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🔔 Bildirim Ayarları</Text>

      <SettingRow
        label="Genel Bildirimler"
        value={settings.general}
        onToggle={() => toggleSwitch('general')}
      />
      <SettingRow
        label="Acil Durum Bildirimleri"
        value={settings.emergency}
        onToggle={() => toggleSwitch('emergency')}
      />
      <SettingRow
        label="Sessiz Mod"
        value={settings.silentMode}
        onToggle={() => toggleSwitch('silentMode')}
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

function SettingRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} />
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
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: Colors.text,
  },
  row: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: Colors.text,
  },
  button: {
    backgroundColor: Colors.safe,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
