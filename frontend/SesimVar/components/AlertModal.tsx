import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../app/theme/Colors';


export default function AlertModal({ visible, message, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Tamam</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: Colors.gray,
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  message: {
    fontSize: 16,
    marginBottom: 15,
    color: Colors.text,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeText: {
    color: Colors.gray,
    fontWeight: 'bold',
  },
});
