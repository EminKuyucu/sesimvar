import axios from 'axios';
import * as Location from 'expo-location';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../theme/Colors';

export default function HelpScreen() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = 'JWT_TOKEN_STRING'; // 🔐 Buraya gerçek token

  const handleSendHelp = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Konum izni reddedildi');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const res = await axios.post(
        'http://192.168.1.10:5000/help-calls',
        { latitude, longitude },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 201 || res.status === 200) {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Yardım gönderme hatası:', err);
      alert('Yardım gönderilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Konumunuzu bildirerek yardım çağırabilirsiniz.</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSendHelp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>🆘 Yardım Çağır</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />}
      {success && <Text style={styles.success}>✅ Yardım çağrınız iletildi!</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 16, marginBottom: 30, textAlign: 'center', color: Colors.text },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  success: { marginTop: 20, fontSize: 16, color: Colors.safe },
});
