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
import MapView, { Callout, Marker, Circle } from 'react-native-maps';
import { Colors } from '../../theme/colors';
import useAuthRedirect from '../../../hooks/useAuthRedirect';

type MarkerItem = {
  id: number | string;
  latitude: number;
  longitude: number;
  type?: 'help' | 'safe' | 'area';
  created_at?: string;
  message?: string;
  user?: {
    name: string;
    health_condition: string;
  };
};

export default function MapScreen() {
  useAuthRedirect();

  const [helpCalls, setHelpCalls] = useState<MarkerItem[]>([]);
  const [safeStatus, setSafeStatus] = useState<MarkerItem[]>([]);
  const [userLocation, setUserLocation] = useState({ latitude: 37.0, longitude: 35.3 });
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'help' | 'safe' | 'area'>('all');

  const assemblyAreas: MarkerItem[] = [
    { id: 'A1', latitude: 37.002, longitude: 35.322, type: 'area' },
    { id: 'A2', latitude: 37.005, longitude: 35.325, type: 'area' },
  ];

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const [helpRes, safeRes] = await Promise.all([
          axios.get('http://10.196.232.32:5000/user/help-calls', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://10.196.232.32:5000/user/safe-status', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const helpData = helpRes.data.map((item: any) => ({ ...item, type: 'help' as const }));
        const safeData = safeRes.data.map((item: any) => ({ ...item, type: 'safe' as const }));

        setHelpCalls(helpData);
        setSafeStatus(safeData);
      } catch (err) {
        console.error('Otomatik veri çekme hatası:', err);
      }
    };

    const initialize = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return alert('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return alert('Konum izni verilmedi.');

        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });

        await fetchData();
        intervalId = setInterval(fetchData, 30000);
      } catch (err) {
        console.error('İlk veri çekme hatası:', err);
        alert('Veriler alınamadı.');
      } finally {
        setLoading(false);
      }
    };

    initialize();

    return () => clearInterval(intervalId);
  }, []);

  const calculateMinutesAgo = (timestamp: string) => {
    const now = new Date();
    const created = new Date(timestamp);
    return Math.floor((now.getTime() - created.getTime()) / 60000);
  };

  const allMarkers = [...helpCalls, ...safeStatus, ...assemblyAreas];

  const filteredMarkers = allMarkers.filter((marker) =>
    selectedFilter === 'all' ? true : marker.type === selectedFilter
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
            {/* Kullanıcı konumu */}
            <Marker
              coordinate={userLocation}
              pinColor="blue"
              title="Konumunuz"
              description="Şu anki konumunuz"
            />

            {/* Markerlar */}
            {filteredMarkers.map((marker) => (
              <Marker
                key={marker.id}
                coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                pinColor={
                  marker.type === 'help'
                    ? Colors.primary
                    : marker.type === 'safe'
                    ? Colors.safe
                    : Colors.info
                }
              >
                {(marker.type === 'help' || marker.type === 'safe') && (
                  <Callout>
                    <View style={{ maxWidth: 220 }}>
                      {marker.user && (
                        <>
                          <Text style={{ fontWeight: 'bold' }}>👤 {marker.user.name}</Text>
                          <Text>❤️ {marker.user.health_condition}</Text>
                        </>
                      )}
                      {marker.message && <Text>🆘 Mesaj: {marker.message}</Text>}
                      {marker.created_at && (
                        <Text>⏱️ {calculateMinutesAgo(marker.created_at)} dk önce</Text>
                      )}
                    </View>
                  </Callout>
                )}
              </Marker>
            ))}

            {/* Toplanma alanı daireleri */}
            {assemblyAreas.map((area) => (
              <Circle
                key={`circle-${area.id}`}
                center={{ latitude: area.latitude, longitude: area.longitude }}
                radius={150}
                strokeColor="#2E7D32"
                fillColor="rgba(76, 175, 80, 0.2)"
              />
            ))}
          </MapView>

          {/* Filtreler */}
          <View style={styles.filters}>
            {['all', 'help', 'safe', 'area'].map((type) => (
              <Text
                key={type}
                style={[
                  styles.filter,
                  selectedFilter === type && { textDecorationLine: 'underline' },
                ]}
                onPress={() => setSelectedFilter(type as any)}
              >
                {type === 'all'
                  ? 'Tümü'
                  : type === 'help'
                  ? 'Yardım'
                  : type === 'safe'
                  ? 'Güvende'
                  : 'Toplanma'}
              </Text>
            ))}
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
