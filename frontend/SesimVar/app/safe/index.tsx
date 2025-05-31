import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import AlertModal from '../../components/AlertModal';
import PrimaryButton from '../../components/PrimaryButton';
import { Colors } from '../theme/Colors';

export default function SafeScreen() {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Konum izni reddedildi.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    })();
  }, []);

  const handleSafePress = async () => {
    if (!location) {
      alert('Konum alınamadı');
      return;
    }

    setLoading(true);

    try {
      await axios.post('http://10.196.225.132:5000/safe-status', {
        user_id: 5, // Gerçek kullanıcı ID girilmeli
        latitude: location.latitude,
        longitude: location.longitude
      });

      setModalVisible(true);
    } catch (error) {
      alert("Güvendeyim bildirimi gönderilemedi.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bulunduğun Konum:</Text>
      {location ? (
        <>
          <Text style={styles.location}>
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
          <Ionicons name="checkmark-circle" size={80} color={Colors.safe} style={{ marginVertical: 25 }} />
        </>
      ) : (
        <ActivityIndicator size="large" color={Colors.info} />
      )}

      <PrimaryButton
        title="Güvendeyim"
        onPress={handleSafePress}
        color={Colors.safe}
        style={{ paddingVertical: 16, paddingHorizontal: 40, borderRadius: 12 }}
      />

      <AlertModal
        visible={modalVisible}
        message="Güvendeyim bildiriminiz başarıyla gönderildi!"
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  location: {
    fontSize: 16,
    color: Colors.info,
  },
});
