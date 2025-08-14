import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';

// Cache global des photos de profil
const photoCache = new Map<string, string>();
const loadingCache = new Set<string>();

export const useUserPhotoCache = (userId: string) => {
  const [userPhoto, setUserPhoto] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setUserPhoto('');
      return;
    }

    // Si on a déjà la photo en cache, l'utiliser directement
    if (photoCache.has(userId)) {
      setUserPhoto(photoCache.get(userId) || '');
      setLoading(false);
      return;
    }

    // Si on est déjà en train de charger cette photo, attendre
    if (loadingCache.has(userId)) {
      setLoading(true);
      // Attendre que le chargement soit terminé
      const checkCache = setInterval(() => {
        if (photoCache.has(userId)) {
          setUserPhoto(photoCache.get(userId) || '');
          setLoading(false);
          clearInterval(checkCache);
        }
      }, 100);
      return () => clearInterval(checkCache);
    }

    // Sinon, charger la photo
    const fetchUserPhoto = async () => {
      setLoading(true);
      loadingCache.add(userId);
      
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const photoURL = userData.photoURL || '';
          
          // Mettre en cache
          photoCache.set(userId, photoURL);
          setUserPhoto(photoURL);
        } else {
          photoCache.set(userId, '');
          setUserPhoto('');
        }
      } catch (error) {
        console.error('useUserPhotoCache - Erreur lors de la récupération:', error);
        photoCache.set(userId, '');
        setUserPhoto('');
      } finally {
        setLoading(false);
        loadingCache.delete(userId);
      }
    };

    fetchUserPhoto();
  }, [userId]);

  return { userPhoto, loading };
};
