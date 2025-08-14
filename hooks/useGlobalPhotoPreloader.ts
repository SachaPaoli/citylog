import { useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

// Cache global des photos de profil - disponible immédiatement
export const globalPhotoCache = new Map<string, string>();

let isPreloading = false;
let preloadingPromise: Promise<void> | null = null;

export const useGlobalPhotoPreloader = () => {
  useEffect(() => {
    const preloadAllUserPhotos = async () => {
      if (isPreloading || globalPhotoCache.size > 0) return;
      
      isPreloading = true;
      console.log('🚀 Pré-chargement global des photos utilisateurs...');

      try {
        // Récupérer tous les utilisateurs en une seule fois
        const usersSnapshot = await getDocs(collection(db, 'users'));
        
        usersSnapshot.forEach(doc => {
          const userData = doc.data();
          const photoURL = userData.photoURL || '';
          globalPhotoCache.set(doc.id, photoURL);
          console.log(`📸 Photo mise en cache pour ${userData.displayName || doc.id}: ${photoURL ? 'OUI' : 'NON'}`);
        });

        console.log(`✅ ${globalPhotoCache.size} photos pré-chargées dans le cache global`);
      } catch (error) {
        console.error('❌ Erreur lors du pré-chargement des photos:', error);
      } finally {
        isPreloading = false;
      }
    };

    // Démarrer le pré-chargement immédiatement
    if (!preloadingPromise) {
      preloadingPromise = preloadAllUserPhotos();
    }
  }, []);

  return { globalPhotoCache, isPreloading };
};

// Fonction utilitaire pour obtenir une photo instantanément
export const getInstantUserPhoto = (userId: string): string => {
  const photo = globalPhotoCache.get(userId) || '';
  console.log(`🔍 Recherche photo pour ${userId}: ${photo ? 'TROUVÉE' : 'MANQUANTE'}`);
  return photo;
};
