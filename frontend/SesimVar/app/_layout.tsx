import AppLoading from 'expo-app-loading';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';

export default function Layout() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return <Slot />;
}
