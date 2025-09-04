import { TravelTripCard } from '@/components/TravelTripCard';
import { auth, db } from '@/config/firebase';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router, Stack } from 'expo-router';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TripsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const beigeColor = '#E5C9A6';
  
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 60) / 2; // 20px padding + 20px gap

  // États pour les trips
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les trips
  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Chargement des trips...');
      console.log('👤 Utilisateur connecté:', auth.currentUser?.uid);
      
      const q = query(collection(db, 'trips'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const tripsArr: any[] = [];
      
      console.log('📊 Nombre de trips trouvés:', snap.docs.length);
      
      // Pour chaque trip, récupérer aussi ses villes
      for (const tripDoc of snap.docs) {
        const tripData: any = { id: tripDoc.id, ...tripDoc.data() };
        
        console.log('🏠 Trip:', tripData.tripName, 'UserId:', tripData.userId);
        
        // Récupérer les villes du trip
        try {
          const citiesQuery = query(
            collection(db, 'trips', tripDoc.id, 'cities'),
            orderBy('order', 'asc')
          );
          const citiesSnap = await getDocs(citiesQuery);
          tripData.cities = citiesSnap.docs.map(cityDoc => ({
            id: cityDoc.id,
            ...cityDoc.data()
          }));
          
          console.log(`🏙️ Trip ${tripData.tripName} a ${tripData.cities.length} villes`);
        } catch (error) {
          console.log('⚠️ Pas de villes pour le trip:', tripDoc.id);
          tripData.cities = [];
        }
        
        tripsArr.push(tripData);
      }
      
      console.log('✅ Trips chargés avec succès:', tripsArr.length);
      setTrips(tripsArr);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des trips:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleDeleteTrip = (tripId: string) => {
    Alert.alert(
      'Supprimer le voyage',
      'Êtes-vous sûr de vouloir supprimer ce voyage ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            // TODO: Implémenter la suppression du voyage
            console.log('Suppression du voyage:', tripId);
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: '#181C24' }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: '#181C24' }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: '#fff' }]}>←</Text>
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: '#fff' }]}>Mes Trips</Text>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/trips/create')}
          >
            <Text style={[styles.addButtonText, { color: '#fff' }]}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={[styles.content, { backgroundColor }]}
          showsVerticalScrollIndicator={false}
        >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E5C9A6" />
            <Text style={[styles.loadingText, { color: textColor }]}>
              Chargement de vos voyages...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: textColor }]}>
              Erreur: {error}
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={loadTrips}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : trips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: textColor }]}>
              Aucun voyage pour le moment
            </Text>
            <Text style={[styles.emptySubText, { color: textColor }]}>
              Créez votre premier voyage !
            </Text>
          </View>
        ) : (
          <View style={styles.tripsGrid}>
            {trips.map((trip) => {
              // Calculer les statistiques du trip à partir des villes
              const cities = trip.cities || [];
              const uniqueCountries = cities.length > 0 ? [...new Set(cities.map((city: any) => city.country))] : [];
              const averageRating = cities.length > 0 
                ? Math.round((cities.reduce((sum: number, city: any) => sum + (city.rating || 0), 0) / cities.length) * 10) / 10
                : trip.rating || 0;
              
              return (
                <TouchableOpacity
                  key={trip.id}
                  style={[styles.tripCard, { width: cardWidth }]}
                  onPress={() => {
                    // Navigation vers le détail du voyage
                    console.log('Voir trip:', trip.tripName);
                  }}
                  onLongPress={() => handleDeleteTrip(trip.id)}
                >
                  <TravelTripCard
                    coverImage={trip.coverImage || 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400'}
                    tripName={trip.tripName || 'Voyage sans nom'}
                    averageRating={averageRating}
                    countriesCount={uniqueCountries.length}
                    citiesCount={cities.length}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#E5C9A6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  tripsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 40,
  },
  tripCard: {
    marginBottom: 20,
  },
});
