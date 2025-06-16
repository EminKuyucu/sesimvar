import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import useAuthRedirect from '../../../hooks/useAuthRedirect';
import { Colors } from '../../theme/colors';

export default function SettingsMenuScreen() {
  useAuthRedirect();
  const router = useRouter();

  const menuItems = [
    { label: '👤 Kullanıcı Bilgileri', path: '/settings/profile' },
    { label: '🚑 Afet/Yardım Bilgileri', path: '/settings/emergency' },
    { label: '🔔 Bildirimler', path: '/settings/notifications' },
    { label: '🧾 Hesap Ayarları', path: '/settings/account' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Ayarlar</Text>

      {menuItems.map((item, index) => (
        <MenuItem key={index} label={item.label} onPress={() => router.push(item.path)} />
      ))}
    </View>
  );
}

function MenuItem({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.cardText}>{label}</Text>
    </TouchableOpacity>
  );
}

SettingsMenuScreen.options = {
  title: 'Ayarlar',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    color: Colors.text,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.safe,
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
