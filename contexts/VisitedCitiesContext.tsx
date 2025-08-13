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
  timestamp?: Date; // Ajouté pour les notifications
};

type VisitedCitiesContextType = {
  cities: VisitedCity[];
  addOrUpdateCity: (city: Omit<VisitedCity, 'id'>) => Promise<void>;
  removeCity: (name: string, country: string) => Promise<void>;
  removeCitySource: (name: string, country: string, source: 'post' | 'note', postId?: string) => Promise<void>;
  cleanupDuplicates: () => Promise<void>;
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
        // Remove duplicates with better logic
        const seen = new Set<string>();
        const deduped: VisitedCity[] = cleaned.filter((c: VisitedCity) => {
          // Pour les notes manuelles : une seule par nom de ville (peu importe l'ID exact)
          if (c.source === 'note') {
            const normalizedName = c.name.toLowerCase().trim();
            const key = `${normalizedName}-note`;
            if (seen.has(key)) {
              console.log(`[Dedup] Removing duplicate note for ${c.name}`);
              return false;
            }
            seen.add(key);
            return true;
          }
          // Pour les posts : un seul par postId
          if (c.source === 'post' && c.postId) {
            // Exclure les postId temporaires
            if (c.postId.startsWith('temp-')) {
              console.log(`[Dedup] Removing temporary post ${c.postId} for ${c.name}`);
              return false;
            }
            const key = `post-${c.postId}`;
            if (seen.has(key)) {
              console.log(`[Dedup] Removing duplicate post ${c.postId} for ${c.name}`);
              return false;
            }
            seen.add(key);
            return true;
          }
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
    
    // Ajouter un timestamp pour les notifications
    const timestamp = new Date();
    const cityObj: VisitedCity = { ...city, name, id, timestamp };
    
    // Firebase doesn't store undefined values, so remove undefined rating
    if (cityObj.rating === undefined) {
      delete (cityObj as any).rating;
    }
    
    console.log('[addOrUpdateCity] Called with:', city);
    console.log('[addOrUpdateCity] Created cityObj:', cityObj);
    const ref = doc(db, 'users', userId);
    
    // Remove any previous entries for this city/post
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const arr: VisitedCity[] = (snap.data().visitedCities || []).map(normalizeCity).filter((c: VisitedCity | null): c is VisitedCity => !!c);
      
      if (city.source === 'note') {
        // Pour les notes manuelles, supprime TOUTES les notes pour cette ville (peu importe l'ID exact)
        const normalizedName = name.toLowerCase().trim();
        const toRemove = arr.filter(c => 
          c.source === 'note' && 
          c.name.toLowerCase().trim() === normalizedName
        );
        for (const item of toRemove) {
          console.log('[addOrUpdateCity] Removing previous manual note:', item);
          await updateDoc(ref, { visitedCities: arrayRemove(item) });
        }
      } else if (city.source === 'post' && city.postId) {
        // Pour les posts, supprime TOUS les posts avec le même postId OU les posts temporaires pour cette ville
        const toRemove = arr.filter(c => 
          c.source === 'post' && (
            c.postId === city.postId || 
            (c.postId?.startsWith('temp-') && c.name === name && c.country === city.country)
          )
        );
        for (const item of toRemove) {
          console.log('[addOrUpdateCity] Removing previous/temp post:', item);
          await updateDoc(ref, { visitedCities: arrayRemove(item) });
        }
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

  const cleanupDuplicates = async () => {
    if (!userId) return;
    
    console.log('[cleanupDuplicates] Starting cleanup...');
    const ref = doc(db, 'users', userId);
    const snap = await getDoc(ref);
    
    if (snap.exists()) {
      const arr: VisitedCity[] = (snap.data().visitedCities || []).map(normalizeCity).filter((c: VisitedCity | null): c is VisitedCity => !!c);
      
      // Find duplicates
      const seen = new Set<string>();
      const toKeep: VisitedCity[] = [];
      const toRemove: VisitedCity[] = [];
      
      for (const city of arr) {
        if (city.source === 'note') {
          const normalizedName = city.name.toLowerCase().trim();
          const key = `${normalizedName}-note`;
          if (seen.has(key)) {
            toRemove.push(city);
          } else {
            seen.add(key);
            toKeep.push(city);
          }
        } else if (city.source === 'post' && city.postId) {
          if (city.postId.startsWith('temp-')) {
            toRemove.push(city);
          } else {
            const key = `post-${city.postId}`;
            if (seen.has(key)) {
              toRemove.push(city);
            } else {
              seen.add(key);
              toKeep.push(city);
            }
          }
        } else {
          toKeep.push(city);
        }
      }
      
      if (toRemove.length > 0) {
        console.log(`[cleanupDuplicates] Removing ${toRemove.length} duplicates:`, toRemove);
        
        // Remove all duplicates
        for (const city of toRemove) {
          await updateDoc(ref, { visitedCities: arrayRemove(city) });
        }
        
        console.log(`[cleanupDuplicates] Cleanup completed. Kept ${toKeep.length} unique cities.`);
      } else {
        console.log('[cleanupDuplicates] No duplicates found.');
      }
    }
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
    <VisitedCitiesContext.Provider value={{ cities, addOrUpdateCity, removeCity, removeCitySource, cleanupDuplicates }}>
      {children}
    </VisitedCitiesContext.Provider>
  );
}

export function useVisitedCities() {
  const ctx = useContext(VisitedCitiesContext);
  if (!ctx) throw new Error('useVisitedCities must be used within VisitedCitiesProvider');
  return ctx;
}