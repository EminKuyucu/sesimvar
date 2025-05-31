<<<<<<< HEAD
import AppLoading from 'expo-app-loading';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
=======
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { View } from 'react-native';
>>>>>>> 0dec2d403574d0f9f7cf255f68d04a7ed5f95887

export default function Layout() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  });

  if (!fontsLoaded) {
<<<<<<< HEAD
    return <AppLoading />;
=======
    // Basit bir boş ekran veya loading göstergesi dönebiliriz
    return <View />;
>>>>>>> 0dec2d403574d0f9f7cf255f68d04a7ed5f95887
  }

  return <Slot />;
}
