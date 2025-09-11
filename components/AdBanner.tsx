import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

interface AdBannerProps {
  style?: any;
  position?: 'top' | 'bottom';
}

export const AdBanner: React.FC<AdBannerProps> = ({ style, position = 'bottom' }) => {
  // Utiliser l'ID de test pour banner
  const adUnitId = __DEV__ ? TestIds.BANNER : Platform.select({
    ios: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy', // Remplace par ton vrai ID iOS
    android: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy', // Remplace par ton vrai ID Android
  });

  return (
    <View style={[
      styles.container, 
      position === 'bottom' ? styles.bottom : styles.top,
      style
    ]}>
      <BannerAd
        unitId={adUnitId!}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log('✅ Bannière AdMob chargée avec succès');
        }}
        onAdFailedToLoad={(error) => {
          console.log('🚫 Erreur bannière AdMob:', error);
        }}
        onAdOpened={() => {
          console.log('📱 Bannière AdMob ouverte');
        }}
        onAdClosed={() => {
          console.log('📱 Bannière AdMob fermée');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // Fond léger pour distinguer la pub
    paddingVertical: 5,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
