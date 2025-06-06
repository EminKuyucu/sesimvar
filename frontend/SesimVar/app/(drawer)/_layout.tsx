import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  DrawerContentScrollView,
  DrawerItemList
} from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

function CustomDrawerContent(props) {
  const [fullName, setFullName] = useState('Yükleniyor...');

  useEffect(() => {
    const loadUser = async () => {
      const name = await AsyncStorage.getItem('full_name');
      if (name) setFullName(name);
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
