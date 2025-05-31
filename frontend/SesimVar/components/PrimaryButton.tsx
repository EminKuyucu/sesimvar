import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';

export default function PrimaryButton({ title, onPress, color = Colors.primary }) {
  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.gray,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
