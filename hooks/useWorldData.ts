import { useEffect, useState } from 'react';
import WorldDataService, { City, Country } from '../services/WorldDataService';

export const useWorldData = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger tous les pays
  const loadCountries = async () => {
    try {
      setLoading(true);
      setError(null);
      const countriesData = await WorldDataService.getAllCountries();
      setCountries(countriesData);
    } catch (err) {
      setError('Erreur lors du chargement des pays');
      console.error('Erreur pays:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les villes d'un pays
  const loadCitiesForCountry = async (country: Country) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedCountry(country);
      const citiesData = await WorldDataService.getCitiesByCountry(country.code);
      setCities(citiesData);
    } catch (err) {
      setError('Erreur lors du chargement des villes');
      console.error('Erreur villes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Rechercher des pays
  const searchCountries = (query: string): Country[] => {
    if (!query.trim()) return countries;
    
    return countries.filter(country =>
      country.name.toLowerCase().includes(query.toLowerCase()) ||
      country.region.toLowerCase().includes(query.toLowerCase()) ||
      (country.capital && country.capital.toLowerCase().includes(query.toLowerCase()))
    );
  };

  // Rechercher des villes
  const searchCities = (query: string): City[] => {
    if (!query.trim()) return cities;
    
    return cities.filter(city =>
      city.name.toLowerCase().includes(query.toLowerCase()) ||
      city.description.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Charger les pays au démarrage
  useEffect(() => {
    loadCountries();
  }, []);

  return {
    countries,
    selectedCountry,
    cities,
    loading,
    error,
    loadCitiesForCountry,
    searchCountries,
    searchCities,
    refreshCountries: loadCountries
  };
};
