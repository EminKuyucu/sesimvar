import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

type Entry = {
  building_age: number;
  building_floors: number;
  damage_status: string;
  infrastructure_issues: string;
  helper_roles: string[];
};

type Neighborhood = {
  id: number;
  name: string;
  city: string;
  district: string;
};

export default function NeighborhoodDetailScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [riskScore, setRiskScore] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res1 = await axios.get(`http://192.168.1.73:5000/neighborhoods/${id}`);
        setNeighborhood(res1.data.neighborhood);
        setEntries(res1.data.entries);

        const res2 = await axios.get(`http://192.168.1.73:5000/neighborhoods/${id}/risk-score`);
        setRiskScore(res2.data.score);
      } catch (error) {
        console.error('Detay alma hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getAverage = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const damageCount = entries.filter(e => e.damage_status !== 'Yok').length;
  const damageRate = entries.length > 0 ? (damageCount / entries.length) * 100 : 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <>
          <Text style={styles.title}>{neighborhood?.name} / {neighborhood?.district}</Text>
          <Text style={styles.info}>Şehir: {neighborhood?.city}</Text>
          <Text style={styles.info}>Giriş Sayısı: {entries.length}</Text>
          <Text style={styles.info}>Ortalama Bina Yaşı: {getAverage(entries.map(e => e.building_age)).toFixed(1)}</Text>
          <Text style={styles.info}>Ortalama Kat Sayısı: {getAverage(entries.map(e => e.building_floors)).toFixed(1)}</Text>
          <Text style={styles.info}>Hasar Oranı: %{damageRate.toFixed(1)}</Text>
          <Text style={styles.score}>Risk Skoru: {riskScore !== null ? riskScore : 'Hesaplanamadı'}</Text>

          <Text style={styles.subTitle}>Girişler:</Text>
          {entries.map((entry, idx) => (
            <View key={idx} style={styles.entryBox}>
              <Text>Kat: {entry.building_floors} | Yaş: {entry.building_age}</Text>
              <Text>Hasar: {entry.damage_status}</Text>
              <Text>Tesisat Sorunları: {entry.infrastructure_issues || '-'}</Text>
              <Text>Yardımcı Roller: {entry.helper_roles?.join(', ') || '-'}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  subTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  info: { fontSize: 15, marginBottom: 4 },
  score: { fontSize: 16, fontWeight: 'bold', marginVertical: 10, color: '#b30000' },
  entryBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
});
