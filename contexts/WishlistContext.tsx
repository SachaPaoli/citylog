import { Post } from '@/types/Post';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface WishlistContextType {
  wishlist: Post[];
  addToWishlist: (post: Post) => void;
  removeFromWishlist: (postId: string) => void;
  isInWishlist: (postId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<Post[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('wishlist').then(data => {
      if (data) setWishlist(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (post: Post) => {
    setWishlist(prev => {
      if (prev.find(p => p.id === post.id)) return prev;
      return [...prev, post];
    });
  };

  const removeFromWishlist = (postId: string) => {
    setWishlist(prev => prev.filter(p => p.id !== postId));
  };

  const isInWishlist = (postId: string) => {
    return wishlist.some(p => p.id === postId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
};
