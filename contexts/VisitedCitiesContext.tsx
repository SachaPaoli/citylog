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
};

const VisitedCitiesContext = createContext<VisitedCitiesContextType | undefined>(undefined);

export function VisitedCitiesProvider({ children }: { children: ReactNode }) {
  const [cities, setCities] = useState<VisitedCity[]>([]);

  const addOrUpdateCity = (city: Omit<VisitedCity, 'id'>) => {
    setCities(prev => {
      const id = `${city.name}-${city.country}`;
      const existing = prev.find(c => c.id === id);
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

  return (
    <VisitedCitiesContext.Provider value={{ cities, addOrUpdateCity }}>
      {children}
    </VisitedCitiesContext.Provider>
  );
}

export function useVisitedCities() {
  const ctx = useContext(VisitedCitiesContext);
  if (!ctx) throw new Error('useVisitedCities must be used within VisitedCitiesProvider');
  return ctx;
}
