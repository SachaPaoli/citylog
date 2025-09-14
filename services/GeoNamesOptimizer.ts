// Stratégies d'optimisation pour économiser les requêtes GeoNames
import { useCallback, useState } from 'react';
import { RealCitiesGeoNamesService } from './RealCitiesGeoNamesService';

export class GeoNamesOptimizer {
  
  // 1. Cache intelligent des recherches
  private static searchCache = new Map<string, any[]>();
  private static cacheExpiry = new Map<string, number>();
  private static CACHE_DURATION = 24 * 60 * 60 * 1000; // 24h
  
  // 2. Debouncing avancé pour éviter les requêtes excessives
  private static debounceTimers = new Map<string, any>();
  
  // 3. Cache des recherches fréquentes
  static getCachedSearch(query: string) {
    const normalizedQuery = query.toLowerCase().trim();
    const cached = this.searchCache.get(normalizedQuery);
    const expiry = this.cacheExpiry.get(normalizedQuery);
    
    if (cached && expiry && Date.now() < expiry) {
      console.log(`📋 Cache hit pour: ${query}`);
      return cached;
    }
    
    return null;
  }
  
  static setCachedSearch(query: string, results: any[]) {
    const normalizedQuery = query.toLowerCase().trim();
    this.searchCache.set(normalizedQuery, results);
    this.cacheExpiry.set(normalizedQuery, Date.now() + this.CACHE_DURATION);
    console.log(`💾 Mise en cache: ${query} (${results.length} résultats)`);
  }
  
  // 4. Debouncing intelligent
  static debounceSearch(query: string, searchFunction: () => Promise<any[]>, delay = 500) {
    return new Promise<any[]>((resolve) => {
      // Annuler la recherche précédente
      const existingTimer = this.debounceTimers.get('search');
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
      
      // Vérifier le cache d'abord
      const cached = this.getCachedSearch(query);
      if (cached) {
        resolve(cached);
        return;
      }
      
      // Programmer la nouvelle recherche
      const timer = setTimeout(async () => {
        try {
          const results = await searchFunction();
          this.setCachedSearch(query, results);
          resolve(results);
        } catch (error) {
          resolve([]);
        }
      }, delay);
      
      this.debounceTimers.set('search', timer);
    });
  }
  
  // 5. Préchargement intelligent des villes populaires
  static async preloadPopularCities() {
    const popularQueries = [
      'Paris', 'London', 'New York', 'Tokyo', 'Berlin',
      'Rome', 'Madrid', 'Barcelona', 'Amsterdam', 'Vienna'
    ];
    
    console.log('🔄 Préchargement des villes populaires...');
    
    for (const query of popularQueries) {
      if (!this.getCachedSearch(query)) {
        try {
          // Ici tu appellerais ton service GeoNames
          // const results = await RealCitiesGeoNamesService.searchCities(query, 10);
          // this.setCachedSearch(query, results);
          await new Promise(resolve => setTimeout(resolve, 100)); // Délai entre requêtes
        } catch (error) {
          console.log(`Erreur préchargement ${query}:`, error);
        }
      }
    }
  }
  
  // 6. Analytics des requêtes pour optimiser
  private static requestCount = 0;
  private static dailyRequests: number[] = [];
  
  static trackRequest() {
    this.requestCount++;
    const today = new Date().getDate();
    if (!this.dailyRequests[today]) {
      this.dailyRequests[today] = 0;
    }
    this.dailyRequests[today]++;
  }
  
  static getUsageStats() {
    const today = new Date().getDate();
    return {
      totalRequests: this.requestCount,
      todayRequests: this.dailyRequests[today] || 0,
      remainingToday: 30000 - (this.dailyRequests[today] || 0),
      cacheHitRate: this.searchCache.size > 0 ? 
        (this.searchCache.size / this.requestCount * 100).toFixed(1) + '%' : '0%'
    };
  }
  
  // 7. Fallback vers données locales si quota dépassé
  static async searchWithFallback(query: string, localCities: any[]) {
    const stats = this.getUsageStats();
    
    if (stats.remainingToday < 100) {
      console.log('⚠️ Quota API bas, utilisation des données locales');
      return this.searchLocalCities(query, localCities);
    }
    
    try {
      this.trackRequest();
      // Ici ton appel API normal
      return []; // Placeholder
    } catch (error) {
      console.log('Fallback vers données locales après erreur API');
      return this.searchLocalCities(query, localCities);
    }
  }
  
  private static searchLocalCities(query: string, localCities: any[]) {
    const normalizedQuery = query.toLowerCase();
    return localCities.filter(city => 
      city.name.toLowerCase().includes(normalizedQuery) ||
      city.country.toLowerCase().includes(normalizedQuery)
    ).slice(0, 20);
  }
}

// 8. Hook optimisé pour React Native
export function useOptimizedCitySearch() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(GeoNamesOptimizer.getUsageStats());
  
  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    
    try {
      const optimizedResults = await GeoNamesOptimizer.debounceSearch(
        query,
        () => RealCitiesGeoNamesService.searchCities(query, 20)
      );
      
      setResults(optimizedResults);
      setStats(GeoNamesOptimizer.getUsageStats());
    } catch (error) {
      console.error('Erreur recherche optimisée:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { results, loading, search, stats };
}