import { Trip, TripService, TripStats } from '@/services/TripService';
import { useEffect, useState } from 'react';

export function useUserTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const userTrips = await TripService.getUserTrips();
      setTrips(userTrips);
    } catch (err) {
      console.error('Erreur lors du chargement des trips:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const refreshTrips = () => {
    loadTrips();
  };

  return {
    trips,
    loading,
    error,
    refreshTrips
  };
}

export function useTripStats(trips: Trip[]) {
  const [stats, setStats] = useState<TripStats[]>([]);

  useEffect(() => {
    const tripStats = trips.map(trip => 
      TripService.calculateTripStats(trip.cities)
    );
    setStats(tripStats);
  }, [trips]);

  return stats;
}

export function useTrip(tripId: string | null) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) {
      setTrip(null);
      return;
    }

    const loadTrip = async () => {
      try {
        setLoading(true);
        setError(null);
        const tripData = await TripService.getTrip(tripId);
        setTrip(tripData);
      } catch (err) {
        console.error('Erreur lors du chargement du trip:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    loadTrip();
  }, [tripId]);

  return {
    trip,
    loading,
    error
  };
}
