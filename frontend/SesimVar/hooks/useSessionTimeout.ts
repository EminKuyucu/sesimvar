import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { AppState } from 'react-native';

export function useSessionTimeout(timeoutMs = 15 * 60 * 1000) {
  const router = useRouter();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const startTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('full_name');
        router.replace('/login');
      }, timeoutMs);
    };

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        startTimeout(); // Uygulama yeniden aktif olduysa süreyi başlat
      }
    });

    startTimeout(); // Başlangıçta başlat

    return () => {
      clearTimeout(timeout);
      subscription.remove();
    };
  }, []);
}
