import React, { createContext, ReactNode, useContext, useState } from 'react';

export type VisitedCity = {
  id: string; // unique (ex: `${cityName}-${country}`)
  name: string;
  country: string;
  flag: string;
  rating?: number; // 1-5 si notée
  beenThere: boolean;
};

type VisitedCitiesContextType = {
  cities: VisitedCity[];
  addOrUpdateCity: (city: Omit<VisitedCity, 'id'>) => void;
  removeCity: (name: string, country: string) => void;
};

const VisitedCitiesContext = createContext<VisitedCitiesContextType | undefined>(undefined);

export function VisitedCitiesProvider({ children }: { children: ReactNode }) {
  const [cities, setCities] = useState<VisitedCity[]>([]);

  const addOrUpdateCity = (city: Omit<VisitedCity, 'id'>) => {
    setCities(prev => {
      const id = `${city.name}-${city.country}`;
      const existing = prev.find(c => c.id === id);
      // Si on retire la note ET beenThere est false, on supprime la ville
      if ((city.rating === undefined || city.rating === null) && !city.beenThere) {
        return prev.filter(c => c.id !== id);
      }
      if (existing) {
        // Update rating or beenThere
        return prev.map(c =>
          c.id === id ? { ...c, ...city, id } : c
        );
      } else {
        return [...prev, { ...city, id }];
      }
    });
  };

  const removeCity = (name: string, country: string) => {
    const id = `${name}-${country}`;
    setCities(prev => prev.filter(c => c.id !== id));
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
