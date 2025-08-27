import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';

type PostActionModalProps = {
  visible: boolean;
  onClose: () => void;
  onNewPost: () => void;
  onNewTrip: () => void;
};

export default function PostActionModal({ visible, onClose, onNewPost, onNewTrip }: PostActionModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.bottomModalOverlay}>
        <View style={styles.bottomModalContent}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Choose an action</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={onNewPost}>
              <Text style={styles.buttonText}>New post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onNewTrip}>
              <Text style={styles.buttonText}>New trip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bottomModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(24,28,36,0.7)',
  },
  bottomModalContent: {
    width: '100%',
    height: '40%',
    backgroundColor: '#181C24',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 16,
    position: 'relative',
  },
  cancelButton: {
    position: 'absolute',
    top: 16,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    marginTop: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#5784BA',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginHorizontal: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});