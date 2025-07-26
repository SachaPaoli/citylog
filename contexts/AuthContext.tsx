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
}

// Contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Récupérer le profil utilisateur depuis Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }
        
        // Rediriger vers l'app principale si l'utilisateur est connecté
        router.replace('/(tabs)/' as any);
      } else {
        setUserProfile(null);
        // Rediriger vers la connexion si pas d'utilisateur
        router.replace('/auth/login' as any);
      }
      
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

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
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
