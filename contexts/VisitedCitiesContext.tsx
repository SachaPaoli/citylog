import { getAuth } from 'firebase/auth';
import { arrayRemove, arrayUnion, doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type VisitedCity = {
  id: string;
  name: string;
  city?: string; // Ajouté pour permettre le filtrage robuste
  country: string;
  flag: string;
  rating?: number;
  beenThere: boolean;
  source?: 'post' | 'note';
  postId?: string; // Ajouté pour lier à un post précis
};

type VisitedCitiesContextType = {
  cities: VisitedCity[];
  addOrUpdateCity: (city: Omit<VisitedCity, 'id'>) => Promise<void>;
  removeCity: (name: string, country: string) => Promise<void>;
  removeCitySource: (name: string, country: string, source: 'post' | 'note', postId?: string) => Promise<void>;
};

const VisitedCitiesContext = createContext<VisitedCitiesContextType | undefined>(undefined);

export function VisitedCitiesProvider({ children }: { children: ReactNode }) {
  // Supprime uniquement une source spécifique pour une ville (ex: 'post')
  // Always normalize and clean visitedCities before any operation
  const normalizeCity = (c: any): VisitedCity | null => {
    const name = c.name || c.city;
    if (!name || !c.country) return null;
    return {
      ...c,
      name,
      id: `${name}-${c.country}`,
    };
  };

  const removeCitySource = async (name: string, country: string, source: 'post' | 'note', postId?: string) => {
    if (!userId) return;
    const ref = doc(db, 'users', userId);
    const snap = await getDoc(ref);
    let cityToRemove: VisitedCity | undefined;
    if (snap.exists()) {
      const data = snap.data();
      const visitedCitiesArr: VisitedCity[] = (data.visitedCities || []).map(normalizeCity).filter((c: VisitedCity | null): c is VisitedCity => !!c);
      cityToRemove = visitedCitiesArr.find((c: VisitedCity) =>
        ((c.name === name || c.city === name) &&
         c.country === country &&
         c.source === source &&
         (postId === undefined || c.postId === postId))
      );
      console.log('[removeCitySource] Before updateDoc, cityToRemove:', cityToRemove);
      if (cityToRemove) {
        await updateDoc(ref, {
          visitedCities: arrayRemove(cityToRemove)
        });
        console.log('[removeCitySource] Called arrayRemove for:', cityToRemove);
      } else {
        console.log('[removeCitySource] No matching city found to remove.');
      }
      // Clean up malformed entries directly in Firestore
      const snapAfter = await getDoc(ref);
      if (snapAfter.exists()) {
        const dataAfter = snapAfter.data();
        const rawArr = dataAfter.visitedCities || [];
        console.log('[removeCitySource] Raw visitedCities after removal:', rawArr);
        const cleanedArr = rawArr.filter((c: any) => typeof (c.name || c.city) === 'string' && (c.name || c.city).length > 0 && typeof c.country === 'string' && c.country.length > 0 && typeof (c.id || ((c.name || c.city) + '-' + c.country)) === 'string');
        if (cleanedArr.length !== rawArr.length) {
          await updateDoc(ref, { visitedCities: cleanedArr });
          console.log('[removeCitySource] Cleaned malformed entries, new visitedCities:', cleanedArr);
        }
      } else {
        console.log('[removeCitySource] User doc missing after removal.');
      }
    } else {
      console.log('[removeCitySource] User doc missing.');
    }
  };
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
    // Real-time Firestore listener for visitedCities
    if (!userId) return;
    const ref = doc(db, 'users', userId);
    const { onSnapshot } = require('firebase/firestore');
    const unsubscribe = onSnapshot(ref, (snap: any) => {
      if (snap.exists()) {
        const data = snap.data();
        // Clean and normalize all entries
        const cleaned: VisitedCity[] = (data.visitedCities || []).map(normalizeCity).filter((c: VisitedCity | null): c is VisitedCity => !!c);
        // Remove duplicates
        const seen = new Set<string>();
        const deduped: VisitedCity[] = cleaned.filter((c: VisitedCity) => {
          const key = `${c.id}-${c.source || ''}-${c.postId || ''}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setCities(deduped);
        console.log('[VisitedCitiesContext] Real-time Firestore update:', deduped);
      } else {
        setCities([]);
        console.log('[VisitedCitiesContext] Real-time Firestore update: user doc missing, setCities([])');
      }
    });
    return () => unsubscribe();
  }, [userId, db]);

  const addOrUpdateCity = async (city: Omit<VisitedCity, 'id'>) => {
    if (!userId) return;
    // Always normalize
    const name = city.name || city.city;
    if (!name || !city.country) return;
    const id = `${name}-${city.country}`;
    const cityObj: VisitedCity = { ...city, name, id };
    console.log('[addOrUpdateCity] Called with:', city);
    console.log('[addOrUpdateCity] Created cityObj:', cityObj);
    const ref = doc(db, 'users', userId);
    // Remove any previous manual note for this city (source 'note')
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const arr: VisitedCity[] = (snap.data().visitedCities || []).map(normalizeCity).filter((c: VisitedCity | null): c is VisitedCity => !!c);
      const manualNote = arr.find(c => (c.name === name || c.city === name) && c.country === city.country && c.source === 'note');
      if (manualNote) {
        console.log('[addOrUpdateCity] Removing previous manual note:', manualNote);
        await updateDoc(ref, { visitedCities: arrayRemove(manualNote) });
      }
    }
    // Add or update the city
    if ((city.rating === undefined || city.rating === null) && !city.beenThere) {
      console.log('[addOrUpdateCity] Removing city (no rating and not beenThere)');
      await updateDoc(ref, {
        visitedCities: arrayRemove(cityObj)
      });
    } else {
      console.log('[addOrUpdateCity] Adding city to Firebase:', cityObj);
      await updateDoc(ref, {
        visitedCities: arrayUnion(cityObj)
      });
    }
    console.log('[addOrUpdateCity] Firebase operation completed');
  };

  const removeCity = async (name: string, country: string) => {
    if (!userId) return;
    console.log('[removeCity] Called with:', name, country);
    const ref = doc(db, 'users', userId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      const visitedCitiesArr: VisitedCity[] = (data.visitedCities || []).map(normalizeCity).filter((c: VisitedCity | null): c is VisitedCity => !!c);
      // Trouve toutes les entrées pour cette ville (toutes les sources)
      const citiesToRemove = visitedCitiesArr.filter((c: VisitedCity) =>
        (c.name === name || c.city === name) && c.country === country
      );
      console.log('[removeCity] Cities to remove:', citiesToRemove);
      // Supprime toutes les entrées une par une
      for (const cityToRemove of citiesToRemove) {
        await updateDoc(ref, {
          visitedCities: arrayRemove(cityToRemove)
        });
        console.log('[removeCity] Removed:', cityToRemove);
      }
    }
  };

  return (
    <VisitedCitiesContext.Provider value={{ cities, addOrUpdateCity, removeCity, removeCitySource }}>
      {children}
    </VisitedCitiesContext.Provider>
  );
}

export function useVisitedCities() {
  const ctx = useContext(VisitedCitiesContext);
  if (!ctx) throw new Error('useVisitedCities must be used within VisitedCitiesProvider');
  return ctx;
}