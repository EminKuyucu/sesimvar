import { StyleSheet } from 'react-native';

import { Collapsible } from '../../components/Collapsible';
import { ExternalLink } from '../../components/ExternalLink';
import ParallaxScrollView from '../../components/ParallaxScrollView';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { IconSymbol } from '../../components/ui/IconSymbol';

export default function AboutScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">📱 SesimVar Uygulaması</ThemedText>
      </ThemedView>

      <ThemedText>
        Bu uygulama afet anında yardım çağrısı yapmanı, güvende olduğunu bildirmeni ve harita üzerinden toplanma alanlarını görmeni sağlar.
      </ThemedText>

      <Collapsible title="🚨 Yardım Çağrısı">
        <ThemedText>
          Uygulama anasayfasındaki butona basarak konumunla birlikte yardım çağrısı gönderebilirsin.
        </ThemedText>
      </Collapsible>

      <Collapsible title="✅ Güvendeyim Bildirimi">
        <ThemedText>
          Afet sonrası güvende olduğunu tek dokunuşla bildirebilirsin. Bu, yakınlarını bilgilendirir.
        </ThemedText>
      </Collapsible>

      <Collapsible title="🗺️ Harita & Toplanma Alanları">
        <ThemedText>
          Harita ekranından hem yardım çağrılarını hem de belirlenen toplanma alanlarını görebilirsin.
        </ThemedText>
      </Collapsible>

      <Collapsible title="📄 Yardım Dökümanı">
        <ThemedText>
          Daha fazla bilgi için aşağıdaki bağlantıya tıklayabilirsin:
        </ThemedText>
        <ExternalLink href="https://docs.sesimvar.app/kullanim">
          <ThemedText type="link">🔗 Yardım dökümanını görüntüle</ThemedText>
        </ExternalLink>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 20,
  },
});
