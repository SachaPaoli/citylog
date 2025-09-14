const GEONAMES_USERNAME = process.env.EXPO_PUBLIC_GEONAMES_USERNAME || 'django0525';

export interface GeoNamesCity {
  geonameId: number;
  name: string;
  country: string;
  countryCode: string;
  countryFull: string;
  adminName1: string; // État/Province
  lat: string;
  lng: string;
  population: number;
  flag: string;
}

export class RealCitiesGeoNamesService {
  private static baseUrl = 'https://secure.geonames.org';

  /**
   * Normalise les chaînes pour la recherche (insensible à la casse et aux accents)
   */
  private static normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-z0-9\s]/g, '') // Garde seulement lettres, chiffres et espaces
      .trim();
  }

  /**
   * Détermine si une ville est une capitale
   */
  private static isCapital(city: GeoNamesCity): boolean {
    const knownCapitals = new Set([
      'paris', 'london', 'berlin', 'madrid', 'rome', 'vienna', 'athens', 
      'lisbon', 'dublin', 'amsterdam', 'brussels', 'copenhagen', 'stockholm',
      'oslo', 'helsinki', 'warsaw', 'prague', 'budapest', 'bratislava',
      'ljubljana', 'zagreb', 'sarajevo', 'skopje', 'tirana', 'podgorica',
      'belgrade', 'bucharest', 'sofia', 'chisinau', 'kyiv', 'minsk',
      'vilnius', 'riga', 'tallinn', 'moscow', 'washington', 'ottawa',
      'mexico city', 'buenos aires', 'brasilia', 'lima', 'bogota',
      'caracas', 'santiago', 'la paz', 'quito', 'asuncion', 'montevideo',
      'tokyo', 'beijing', 'seoul', 'bangkok', 'hanoi', 'manila', 'jakarta',
      'kuala lumpur', 'singapore', 'new delhi', 'islamabad', 'dhaka',
      'cairo', 'tunis', 'rabat', 'algiers', 'tripoli', 'canberra',
      'wellington', 'suva', 'apia'
    ]);
    
    const normalizedName = this.normalizeString(city.name).toLowerCase();
    return knownCapitals.has(normalizedName);
  }

  /**
   * Trie les résultats par priorité :
   * 1. Capitales 👑
   * 2. Correspondances exactes
   * 3. Correspondances qui commencent par le terme
   * 4. Population décroissante
   */
  private static sortSearchResults(cities: GeoNamesCity[], searchQuery: string): GeoNamesCity[] {
    const normalizedQuery = this.normalizeString(searchQuery).toLowerCase();
    
    return cities.sort((a, b) => {
      const normalizedA = this.normalizeString(a.name).toLowerCase();
      const normalizedB = this.normalizeString(b.name).toLowerCase();
      
      // 1. Priorité absolue : Capitales 👑
      const isCapitalA = this.isCapital(a);
      const isCapitalB = this.isCapital(b);
      
      if (isCapitalA && !isCapitalB) return -1;
      if (!isCapitalA && isCapitalB) return 1;
      
      // 2. Correspondances exactes
      const exactMatchA = normalizedA === normalizedQuery;
      const exactMatchB = normalizedB === normalizedQuery;
      
      if (exactMatchA && !exactMatchB) return -1;
      if (!exactMatchA && exactMatchB) return 1;
      
      // 3. Correspondances qui commencent par le terme
      const startsWithA = normalizedA.startsWith(normalizedQuery);
      const startsWithB = normalizedB.startsWith(normalizedQuery);
      
      if (startsWithA && !startsWithB) return -1;
      if (!startsWithA && startsWithB) return 1;
      
      // 4. Tri par population (plus peuplé en premier)
      return b.population - a.population;
    });
  }

  /**
   * Recherche de villes avec plus de 500 habitants + tri intelligent
   */
  static async searchCities(
    query: string, 
    maxResults: number = 50
  ): Promise<GeoNamesCity[]> {
    try {
      if (!query.trim()) return [];

      console.log(`🔍 GeoNames: Recherche pour "${query}" avec ${GEONAMES_USERNAME}`);

      // Demander plus de résultats pour avoir plus de choix avant tri
      const apiMaxResults = Math.min(maxResults * 2, 100);

      const url = `${this.baseUrl}/searchJSON?` + new URLSearchParams({
        q: query,
        maxRows: apiMaxResults.toString(),
        featureClass: 'P', // Places (villes)
        orderby: 'population',
        username: GEONAMES_USERNAME || '',
        style: 'full', // Pour avoir plus d'infos
      });

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status) {
        console.error('❌ Erreur GeoNames:', data.status);
        throw new Error(data.status.message || 'Erreur API GeoNames');
      }

      if (data.geonames) {
        let cities = data.geonames
          .filter((city: any) => city.population >= 500) // Filtre > 500 habitants
          .map((city: any) => ({
            geonameId: city.geonameId,
            name: city.name,
            country: city.countryName,
            countryCode: city.countryCode,
            countryFull: city.countryName,
            adminName1: city.adminName1 || '',
            lat: city.lat,
            lng: city.lng,
            population: city.population || 0,
            flag: city.countryCode ? `https://flagcdn.com/w80/${city.countryCode.toLowerCase()}.png` : '',
          }));

        // Application du tri intelligent
        cities = this.sortSearchResults(cities, query);
        
        // Limitation finale
        cities = cities.slice(0, maxResults);

        console.log(`✅ GeoNames: ${cities.length} villes triées pour "${query}"`);
        console.log('🏆 Top 5:', cities.slice(0, 5).map((c: GeoNamesCity) => 
          `${c.name}, ${c.country} ${this.isCapital(c) ? '👑' : ''} (${c.population.toLocaleString()})`
        ));
        
        return cities;
      }

      return [];
    } catch (error) {
      console.error('❌ Erreur lors de la recherche GeoNames:', error);
      return [];
    }
  }

  /**
   * Autocomplétion pour la recherche avec déduplication avancée
   */
  static async autocomplete(
    query: string,
    maxResults: number = 20
  ): Promise<GeoNamesCity[]> {
    if (query.length < 2) return [];

    try {
      console.log(`🔍 GeoNames Autocomplete: "${query}"`);

      const url = `${this.baseUrl}/searchJSON?` + new URLSearchParams({
        name_startsWith: query,
        featureClass: 'P',
        maxRows: (maxResults * 2).toString(), // On récupère plus pour pouvoir dédupliquer
        orderby: 'population',
        username: GEONAMES_USERNAME || '',
        style: 'full',
      });

      const response = await fetch(url);
      const data = await response.json();

      if (data.status) {
        console.error('❌ Erreur GeoNames Autocomplete:', data.status);
        return [];
      }

      if (data.geonames) {
        const cities = data.geonames
          .filter((city: any) => city.population >= 500)
          .map((city: any) => ({
            geonameId: city.geonameId,
            name: city.name,
            country: city.countryName,
            countryCode: city.countryCode,
            countryFull: city.countryName,
            adminName1: city.adminName1 || '',
            lat: city.lat,
            lng: city.lng,
            population: city.population || 0,
            flag: city.countryCode ? `https://flagcdn.com/w80/${city.countryCode.toLowerCase()}.png` : '',
          }));

        // Déduplication : même nom + même pays
        const uniqueCities = [];
        const seen = new Set();
        for (const city of cities) {
          const key = `${this.normalizeString(city.name)}-${this.normalizeString(city.country)}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueCities.push(city);
          }
        }

        // Tri intelligent : d'abord les correspondances exactes, puis par population
        const normalizedQuery = this.normalizeString(query);
        const sortedCities = uniqueCities.sort((a, b) => {
          const aExact = this.normalizeString(a.name) === normalizedQuery;
          const bExact = this.normalizeString(b.name) === normalizedQuery;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          // Si les deux sont exacts ou non, trier par population
          return (b.population || 0) - (a.population || 0);
        });

        console.log(`✅ GeoNames Autocomplete: ${sortedCities.length} villes uniques`);
        return sortedCities.slice(0, maxResults);
      }

      return [];
    } catch (error) {
      console.error('❌ Erreur autocomplete GeoNames:', error);
      return [];
    }
  }

  /**
   * Récupère les villes d'un pays spécifique
   */
  static async getCitiesByCountry(
    countryCode: string,
    minPopulation: number = 500,
    maxResults: number = 100
  ): Promise<GeoNamesCity[]> {
    try {
      console.log(`🔍 GeoNames: Villes du pays ${countryCode}`);

      const url = `${this.baseUrl}/searchJSON?` + new URLSearchParams({
        country: countryCode,
        featureClass: 'P',
        maxRows: maxResults.toString(),
        orderby: 'population',
        username: GEONAMES_USERNAME || '',
        style: 'full',
      });

      const response = await fetch(url);
      const data = await response.json();

      if (data.status) {
        console.error('❌ Erreur GeoNames pays:', data.status);
        return [];
      }

      if (data.geonames) {
        const cities = data.geonames
          .filter((city: any) => city.population >= minPopulation)
          .map((city: any) => ({
            geonameId: city.geonameId,
            name: city.name,
            country: city.countryName,
            countryCode: city.countryCode,
            countryFull: city.countryName,
            adminName1: city.adminName1 || '',
            lat: city.lat,
            lng: city.lng,
            population: city.population || 0,
            flag: city.countryCode ? `https://flagcdn.com/w80/${city.countryCode.toLowerCase()}.png` : '',
          }));

        console.log(`✅ GeoNames: ${cities.length} villes pour ${countryCode}`);
        return cities;
      }

      return [];
    } catch (error) {
      console.error('❌ Erreur villes par pays GeoNames:', error);
      return [];
    }
  }
}