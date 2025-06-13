import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import useAuthRedirect from '../../hooks/useAuthRedirect'; // 🔐

function CustomDrawerContent(props) {
  const [fullName, setFullName] = useState<string>('Yükleniyor...');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const name = await AsyncStorage.getItem('full_name');
        if (name) {
          setFullName(name);
        } else {
          setFullName('Bilinmeyen Kullanıcı');
        }
      } catch (error) {
        console.error('Kullanıcı adı alınamadı:', error);
        setFullName('Hata oluştu');
      }
    };

    loadUser();
  }, []);

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Text style={styles.name}>{fullName}</Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  useAuthRedirect(); // 🔐 token yoksa login'e yönlendir

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: '#1976D2' },
          headerTintColor: '#fff',
          drawerActiveTintColor: '#1976D2',
          drawerLabelStyle: { fontSize: 16 },
        }}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: '#E3F2FD',
    borderBottomColor: '#1976D2',
    borderBottomWidth: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
});
