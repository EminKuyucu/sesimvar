import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../app/theme/Colors';


export default function Card({ icon, text, color, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Ionicons name={icon} size={36} color={color ?? Colors.primary} />
      <Text style={styles.cardText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.gray,
    padding: 20,
    borderRadius: 15,
    elevation: 4,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 16,
    color: Colors.text,
  },
});
