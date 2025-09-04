import { Post } from '@/types/Post';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

interface WishlistContextType {
  wishlist: Post[];
  addToWishlist: (post: Post) => void;
  removeFromWishlist: (postId: string) => void;
  isInWishlist: (postId: string) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Utiliser useAuth de manière sécurisée
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext.user;
  } catch (error) {
    // L'AuthProvider n'est pas encore prêt, on utilisera null
    console.log('🔄 WishlistProvider: AuthProvider not ready yet');
  }

  // Fallback : charger depuis AsyncStorage (pour migration)
  const loadWishlistFromLocal = async () => {
    try {
      const data = await AsyncStorage.getItem('wishlist');
      if (data) {
        const localWishlist = JSON.parse(data);
        setWishlist(localWishlist);
        
        // Migrer vers Firestore si utilisateur connecté
        if (user && localWishlist.length > 0) {
          await migrateLocalWishlistToFirestore(localWishlist);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement wishlist locale:', error);
      setLoading(false);
    }
  };

  // Migrer la wishlist locale vers Firestore
  const migrateLocalWishlistToFirestore = async (localWishlist: Post[]) => {
    try {
      const userRef = doc(db, 'users', user!.uid);
      const postIds = localWishlist.map(post => post.id);
      
      await updateDoc(userRef, {
        wishlist: arrayUnion(...postIds)
      });
      
      // Supprimer la wishlist locale après migration
      await AsyncStorage.removeItem('wishlist');
      console.log('✅ Wishlist migrée vers Firestore');
    } catch (error) {
      console.error('Erreur migration wishlist:', error);
    }
  };

  useEffect(() => {
    if (user) {
      // Surveiller les changements en temps réel sur Firestore
      const userRef = doc(db, 'users', user.uid);
      
      const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          const wishlistPostIds = userData.wishlist || [];
          
          console.log('🔄 WishlistContext: Mise à jour temps réel de la wishlist:', wishlistPostIds.length, 'posts');
          
          // Pour l'instant, on stocke juste les IDs et on récupère les posts à la demande
          setWishlist(wishlistPostIds.map((id: string) => ({ id } as Post)));
        } else {
          setWishlist([]);
        }
        setLoading(false);
      }, (error) => {
        console.error('Erreur listener wishlist:', error);
        // Fallback sur AsyncStorage en cas d'erreur
        loadWishlistFromLocal();
      });
      
      return unsubscribe; // Cleanup listener
    } else {
      loadWishlistFromLocal();
    }
  }, [user]);

  const addToWishlist = async (post: Post) => {
    if (!user) {
      // Mode offline : AsyncStorage
      setWishlist(prev => {
        if (prev.find(p => p.id === post.id)) return prev;
        const newWishlist = [...prev, post];
        AsyncStorage.setItem('wishlist', JSON.stringify(newWishlist));
        return newWishlist;
      });
      return;
    }

    try {
      // Mode online : Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        wishlist: arrayUnion(post.id)
      });
      
      setWishlist(prev => {
        if (prev.find(p => p.id === post.id)) return prev;
        return [...prev, post];
      });
    } catch (error) {
      console.error('Erreur ajout wishlist:', error);
    }
  };

  const removeFromWishlist = async (postId: string) => {
    if (!user) {
      // Mode offline : AsyncStorage
      setWishlist(prev => {
        const newWishlist = prev.filter(p => p.id !== postId);
        AsyncStorage.setItem('wishlist', JSON.stringify(newWishlist));
        return newWishlist;
      });
      return;
    }

    try {
      // Mode online : Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        wishlist: arrayRemove(postId)
      });
      
      setWishlist(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Erreur suppression wishlist:', error);
    }
  };

  const isInWishlist = (postId: string) => {
    return wishlist.some(p => p.id === postId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
};
