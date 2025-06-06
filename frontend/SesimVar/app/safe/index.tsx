import axios from 'axios';
import * as Location from 'expo-location';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../theme/Colors';

export default function SafeScreen() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = 'JWT_TOKEN_STRING'; // 🔐 Buraya gerçek token

  const handleSendSafe = async () => {
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
        'http://192.168.1.10:5000/safe-status',
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
      console.error('Güvende bildirimi hatası:', err);
      alert('Bildirim gönderilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Konumunuzu bildirerek güvende olduğunuzu belirtebilirsiniz.</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSendSafe}
        disabled={loading}
      >
        <Text style={styles.buttonText}>✅ Güvendeyim</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color={Colors.safe} style={{ marginTop: 20 }} />}
      {success && <Text style={styles.success}>✅ Bildiriminiz başarıyla gönderildi!</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 16, marginBottom: 30, textAlign: 'center', color: Colors.text },
  button: {
    backgroundColor: Colors.safe,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  success: { marginTop: 20, fontSize: 16, color: Colors.safe },
});
