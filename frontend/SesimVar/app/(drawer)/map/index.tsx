import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Callout, Circle, Marker } from 'react-native-maps';
import useAuthRedirect from '../../../hooks/useAuthRedirect';
import { Colors } from '../../../theme/colors';

type MarkerItem = {
  id: number | string;
  latitude: number;
  longitude: number;
  type?: 'help' | 'safe' | 'area' | 'address';
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
  const [userAddress, setUserAddress] = useState<MarkerItem | null>(null);
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

        const [helpRes, safeRes, addressRes] = await Promise.all([
          axios.get('http://10.196.232.32:5000/user/help-calls', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://10.196.232.32:5000/user/safe-status', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://10.196.232.32:5000/user/address', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const helpData = helpRes.data.map((item: any) => ({ ...item, type: 'help' as const }));
        const safeData = safeRes.data.map((item: any) => ({ ...item, type: 'safe' as const }));

        const addr = addressRes.data.data;
        const addressMarker: MarkerItem = {
          id: 'user-address',
          latitude: addr.latitude,
          longitude: addr.longitude,
          type: 'address',
          message: `${addr.neighborhood_name}, ${addr.street}`,
        };

        setHelpCalls(helpData);
        setSafeStatus(safeData);
        setUserAddress(addressMarker);
      } catch (err) {
        console.error('Veri çekme hatası:', err);
      }
    };

    const initialize = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return alert('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') throw new Error('Konum izni verilmedi');

        const loc = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };

        setUserLocation(coords);
        await AsyncStorage.setItem('lastLocation', JSON.stringify(coords));
      } catch (err) {
        console.error('Hata:', err); 
        console.warn('Canlı konum alınamadı, son konum gösterilecek.');
        const saved = await AsyncStorage.getItem('lastLocation');
        if (saved) {
          const coords = JSON.parse(saved);
          setUserLocation(coords);
        } else {
          setUserLocation({ latitude: 37.0, longitude: 35.3 });
        }
      } finally {
        await fetchData();
        intervalId = setInterval(fetchData, 30000);
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
          {userAddress && (
            <View style={styles.addressBar}>
              <Text style={styles.addressText}>
                📍 Adresiniz: {userAddress.message}
              </Text>
            </View>
          )}

          <MapView
            style={styles.map}
            initialRegion={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker
              coordinate={userLocation}
              pinColor="blue"
              title="Konumunuz"
              description="Şu anki konumunuz"
            />

            {userAddress && (
              <Marker
                coordinate={{
                  latitude: userAddress.latitude,
                  longitude: userAddress.longitude,
                }}
                pinColor="blue"
                title="Kayıtlı Adres"
                description={userAddress.message}
              >
                <Callout>
                  <View>
                    <Text style={{ fontWeight: 'bold' }}>📍 Kayıtlı Adres</Text>
                    <Text>{userAddress.message}</Text>
                  </View>
                </Callout>
              </Marker>
            )}

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
  addressBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    elevation: 4,
    zIndex: 10,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
});
