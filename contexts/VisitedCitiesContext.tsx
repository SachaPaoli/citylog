import { getAuth } from 'firebase/auth';
import { arrayRemove, arrayUnion, doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type VisitedCity = {
  id: string;
  name: string;
  country: string;
  flag: string;
  rating?: number;
  beenThere: boolean;
  source?: 'post' | 'note';
};

type VisitedCitiesContextType = {
  cities: VisitedCity[];
  addOrUpdateCity: (city: Omit<VisitedCity, 'id'>) => Promise<void>;
  removeCity: (name: string, country: string) => Promise<void>;
};

const VisitedCitiesContext = createContext<VisitedCitiesContextType | undefined>(undefined);

export function VisitedCitiesProvider({ children }: { children: ReactNode }) {
  const [cities, setCities] = useState<VisitedCity[]>([]);
  const db = getFirestore();
  const auth = getAuth();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    async function fetchCities() {
      if (!userId) return;
      const ref = doc(db, 'users', userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setCities((data.visitedCities || []).map((c: any) => ({ ...c, id: `${c.name}-${c.country}` })));
      } else {
        setCities([]);
      }
    }
    fetchCities();
  }, [userId, db]);

  const addOrUpdateCity = async (city: Omit<VisitedCity, 'id'>) => {
    if (!userId) return;
    const id = `${city.name}-${city.country}`;
    const cityObj = { ...city, id };
    setCities(prev => {
      const existing = prev.find(c => c.id === id);
      if ((city.rating === undefined || city.rating === null) && !city.beenThere) {
        return prev.filter(c => c.id !== id);
      }
      if (existing) {
        return prev.map(c => c.id === id ? { ...c, ...city, id } : c);
      } else {
        return [...prev, cityObj];
      }
    });
    const ref = doc(db, 'users', userId);
    if ((city.rating === undefined || city.rating === null) && !city.beenThere) {
      // Pour arrayRemove, il faut passer l'objet complet qui était dans Firestore
      await updateDoc(ref, {
        visitedCities: arrayRemove(cityObj)
      });
    } else {
      await updateDoc(ref, {
        visitedCities: arrayUnion(cityObj)
      });
    }
  };

  const removeCity = async (name: string, country: string) => {
    if (!userId) return;
    const id = `${name}-${country}`;
    setCities(prev => prev.filter(c => c.id !== id));
    const ref = doc(db, 'users', userId);
    // On doit retrouver l'objet complet pour arrayRemove
    const cityToRemove = cities.find(c => c.id === id);
    if (cityToRemove) {
      await updateDoc(ref, {
        visitedCities: arrayRemove(cityToRemove)
      });
    }
  };

  return (
    <VisitedCitiesContext.Provider value={{ cities, addOrUpdateCity, removeCity }}>
      {children}
    </VisitedCitiesContext.Provider>
  );
}

export function useVisitedCities() {
  const ctx = useContext(VisitedCitiesContext);
  if (!ctx) throw new Error('useVisitedCities must be used within VisitedCitiesProvider');
  return ctx;
}