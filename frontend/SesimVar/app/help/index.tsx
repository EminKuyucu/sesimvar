import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import AlertModal from '../../components/AlertModal';
import PrimaryButton from '../../components/PrimaryButton';
import { Colors } from '../../theme/Colors'; // ✅ Büyük C harfine dikkat

export default function HelpScreen() {
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

  const handleHelpPress = async () => {
    if (!location) {
      alert('Konum alınamadı');
      return;
    }

    setLoading(true);

    try {
      await axios.post('http://10.196.225.132/help', {
        user_id: 5,
        latitude: location.latitude,
        longitude: location.longitude,
        message: "Yardım istiyorum!"
      });

      setModalVisible(true);
    } catch (error) {
      alert("Yardım gönderilemedi.");
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
          <Ionicons name="location-sharp" size={80} color="blue" style={{ marginVertical: 25 }} />
        </>
      ) : (
        <ActivityIndicator size="large" color={Colors.info} />
      )}

      <PrimaryButton
        title="Yardım Çağır"
        onPress={handleHelpPress}
        color="red"
        style={{ paddingVertical: 16, paddingHorizontal: 40, borderRadius: 10 }}
      />

      <AlertModal
        visible={modalVisible}
        message="Yardım çağrınız başarıyla gönderildi!"
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
