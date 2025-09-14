import { useState } from 'react';
import { GeoNamesCity, GeoNamesService } from '../services/GeoNamesService';

export function useGeoNamesCities() {
  const [cities, setCities] = useState<GeoNamesCity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCities = async (query: string, maxResults?: number) => {
    if (!query.trim()) {
      setCities([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await GeoNamesService.searchCities(query, maxResults);
      setCities(results);
    } catch (err) {
      setError('Erreur lors de la recherche');
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const getCitiesByCountry = async (countryCode: string, minPopulation?: number) => {
    setLoading(true);
    setError(null);

    try {
      const results = await GeoNamesService.getCitiesByCountry(countryCode, minPopulation);
      setCities(results);
    } catch (err) {
      setError('Erreur lors de la récupération');
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    cities,
    loading,
    error,
    searchCities,
    getCitiesByCountry,
    clearCities: () => setCities([]),
  };
}

export function useGeoNamesAutocomplete() {
  const [suggestions, setSuggestions] = useState<GeoNamesCity[]>([]);
  const [loading, setLoading] = useState(false);

  const getSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);

    try {
      const results = await GeoNamesService.autocomplete(query);
      setSuggestions(results);
    } catch (err) {
      console.error('Erreur autocomplétion:', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    suggestions,
    loading,
    getSuggestions,
    clearSuggestions: () => setSuggestions([]),
  };
}