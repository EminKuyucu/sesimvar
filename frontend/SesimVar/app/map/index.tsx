import axios from 'axios';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { Colors } from '../../theme/Colors';

// 🧩 Marker tipi tanımı
type MarkerItem = {
  id: number | string;
  latitude: number;
  longitude: number;
};

export default function MapScreen() {
  const [helpCalls, setHelpCalls] = useState<MarkerItem[]>([]);
  const [safeStatus, setSafeStatus] = useState<MarkerItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'help' | 'safe' | 'area'>('all');
  const [loading, setLoading] = useState(true);

  // 🟦 Toplanma alanları (şimdilik sabit veri)
  const assemblyAreas: MarkerItem[] = [
    { id: 'A1', latitude: 37.002, longitude: 35.322 },
    { id: 'A2', latitude: 37.005, longitude: 35.325 }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const helpRes = await axios.get('http://192.168.1.10:5000/help');
        const safeRes = await axios.get('http://192.168.1.10:5000/safe-status');

        setHelpCalls(helpRes.data);
        setSafeStatus(safeRes.data);
      } catch (err) {
        console.error('Veri çekme hatası:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const allMarkers = [
    ...helpCalls.map((item) => ({
      id: item.id,
      latitude: item.latitude,
      longitude: item.longitude,
      type: 'help',
    })),
    ...safeStatus.map((item) => ({
      id: item.id,
      latitude: item.latitude,
      longitude: item.longitude,
      type: 'safe',
    })),
    ...assemblyAreas.map((item) => ({
      id: item.id,
      latitude: item.latitude,
      longitude: item.longitude,
      type: 'area',
    })),
  ];

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
              latitude: 37.002,
              longitude: 35.322,
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
                    : Colors.info // 🟦 Toplanma alanı
                }
              />
            ))}
          </MapView>

          <View style={styles.filters}>
            <Text style={styles.filter} onPress={() => setSelectedFilter('all')}>Tümü</Text>
            <Text style={styles.filter} onPress={() => setSelectedFilter('help')}>Yardım</Text>
            <Text style={styles.filter} onPress={() => setSelectedFilter('safe')}>Güvende</Text>
            <Text style={styles.filter} onPress={() => setSelectedFilter('area')}>Toplanma</Text>
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
