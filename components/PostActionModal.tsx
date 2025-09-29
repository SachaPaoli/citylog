import { BlurView } from 'expo-blur';
import React from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PostActionModalProps = {
  visible: boolean;
  onClose: () => void;
  onNewPost: () => void;
  onNewTrip: () => void;
};

export default function PostActionModal({ visible, onClose, onNewPost, onNewTrip }: PostActionModalProps) {
  const slideAnim = React.useRef(new Animated.Value(400)).current; // Start below screen

  // Animation for Modal
  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView style={styles.blurContainer} intensity={20} tint="dark">
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.topSeparator} />
          <View style={styles.modalHeader}>
            <View style={styles.modalIndicator} />
            <Text style={styles.modalTitle}>Choose an action</Text>
          </View>
          
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.option}
              onPress={onNewPost}
            >
              <View style={styles.optionIcon}>
                <Text style={styles.optionIconText}>📝</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>New post</Text>
                <Text style={styles.optionDescription}>
                  Share a single moment or experience
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.option}
              onPress={onNewTrip}
            >
              <View style={styles.optionIcon}>
                <Text style={styles.optionIconText}>🗺️</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>New trip</Text>
                <Text style={styles.optionDescription}>
                  Create a complete journey with multiple cities
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
  },
  modalContent: {
    height: '40%',
    backgroundColor: '#181C24',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 34,
  },
  topSeparator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionIconText: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
});