import { BlurView } from 'expo-blur';
import React from 'react';
import {
    DimensionValue,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface StandardModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  height?: DimensionValue;
  showBlur?: boolean;
}

export const StandardModal: React.FC<StandardModalProps> = ({
  visible,
  onClose,
  title,
  children,
  height = '75%',
  showBlur = true,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      {showBlur ? (
        <BlurView intensity={50} style={styles.blurContainer}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
          <View style={[styles.modalContent, { height }]}>
            <SafeAreaView style={styles.safeAreaContainer}>
              {/* Handle bar */}
              <View style={styles.handleBar} />
              
              {/* Title */}
              <Text style={styles.title}>{title}</Text>
              
              {/* Separator line */}
              <View style={styles.separator} />
              
              {/* Content */}
              <ScrollView 
                style={styles.contentContainer}
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            </SafeAreaView>
          </View>
        </BlurView>
      ) : (
        <View style={styles.standardContainer}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
          <View style={[styles.modalContent, { height }]}>
            <SafeAreaView style={styles.safeAreaContainer}>
              {/* Handle bar */}
              <View style={styles.handleBar} />
              
              {/* Title */}
              <Text style={styles.title}>{title}</Text>
              
              {/* Separator line */}
              <View style={styles.separator} />
              
              {/* Content */}
              <ScrollView 
                style={styles.contentContainer}
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            </SafeAreaView>
          </View>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  standardContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#181C24',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  safeAreaContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
  },
});
