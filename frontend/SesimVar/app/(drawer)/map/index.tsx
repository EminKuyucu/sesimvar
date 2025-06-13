import axios from 'axios';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { Colors } from '../../theme/colors';
import useAuthRedirect from '../../../hooks/useAuthRedirect'; // 🔐 Token kontrolü

type MarkerItem = {
  id: number | string;
  latitude: number;
  longitude: number;
  type?: 'help' | 'safe' | 'area';
  created_at?: string;
  user?: {
    name: string;
    health_condition: string;
  };
};

export default function MapScreen() {
  useAuthRedirect(); // ⛔ Token yoksa login sayfasına yönlendir

  const [helpCalls, setHelpCalls] = useState<MarkerItem[]>([]);
  const [safeStatus, setSafeStatus] = useState<MarkerItem[]>([]);
  const [userLocation, setUserLocation] = useState({
    latitude: 37.0,
    longitude: 35.3,
  });
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'help' | 'safe' | 'area'
  >('all');
  const [loading, setLoading] = useState(true);

  const assemblyAreas: MarkerItem[] = [
    { id: 'A1', latitude: 37.002, longitude: 35.322, type: 'area' },
    { id: 'A2', latitude: 37.005, longitude: 35.325, type: 'area' },
  ];

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          alert('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
          return;
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          alert('Konum izni reddedildi');
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        const helpRes = await axios.get('http://10.196.232.32:5000/user/help-calls', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const safeRes = await axios.get('http://10.196.232.32:5000/user/safe-status', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const helpData = helpRes.data.map((item: any) => ({
          ...item,
          type: 'help' as const,
        }));

        const safeData = safeRes.data.map((item: any) => ({
          ...item,
          type: 'safe' as const,
        }));

        setHelpCalls(helpData);
        setSafeStatus(safeData);
      } catch (err) {
        console.error('Veri çekme hatası:', err);
        alert('Veriler alınamadı. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const calculateMinutesAgo = (timestamp: string) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now.getTime() - created.getTime();
    return Math.floor(diffMs / 60000);
  };

  const allMarkers = [...helpCalls, ...safeStatus, ...assemblyAreas];

  const filteredMarkers = allMarkers.filter((m) =>
    selectedFilter === 'all' ? true : m.type === selectedFilter
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.info} style={{ flex: 1 }} />
      ) : (
        <>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {filteredMarkers.map((marker) => (
              <Marker
                key={marker.id}
                coordinate={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                }}
                pinColor={
                  marker.type === 'help'
                    ? Colors.primary
                    : marker.type === 'safe'
                    ? Colors.safe
                    : Colors.info
                }
              >
                {marker.type === 'help' && marker.user && (
                  <Callout>
                    <View style={{ maxWidth: 200 }}>
                      <Text style={{ fontWeight: 'bold' }}>
                        👤 {marker.user.name}
                      </Text>
                      <Text>❤️ {marker.user.health_condition}</Text>
                      <Text>
                        ⏱️ {calculateMinutesAgo(marker.created_at!)} dk önce
                      </Text>
                    </View>
                  </Callout>
                )}
              </Marker>
            ))}
          </MapView>

          <View style={styles.filters}>
            <Text style={styles.filter} onPress={() => setSelectedFilter('all')}>
              Tümü
            </Text>
            <Text style={styles.filter} onPress={() => setSelectedFilter('help')}>
              Yardım
            </Text>
            <Text style={styles.filter} onPress={() => setSelectedFilter('safe')}>
              Güvende
            </Text>
            <Text style={styles.filter} onPress={() => setSelectedFilter('area')}>
              Toplanma
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  filters: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.gray,
    padding: 10,
    borderRadius: 10,
    elevation: 5,
  },
  filter: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
});
