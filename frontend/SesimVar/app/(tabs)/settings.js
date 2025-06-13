import { useRouter } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ayarlar</Text>
      <Text style={styles.subtitle}>Kullanıcı ayarlarını buradan yönetin.</Text>

      <Button title="👤 Kullanıcı Bilgileri" onPress={() => router.push('/settings/profile')} />
      <Button title="🚑 Afet/Yardım Bilgileri" onPress={() => router.push('/settings/emergency')} />
      <Button title="🔔 Bildirim Ayarları" onPress={() => router.push('/settings/notifications')} />
      <Button title="⚙️ Hesap Ayarları" onPress={() => router.push('/settings/account')} />

      <View style={{ marginTop: 30 }}>
        <Button title="Çıkış Yap" color="#d32f2f" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
});
