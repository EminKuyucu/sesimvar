import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        router.replace('/(drawer)/home'); // Giriş yapılmışsa home ekranına gönder
      } else {
        router.replace('/login'); // Giriş yapılmamışsa login ekranına gönder
      }
    };

    checkLogin();
  }, []);

  return null;
}
