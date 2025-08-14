import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';

export const useUserPhoto = (userId: string) => {
  const [userPhoto, setUserPhoto] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setUserPhoto('');
      return;
    }

    const fetchUserPhoto = async () => {
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserPhoto(userData.photoURL || '');
        } else {
          setUserPhoto('');
        }
      } catch (error) {
        console.error('useUserPhoto - Erreur lors de la récupération:', error);
        setUserPhoto('');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPhoto();
  }, [userId]);

  return { userPhoto, loading };
};
