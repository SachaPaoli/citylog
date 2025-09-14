const GEONAMES_USERNAME = process.env.EXPO_PUBLIC_GEONAMES_USERNAME;

export interface GeoNamesCity {
  geonameId: number;
  name: string;
  country: string;
  countryCode: string;
  adminName1: string; // État/Province
  lat: string;
  lng: string;
  population: number;
}

export class GeoNamesService {
  private static baseUrl = 'http://api.geonames.org';

  /**
   * Recherche de villes avec plus de 500 habitants
   */
  static async searchCities(
    query: string, 
    maxResults: number = 20
  ): Promise<GeoNamesCity[]> {
    try {
      const url = `${this.baseUrl}/searchJSON?` + new URLSearchParams({
        q: query,
        maxRows: maxResults.toString(),
        featureClass: 'P', // Places (villes)
        orderby: 'population',
        username: GEONAMES_USERNAME || '',
      });

      const response = await fetch(url);
      const data = await response.json();

      if (data.geonames) {
        return data.geonames
          .filter((city: any) => city.population >= 500) // Filtre > 500 habitants
          .map((city: any) => ({
            geonameId: city.geonameId,
            name: city.name,
            country: city.countryName,
            countryCode: city.countryCode,
            adminName1: city.adminName1 || '',
            lat: city.lat,
            lng: city.lng,
            population: city.population || 0,
          }));
      }

      return [];
    } catch (error) {
      console.error('Erreur lors de la recherche de villes:', error);
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
      const url = `${this.baseUrl}/searchJSON?` + new URLSearchParams({
        country: countryCode,
        featureClass: 'P',
        maxRows: maxResults.toString(),
        orderby: 'population',
        username: GEONAMES_USERNAME || '',
      });

      const response = await fetch(url);
      const data = await response.json();

      if (data.geonames) {
        return data.geonames
          .filter((city: any) => city.population >= minPopulation)
          .map((city: any) => ({
            geonameId: city.geonameId,
            name: city.name,
            country: city.countryName,
            countryCode: city.countryCode,
            adminName1: city.adminName1 || '',
            lat: city.lat,
            lng: city.lng,
            population: city.population || 0,
          }));
      }

      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des villes par pays:', error);
      return [];
    }
  }

  /**
   * Autocomplétion pour la recherche
   */
  static async autocomplete(
    query: string,
    maxResults: number = 10
  ): Promise<GeoNamesCity[]> {
    if (query.length < 2) return [];

    try {
      const url = `${this.baseUrl}/searchJSON?` + new URLSearchParams({
        name_startsWith: query,
        featureClass: 'P',
        maxRows: maxResults.toString(),
        orderby: 'population',
        username: GEONAMES_USERNAME || '',
      });

      const response = await fetch(url);
      const data = await response.json();

      if (data.geonames) {
        return data.geonames
          .filter((city: any) => city.population >= 500)
          .map((city: any) => ({
            geonameId: city.geonameId,
            name: city.name,
            country: city.countryName,
            countryCode: city.countryCode,
            adminName1: city.adminName1 || '',
            lat: city.lat,
            lng: city.lng,
            population: city.population || 0,
          }));
      }

      return [];
    } catch (error) {
      console.error('Erreur lors de l\'autocomplétion:', error);
      return [];
    }
  }
}