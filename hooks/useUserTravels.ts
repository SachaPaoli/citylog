import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PostService } from '../services/PostService';
import { Post } from '../types/Post';

export interface UserTravelData {
  visitedCountries: string[];
  countryVisits: CountryVisit[];
  totalCities: number;
}

export interface CountryVisit {
  country: string;
  cities: Array<{
    id: string;
    name: string;
    photo: string;
    rating: number;
    description: string;
    postId: string;
  }>;
}

export const useUserTravels = () => {
  const [travelData, setTravelData] = useState<UserTravelData>({
    visitedCountries: [],
    countryVisits: [],
    totalCities: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadUserTravels = async () => {
    if (!user) {
      setTravelData({ visitedCountries: [], countryVisits: [], totalCities: 0 });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Récupérer tous les posts
      const allPosts = await PostService.getAllPosts();
      
      // Filtrer les posts de l'utilisateur connecté
      const userPosts = allPosts.filter(post => post.userId === user.uid);
      
      // Extraire les pays et villes uniques
      const countryVisitsMap = new Map<string, CountryVisit>();
      
      userPosts.forEach(post => {
        const country = post.country;
        const city = post.city;
        
        if (!countryVisitsMap.has(country)) {
          countryVisitsMap.set(country, {
            country,
            cities: []
          });
        }
        
        const countryVisit = countryVisitsMap.get(country)!;
        
        // Vérifier si la ville n'existe pas déjà
        const existingCity = countryVisit.cities.find(c => c.name === city);
        if (!existingCity) {
          countryVisit.cities.push({
            id: post.id,
            name: city,
            photo: post.photo,
            rating: post.rating,
            description: post.description,
            postId: post.id
          });
        }
      });
      
      const countryVisits = Array.from(countryVisitsMap.values());
      const visitedCountries = countryVisits.map(cv => cv.country);
      const totalCities = countryVisits.reduce((total, cv) => total + cv.cities.length, 0);
      
      setTravelData({
        visitedCountries,
        countryVisits,
        totalCities
      });
      
    } catch (err) {
      setError('Erreur lors du chargement des données de voyage');
      console.error('Erreur voyage:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserTravels();
  }, [user]);

  return {
    travelData,
    loading,
    error,
    refreshTravels: loadUserTravels
  };
};
