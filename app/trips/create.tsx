import { StarRating } from '@/components/StarRating';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LocalTrip {
  id: string;
  city: string;
  country: string;
  coverImage: string;
  rating: number;
  description: string;
  stayingItems: any[];
  restaurantItems: any[];
  activitiesItems: any[];
  otherItems: any[];
  isPublic: boolean;
  createdAt: number;
}

export default function CreateTripScreen() {
  const [localTrips, setLocalTrips] = useState<LocalTrip[]>([]);
  const beigeColor = '#E5C9A6';

  // Charger les trips locaux depuis AsyncStorage
  const loadLocalTrips = useCallback(async () => {
    try {
      const storedTrips = await AsyncStorage.getItem('local_trips');
      if (storedTrips) {
        const trips = JSON.parse(storedTrips);
        console.log('📚 Trips chargés:', trips);
        setLocalTrips(trips);
      } else {
        setLocalTrips([]);
      }
    } catch (error) {
      console.error('❌ Erreur chargement trips:', error);
      setLocalTrips([]);
    }
  }, []);

  // Supprimer un trip local
  const deleteTrip = useCallback(async (tripId: string) => {
    try {
      const updatedTrips = localTrips.filter(trip => trip.id !== tripId);
      await AsyncStorage.setItem('local_trips', JSON.stringify(updatedTrips));
      setLocalTrips(updatedTrips);
      console.log('🗑️ Trip supprimé:', tripId);
    } catch (error) {
      console.error('❌ Erreur suppression trip:', error);
    }
  }, [localTrips]);

  // Recharger les trips chaque fois qu'on revient sur cette page
  useFocusEffect(
    useCallback(() => {
      loadLocalTrips();
    }, [loadLocalTrips])
  );

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
          
          <Text style={[styles.headerTitle, { color: '#fff' }]}>
            Nouveau Trip
          </Text>
          
          <View style={styles.headerRight}>
            {/* Espace pour équilibrer le header */}
          </View>
        </View>

        {/* Liste des trips existants */}
        {localTrips.length > 0 && (
          <ScrollView style={styles.tripsContainer} showsVerticalScrollIndicator={false}>
            <Text style={[styles.tripsTitle, { color: '#fff' }]}>Mes trips :</Text>
            {localTrips.map((trip) => (
              <View key={trip.id} style={styles.tripCard}>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => deleteTrip(trip.id)}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
                
                <Image source={{ uri: trip.coverImage }} style={styles.tripCoverImage} />
                <View style={styles.tripInfo}>
                  <Text style={[styles.tripCity, { color: '#fff' }]}>{trip.city}</Text>
                  <Text style={[styles.tripCountry, { color: '#888' }]}>{trip.country}</Text>
                  <View style={styles.tripRating}>
                    <StarRating 
                      rating={trip.rating} 
                      readonly 
                      size="small" 
                      color="#f5c518"
                      showRating={true}
                    />
                  </View>
                  <Text style={[styles.tripDescription, { color: '#ccc' }]} numberOfLines={2}>
                    {trip.description}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Bouton Add a city */}
        <View style={localTrips.length > 0 ? styles.addCityContainerWithTrips : styles.addCityContainer}>
          <TouchableOpacity 
            style={styles.addCityButton}
            onPress={() => router.push('/trips/add-city' as any)}
          >
            <Text style={styles.addCityIcon}>+</Text>
            <Text style={styles.addCityText}>Add a city</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
  },
  tripsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tripsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tripCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  deleteButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  tripCoverImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  tripInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  tripCity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  tripCountry: {
    fontSize: 14,
    marginBottom: 4,
  },
  tripRating: {
    marginBottom: 4,
  },
  tripDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  addCityContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  addCityContainerWithTrips: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  addCityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  addCityIcon: {
    fontSize: 20,
    color: '#fff',
    marginRight: 8,
    fontWeight: 'bold',
  },
  addCityText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
