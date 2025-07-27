// Services pour récupérer les données de pays et villes
export interface Country {
  name: string;
  code: string;
  flag: string;
  region: string;
  capital?: string;
}

export interface City {
  name: string;
  country: string;
  countryCode: string;
  population: number;
  description: string;
  imageUrl: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

class WorldDataService {
  private static readonly REST_COUNTRIES_URL = 'https://restcountries.com/v3.1';
  private static readonly UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // À remplacer par ta clé

  // Récupérer tous les pays
  static async getAllCountries(): Promise<Country[]> {
    try {
      const response = await fetch(`${this.REST_COUNTRIES_URL}/all?fields=name,cca2,flag,region,capital`);
      const data = await response.json();
      
      return data.map((country: any) => ({
        name: country.name.common,
        code: country.cca2,
        flag: country.flag,
        region: country.region,
        capital: country.capital?.[0]
      })).sort((a: Country, b: Country) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Erreur lors du chargement des pays:', error);
      return [];
    }
  }

  // Récupérer les villes principales (base de données statique pour commencer)
  static async getCitiesByCountry(countryCode: string): Promise<City[]> {
    // Pour l'instant, on utilise une base de données statique
    // Tu pourras l'étendre ou utiliser une API plus tard
    const cities = await this.getStaticCitiesData();
    return cities
      .filter(city => city.countryCode === countryCode)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // Rechercher une photo de ville sur Unsplash
  static async getCityImage(cityName: string, countryName: string): Promise<string> {
    try {
      const query = `${cityName} ${countryName} city`;
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${this.UNSPLASH_ACCESS_KEY}`
          }
        }
      );
      
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].urls.regular;
      }
      
      // Image par défaut si pas trouvée
      return 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop';
    } catch (error) {
      console.error('Erreur lors du chargement de l\'image:', error);
      return 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop';
    }
  }

  // Base de données statique des villes principales
  private static async getStaticCitiesData(): Promise<City[]> {
    return [
      // France
      {
        name: "Paris",
        country: "France",
        countryCode: "FR",
        population: 2140526,
        description: "La Ville Lumière, capitale de la France, célèbre pour la Tour Eiffel, le Louvre et ses cafés.",
        imageUrl: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop",
        coordinates: { lat: 48.8566, lng: 2.3522 }
      },
      {
        name: "Lyon",
        country: "France",
        countryCode: "FR",
        population: 516092,
        description: "Capitale gastronomique de la France, inscrite au patrimoine mondial de l'UNESCO.",
        imageUrl: "https://images.unsplash.com/photo-1549144511-f099e773c147?w=400&h=300&fit=crop",
        coordinates: { lat: 45.764, lng: 4.8357 }
      },
      {
        name: "Marseille",
        country: "France",
        countryCode: "FR",
        population: 861635,
        description: "Port méditerranéen dynamique, porte d'entrée vers la Provence.",
        imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop",
        coordinates: { lat: 43.2965, lng: 5.3698 }
      },
      
      // Japon
      {
        name: "Tokyo",
        country: "Japan",
        countryCode: "JP",
        population: 13929286,
        description: "Métropole moderne alliant tradition et innovation, capitale du Japon.",
        imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
        coordinates: { lat: 35.6762, lng: 139.6503 }
      },
      {
        name: "Osaka",
        country: "Japan",
        countryCode: "JP",
        population: 2691185,
        description: "Centre culinaire du Japon, connue pour sa street food et son château.",
        imageUrl: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&h=300&fit=crop",
        coordinates: { lat: 34.6937, lng: 135.5023 }
      },
      
      // États-Unis
      {
        name: "New York",
        country: "United States",
        countryCode: "US",
        population: 8336817,
        description: "La ville qui ne dort jamais, centre financier et culturel mondial.",
        imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop",
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      {
        name: "Los Angeles",
        country: "United States",
        countryCode: "US",
        population: 3971883,
        description: "Cité des anges, capitale du cinéma et des plages californiennes.",
        imageUrl: "https://images.unsplash.com/photo-1518416177092-ec985e4d6c15?w=400&h=300&fit=crop",
        coordinates: { lat: 34.0522, lng: -118.2437 }
      },
      
      // Italie
      {
        name: "Rome",
        country: "Italy",
        countryCode: "IT",
        population: 2872800,
        description: "La Ville Éternelle, berceau de la civilisation occidentale.",
        imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop",
        coordinates: { lat: 41.9028, lng: 12.4964 }
      },
      {
        name: "Florence",
        country: "Italy",
        countryCode: "IT",
        population: 383083,
        description: "Berceau de la Renaissance, trésor artistique et architectural.",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        coordinates: { lat: 43.7696, lng: 11.2558 }
      },
      
      // Espagne
      {
        name: "Madrid",
        country: "Spain",
        countryCode: "ES",
        population: 3223334,
        description: "Capitale vibrante de l'Espagne, riche en art et en culture.",
        imageUrl: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=300&fit=crop",
        coordinates: { lat: 40.4168, lng: -3.7038 }
      },
      {
        name: "Barcelona",
        country: "Spain",
        countryCode: "ES",
        population: 1620343,
        description: "Ville moderniste méditerranéenne, célèbre pour Gaudí et ses plages.",
        imageUrl: "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?w=400&h=300&fit=crop",
        coordinates: { lat: 41.3851, lng: 2.1734 }
      }
      
      // Tu peux ajouter plus de villes ici...
    ];
  }
}

export default WorldDataService;
