import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../theme/Colors';

export default function SettingsMenuScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ayarlar</Text>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/settings/profile')}>
        <Text style={styles.cardText}>👤 Kullanıcı Bilgileri</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/settings/emergency')}>
        <Text style={styles.cardText}>🚑 Afet/Yardım Bilgileri</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/settings/notifications')}>
        <Text style={styles.cardText}>🔔 Bildirimler</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/settings/account')}>
        <Text style={styles.cardText}>🧾 Hesap Ayarları</Text>
      </TouchableOpacity>
    </View>
  );
}

SettingsMenuScreen.options = {
  title: 'Ayarlar',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.text,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.safe,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
