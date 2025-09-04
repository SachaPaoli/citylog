import { router } from 'expo-router';
import { User, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';

// Types
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  profileImage?: string;
  photoURL?: string;
  createdAt: Date;
  visitedCities: string[];
  totalTrips: number;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

// Contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('🔐 AuthProvider: Component mounted');

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    console.log('🔐 AuthProvider: Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 AuthProvider: Auth state changed, user:', user ? 'LOGGED IN' : 'LOGGED OUT');
      setUser(user);
      
      if (user) {
        console.log('🔐 AuthProvider: User logged in, loading profile...');
        // Récupérer le profil utilisateur depuis Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          console.log('🔐 AuthProvider: User profile loaded from Firestore');
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          console.log('🔐 AuthProvider: No user profile found in Firestore');
        }
        
        // Rediriger vers l'app principale si l'utilisateur est connecté
        console.log('🔐 AuthProvider: Redirecting to main app');
        router.replace('/(tabs)/' as any);
      } else {
        console.log('🔐 AuthProvider: No user, clearing profile');
        setUserProfile(null);
        // Rediriger vers la connexion si pas d'utilisateur
        console.log('🔐 AuthProvider: Redirecting to login');
        router.replace('/auth/login' as any);
      }
      
      console.log('🔐 AuthProvider: Setting loading to false');
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Connexion
  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Inscription
  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    // Mettre à jour le profil Firebase Auth
    await updateProfile(newUser, { displayName });

    // Créer le profil utilisateur dans Firestore
    const userProfile: UserProfile = {
      uid: newUser.uid,
      email: newUser.email!,
      displayName,
      username,
      createdAt: new Date(),
      visitedCities: [],
      totalTrips: 0,
    };

    await setDoc(doc(db, 'users', newUser.uid), userProfile);
    setUserProfile(userProfile);
  };

  // Déconnexion
  const logout = async () => {
    await signOut(auth);
  };

  // Mettre à jour le profil utilisateur
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) {
      throw new Error('Aucun utilisateur connecté');
    }

    try {
      // Si on change la photo de profil, supprimer l'ancienne de Firebase Storage
      if (updates.photoURL && userProfile.photoURL && updates.photoURL !== userProfile.photoURL) {
        try {
          console.log('🗑️ Suppression de l\'ancienne photo de profil...');
          const { FirebaseStorageService } = await import('../services/FirebaseStorageService');
          await FirebaseStorageService.deleteImage(userProfile.photoURL);
          console.log('✅ Ancienne photo de profil supprimée');
        } catch (error) {
          console.warn('⚠️ Erreur suppression ancienne photo de profil:', error);
          // On continue même si la suppression échoue
        }
      }

      // Mettre à jour le profil Firebase Auth si nécessaire
      if (updates.displayName) {
        await updateProfile(user, { 
          displayName: updates.displayName,
          photoURL: updates.photoURL 
        });
      }

      // Mettre à jour le profil dans Firestore
      const updatedProfile = { ...userProfile, ...updates };
      await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });
      
      // Mettre à jour l'état local
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
