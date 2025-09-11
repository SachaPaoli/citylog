import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MockAdBannerProps {
  position?: 'top' | 'bottom';
}

export const MockAdBanner: React.FC<MockAdBannerProps> = ({ position = 'bottom' }) => {
  return (
    <View style={[
      styles.container, 
      position === 'bottom' ? styles.bottom : styles.top
    ]}>
      <View style={styles.adContent}>
        <Text style={styles.adText}>📱 Test Ad Banner</Text>
        <Text style={styles.adSubtext}>320x50 • ca-app-pub-test</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  bottom: {
    bottom: 0,
  },
  top: {
    top: 0,
  },
  adContent: {
    alignItems: 'center',
  },
  adText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  adSubtext: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
});
