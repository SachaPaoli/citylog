import citiesData from '@/assets/data/cities.json';

export interface RawCityData {
  name: string;
  lat: string;
  lng: string;
  country: string;
  admin1: string;
  admin2?: string;
}

export interface RealCityData {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  region: string;
  latitude: number;
  longitude: number;
  population?: number;
}

export interface EnrichedRealCityData extends RealCityData {
  description: string;
  image: string;
  averageRating: number; // Sur 5 étoiles
  totalRatings: number; // Nombre total de votes
  userRating?: number; // Note de l'utilisateur connecté (si applicable)
  highlights: string[];
}

// Descriptions intelligentes par type de ville et pays
const SMART_DESCRIPTIONS = {
  'FR': {
    capital: "Capitale française riche en histoire et patrimoine",
    large: "Grande ville française avec un riche patrimoine culturel",
    medium: "Ville française typique avec charme et traditions",
    small: "Charmante commune française authentique"
  },
  'GB': {
    capital: "Historic British capital with royal heritage",
    large: "Major British city with industrial and cultural significance",
    medium: "Traditional British town with character",
    small: "Quaint British village with countryside charm"
  },
  'US': {
    capital: "American city with diverse culture and opportunities",
    large: "Major US metropolitan area with vibrant economy",
    medium: "American city with unique local character",
    small: "Small American town with community spirit"
  },
  'IT': {
    capital: "Città italiana ricca di arte, storia e cultura",
    large: "Grande città italiana con patrimonio storico",
    medium: "Bella città italiana con tradizioni locali",
    small: "Pittoresco borgo italiano autentico"
  },
  'ES': {
    capital: "Ciudad española con rica herencia cultural",
    large: "Gran ciudad española llena de vida y tradición",
    medium: "Ciudad española típica con encanto andaluz",
    small: "Pueblo español auténtico y acogedor"
  },
  'DE': {
    capital: "Deutsche Stadt mit reicher Geschichte und Kultur",
    large: "Große deutsche Stadt mit industrieller Bedeutung",
    medium: "Typische deutsche Stadt mit Tradition",
    small: "Charmantes deutsches Dorf"
  },
  'JP': {
    capital: "Japanese city blending tradition with modernity",
    large: "Major Japanese urban center with technological advancement",
    medium: "Traditional Japanese city with cultural heritage",
    small: "Peaceful Japanese town with natural beauty"
  },
  'default': {
    capital: "Major city with cultural and historical significance",
    large: "Large urban center with diverse attractions",
    medium: "Charming city with local character and traditions",
    small: "Peaceful town with authentic local culture"
  }
};

export class RealCitiesService {
  private static rawCities: RawCityData[] = citiesData as RawCityData[];
  private static cities: RealCityData[] | null = null;

  // Fonction pour normaliser les chaînes (insensible à la casse et aux accents)
  private static normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-z0-9\s]/g, '') // Garde seulement lettres, chiffres et espaces
      .trim();
  }

  // Convertir les données brutes en format standardisé
  private static convertRawCity(rawCity: RawCityData, index: number): RealCityData {
    return {
      id: index,
      name: rawCity.name,
      country: rawCity.country,
      countryCode: rawCity.country,
      region: rawCity.admin1 || '',
      latitude: parseFloat(rawCity.lat),
      longitude: parseFloat(rawCity.lng),
      population: undefined
    };
  }

  // Initialiser les données converties
  private static initializeCities(): void {
    if (!this.cities) {
      this.cities = this.rawCities.map((rawCity, index) => this.convertRawCity(rawCity, index));
    }
  }

  // Générer une URL d'image simplifiée - Juste le drapeau du pays
  private static generateImageUrl(city: RealCityData): string {
    // Plus d'images compliquées, juste le code pays pour récupérer le drapeau
    return `https://flagcdn.com/w320/${city.countryCode.toLowerCase()}.png`;
  }

  // Fonction hash simple pour créer de la variété
  private static simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  // Déterminer le type de climat basé sur la latitude
  private static getClimateType(latitude: number): string {
    const absLat = Math.abs(latitude);
    if (absLat < 23.5) return 'tropical';
    if (absLat < 35) return 'mediterranean';
    if (absLat < 50) return 'temperate';
    if (absLat < 66.5) return 'continental';
    return 'arctic';
  }

  // Générer une description intelligente
  private static generateSmartDescription(city: RealCityData): string {
    const countryDescriptions = SMART_DESCRIPTIONS[city.countryCode as keyof typeof SMART_DESCRIPTIONS] || SMART_DESCRIPTIONS.default;
    
    let category: keyof typeof countryDescriptions;
    
    if (!city.population) {
      category = 'small';
    } else if (city.population > 1000000) {
      category = 'large';
    } else if (city.population > 100000) {
      category = 'medium';
    } else {
      category = 'small';
    }

    // Vérifier si c'est une capitale (heuristique simple)
    const isCapital = city.name.toLowerCase().includes('capital') || 
                     city.name === 'Paris' || city.name === 'London' || 
                     city.name === 'Rome' || city.name === 'Berlin' ||
                     city.name === 'Madrid' || city.name === 'Tokyo';
    
    if (isCapital) {
      category = 'capital';
    }

    return countryDescriptions[category];
  }

  // Générer des highlights en fonction de la ville
  private static generateHighlights(city: RealCityData): string[] {
    const highlights: string[] = [];
    
    if (city.population && city.population > 1000000) {
      highlights.push('Métropole majeure');
    }
    
    if (city.countryCode === 'FR') {
      highlights.push('Patrimoine français', 'Gastronomie locale');
    } else if (city.countryCode === 'GB') {
      highlights.push('British heritage', 'Historic architecture');
    } else if (city.countryCode === 'US') {
      highlights.push('American culture', 'Modern attractions');
    } else if (city.countryCode === 'IT') {
      highlights.push('Arte italiana', 'Cucina tradizionale');
    } else if (city.countryCode === 'ES') {
      highlights.push('Cultura española', 'Arquitectura histórica');
    } else if (city.countryCode === 'DE') {
      highlights.push('Deutsche Kultur', 'Historische Stätten');
    } else if (city.countryCode === 'JP') {
      highlights.push('Japanese tradition', 'Modern technology');
    } else {
      highlights.push('Local culture', 'Authentic experience');
    }

    if (Math.abs(city.latitude) < 30) {
      highlights.push('Climat tropical');
    }

    return highlights.slice(0, 3);
  }

  // Enrichir une ville avec des données générées
  private static enrichCity(city: RealCityData): EnrichedRealCityData {
    return {
      ...city,
      description: this.generateSmartDescription(city),
      image: this.generateImageUrl(city),
      averageRating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10, // 3.5-5.0 étoiles
      totalRatings: Math.floor(Math.random() * 500) + 10, // Entre 10 et 510 notes
      highlights: this.generateHighlights(city)
    };
  }

  // Rechercher des villes par nom
  static async searchCities(query: string, limit: number = 10): Promise<EnrichedRealCityData[]> {
    return new Promise((resolve) => {
      this.initializeCities();
      if (!this.cities) {
        resolve([]);
        return;
      }

      const normalizedQuery = this.normalizeString(query);
      
      // Filtrer puis dédupliquer
      const filteredCities = this.cities.filter(city => {
        const normalizedCityName = this.normalizeString(city.name);
        const normalizedCountryName = this.normalizeString(city.country);
        return normalizedCityName.includes(normalizedQuery) ||
               normalizedCountryName.includes(normalizedQuery);
      });

      // Déduplication au niveau du service aussi
      const uniqueCities = [];
      const seen = new Set();
      
      for (const city of filteredCities) {
        const normalizedName = this.normalizeString(city.name);
        const normalizedCountry = this.normalizeString(city.country);
        const key = `${normalizedName}###${normalizedCountry}`;
        
        if (!seen.has(key)) {
          seen.add(key);
          uniqueCities.push(city);
        }
      }

      // Trier par pertinence (correspondance exacte d'abord, puis par population si disponible)
      const sortedCities = uniqueCities.sort((a, b) => {
        const aExact = this.normalizeString(a.name) === normalizedQuery;
        const bExact = this.normalizeString(b.name) === normalizedQuery;
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Trier par population si disponible
        const popA = a.population || 0;
        const popB = b.population || 0;
        return popB - popA;
      });

      const results = sortedCities
        .slice(0, limit)
        .map(city => this.enrichCity(city));
      
      console.log(`🏙️ Service: ${filteredCities.length} → ${uniqueCities.length} villes uniques trouvées`);
      resolve(results);
    });
  }

  // Rechercher par pays
  static async searchByCountry(countryCode: string, limit: number = 20): Promise<EnrichedRealCityData[]> {
    return new Promise((resolve) => {
      this.initializeCities();
      if (!this.cities) {
        resolve([]);
        return;
      }

      const results = this.cities
        .filter(city => city.countryCode === countryCode.toUpperCase())
        .slice(0, limit)
        .map(city => this.enrichCity(city));
      
      resolve(results);
    });
  }

  // Obtenir le nombre total de villes
  static async getCitiesCount(): Promise<number> {
    this.initializeCities();
    return Promise.resolve(this.cities?.length || 0);
  }

  // Obtenir la liste des pays disponibles
  static async getAvailableCountries(): Promise<string[]> {
    return new Promise((resolve) => {
      this.initializeCities();
      if (!this.cities) {
        resolve([]);
        return;
      }

      const countries = [...new Set(this.cities.map(city => city.countryCode))];
      resolve(countries.filter(Boolean).sort());
    });
  }

  // Obtenir des villes populaires
  static async getPopularCities(limit: number = 10): Promise<EnrichedRealCityData[]> {
    return new Promise((resolve) => {
      this.initializeCities();
      if (!this.cities) {
        resolve([]);
        return;
      }

      const popularCities = this.cities
        .filter(city => city.population && city.population > 500000)
        .sort((a, b) => (b.population || 0) - (a.population || 0))
        .slice(0, limit)
        .map(city => this.enrichCity(city));
      
      resolve(popularCities);
    });
  }

  // Obtenir des villes aléatoires
  static async getRandomCities(limit: number = 5): Promise<EnrichedRealCityData[]> {
    return new Promise((resolve) => {
      this.initializeCities();
      if (!this.cities) {
        resolve([]);
        return;
      }

      const shuffled = [...this.cities].sort(() => 0.5 - Math.random());
      const results = shuffled.slice(0, limit).map(city => this.enrichCity(city));
      resolve(results);
    });
  }
}
