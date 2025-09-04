import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

export interface TripCity {
  id: string;
  city: string;
  country: string;
  rating: number;
  coverImage: string;
  description: string;
  createdAt: number;
  duration: string;
  timeUnit: string;
  transport: string;
  order: number;
}

export interface Trip {
  id: string;
  tripName: string;
  description: string;
  coverImage: string;
  rating: number;
  isPublic: boolean;
  userId: string;
  userEmail: string;
  createdAt: any;
  cities: TripCity[];
}

export interface TripStats {
  countriesCount: number;
  citiesCount: number;
  averageRating: number;
  uniqueCountries: string[];
}

export class TripService {
  
  /**
   * Récupère tous les trips de l'utilisateur connecté
   */
  static async getUserTrips(): Promise<Trip[]> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Récupère les trips de l'utilisateur
      const tripsQuery = query(
        collection(db, 'trips'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const tripsSnapshot = await getDocs(tripsQuery);
      const trips: Trip[] = [];

      for (const tripDoc of tripsSnapshot.docs) {
        const tripData = { id: tripDoc.id, ...tripDoc.data() } as Trip;
        
        // Récupère les villes du trip
        const citiesQuery = query(
          collection(db, 'trips', tripDoc.id, 'cities'),
          orderBy('order', 'asc')
        );
        
        const citiesSnapshot = await getDocs(citiesQuery);
        tripData.cities = citiesSnapshot.docs.map(cityDoc => ({
          id: cityDoc.id,
          ...cityDoc.data()
        })) as TripCity[];

        trips.push(tripData);
      }

      return trips;
    } catch (error) {
      console.error('Erreur lors de la récupération des trips:', error);
      throw error;
    }
  }

  /**
   * Récupère un trip spécifique avec ses villes
   */
  static async getTrip(tripId: string): Promise<Trip | null> {
    try {
      const tripDoc = await getDoc(doc(db, 'trips', tripId));
      
      if (!tripDoc.exists()) {
        return null;
      }

      const tripData = { id: tripDoc.id, ...tripDoc.data() } as Trip;
      
      // Récupère les villes du trip
      const citiesQuery = query(
        collection(db, 'trips', tripId, 'cities'),
        orderBy('order', 'asc')
      );
      
      const citiesSnapshot = await getDocs(citiesQuery);
      tripData.cities = citiesSnapshot.docs.map(cityDoc => ({
        id: cityDoc.id,
        ...cityDoc.data()
      })) as TripCity[];

      return tripData;
    } catch (error) {
      console.error('Erreur lors de la récupération du trip:', error);
      throw error;
    }
  }

  /**
   * Calcule les statistiques d'un trip
   */
  static calculateTripStats(cities: TripCity[]): TripStats {
    if (cities.length === 0) {
      return {
        countriesCount: 0,
        citiesCount: 0,
        averageRating: 0,
        uniqueCountries: []
      };
    }

    // Pays uniques
    const uniqueCountries = [...new Set(cities.map(city => city.country))];
    
    // Note moyenne
    const totalRating = cities.reduce((sum, city) => sum + city.rating, 0);
    const averageRating = Math.round((totalRating / cities.length) * 10) / 10;

    return {
      countriesCount: uniqueCountries.length,
      citiesCount: cities.length,
      averageRating,
      uniqueCountries
    };
  }

  /**
   * Récupère tous les trips publics (pour le feed)
   */
  static async getPublicTrips(): Promise<Trip[]> {
    try {
      const tripsQuery = query(
        collection(db, 'trips'),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const tripsSnapshot = await getDocs(tripsQuery);
      const trips: Trip[] = [];

      for (const tripDoc of tripsSnapshot.docs) {
        const tripData = { id: tripDoc.id, ...tripDoc.data() } as Trip;
        
        // Récupère les villes du trip
        const citiesQuery = query(
          collection(db, 'trips', tripDoc.id, 'cities'),
          orderBy('order', 'asc')
        );
        
        const citiesSnapshot = await getDocs(citiesQuery);
        tripData.cities = citiesSnapshot.docs.map(cityDoc => ({
          id: cityDoc.id,
          ...cityDoc.data()
        })) as TripCity[];

        trips.push(tripData);
      }

      return trips;
    } catch (error) {
      console.error('Erreur lors de la récupération des trips publics:', error);
      throw error;
    }
  }
}
