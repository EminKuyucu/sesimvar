 import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { Text, View } from 'react-native';

export default function Layout() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  }); 

  console.log('🟡 fontsLoaded:', fontsLoaded); // DEBUG SATIRI

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  } 

  return <Slot />;
}
