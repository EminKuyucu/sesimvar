import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

type Neighborhood = {
  id: number;
  name: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
};

export default function MapScreen() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        const res = await axios.get('http://192.168.1.73:5000/neighborhoods');
        setNeighborhoods(res.data);
      } catch (err) {
        console.error('Mahalle alma hatası:', err);
        Alert.alert('Hata', 'Mahalle verileri alınamadı.');
      } finally {
        setLoading(false);
      }
    };

    fetchNeighborhoods();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="blue" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: neighborhoods[0]?.latitude || 37.0,
          longitude: neighborhoods[0]?.longitude || 35.0,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {neighborhoods.map((n) => (
          <Marker
            key={n.id}
            coordinate={{ latitude: n.latitude, longitude: n.longitude }}
            title={n.name}
            description={`${n.district} / ${n.city}`}
            onPress={() => router.push(`/neighborhood/${n.id}`)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
