import { StyleSheet, Text, View, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MapScreen() {
  const [region, setRegion] = useState(null);
  const [location, setLocation] = useState(null);
  const [helpCalls, setHelpCalls] = useState([]);
  const [safeStatus, setSafeStatus] = useState([]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Konum izni reddedildi');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const coords = loc.coords;
      setLocation(coords);
      setRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      const token = await AsyncStorage.getItem('token');

      try {
        const helpRes = await axios.get('http://10.196.232.32:5000/user/help-calls', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHelpCalls(helpRes.data.data || []);
      } catch (err) {
        console.warn('Help çağrısı alınamadı');
      }

      try {
        const safeRes = await axios.get('http://10.196.232.32:5000/user/safe-status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSafeStatus(safeRes.data.data || []);
      } catch (err) {
        console.warn('Güvendeyim verisi alınamadı');
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      {region ? (
        <MapView style={styles.map} region={region} showsUserLocation={true}>
          {helpCalls.map((call, index) => (
            <Marker
              key={`help-${index}`}
              coordinate={{ latitude: call.latitude, longitude: call.longitude }}
              pinColor="red"
              title="Yardım Çağrısı"
              description={call.message}
            />
          ))}

          {safeStatus.map((safe, index) => (
            <Marker
              key={`safe-${index}`}
              coordinate={{ latitude: safe.latitude, longitude: safe.longitude }}
              pinColor="green"
              title="Güvendeyim"
              description={safe.message || "Güvendeyim bildirimi"}
            />
          ))}
        </MapView>
      ) : (
        <Text style={styles.loading}>Harita yükleniyor...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: 18,
    padding: 20,
  },
});
