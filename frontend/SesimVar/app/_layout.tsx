import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { View } from 'react-native';

export default function Layout() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  });

  if (!fontsLoaded) {
    // Basit bir boş ekran veya loading göstergesi dönebiliriz
    return <View />;
  }

  return <Slot />;
}
