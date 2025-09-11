import { useEffect } from 'react';
import mobileAds from 'react-native-google-mobile-ads';

export const useAdMobInitialization = () => {
  useEffect(() => {
    const initializeAdMob = async () => {
      try {
        // Initialiser AdMob
        await mobileAds().initialize();
        console.log('✅ AdMob initialisé avec succès');
        
        // Configuration pour le debugging en dev
        if (__DEV__) {
          // Configurer les appareils de test
          await mobileAds().setRequestConfiguration({
            testDeviceIdentifiers: ['EMULATOR'], // Ajouter des device IDs de test si nécessaire
          });
        }
      } catch (error) {
        console.error('🚫 Erreur lors de l\'initialisation AdMob:', error);
      }
    };

    initializeAdMob();
  }, []);
};
