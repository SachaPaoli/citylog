import { StarRating } from '@/components/StarRating';
import { ProfileImage } from '@/components/ProfileImage';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';

interface TripSegment {
  duration: string;
  timeUnit: string;
  transport: string;
  order: number;
}

interface TripCity {
  id: string;
  city: string;
  country: string;
  coverImage: string;
  rating: number;
  description: string;
  duration: string;
  timeUnit: string;
  transport: string;
  order: number;
  stayingItems?: any[];
  restaurantItems?: any[];
  activitiesItems?: any[];
  otherItems?: any[];
}

interface Trip {
  id: string;
  tripName?: string;
  coverImage: string;
  description?: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhoto: string;
  createdAt: any;
  isPublic: boolean;
  // Fallback fields from old structure
  city?: string;
  country?: string;
}

// Segment component similar to WavyArrow but read-only
const TripSegment = ({ segment }: { segment: TripSegment }) => {
  const transportModes = [
    { label: '🚗', value: 'car', name: 'Car', icon: 'car-outline' },
    { label: '🚲', value: 'bike', name: 'Bicycle', icon: 'bicycle-outline' },
    { label: '🚂', value: 'train', name: 'Train', icon: 'train-outline' },
    { label: '🚌', value: 'bus', name: 'Bus', icon: 'bus-outline' },
    { label: '🚇', value: 'metro', name: 'Metro', icon: 'subway-outline' },
    { label: '🏍️', value: 'moto', name: 'Motorcycle', icon: 'speedometer-outline' },
    { label: '✈️', value: 'plane', name: 'Plane', icon: 'airplane-outline' }
  ];

  const transportMode = transportModes.find(mode => mode.icon === segment.transport);

  return (
    <View style={styles.segmentContainer}>
      <View style={styles.wavyPath}>
        <View style={[styles.arrowSegment, { transform: [{ rotate: '10deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-15deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '20deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-10deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '15deg' }] }]} />
      </View>
      
      <View style={styles.segmentInfo}>
        <View style={styles.segmentInfoContainer}>
          <Text style={styles.segmentDuration}>
            {segment.duration} {segment.timeUnit}
          </Text>
          <View style={styles.segmentTransport}>
            <Ionicons 
              name={segment.transport as any} 
              size={20} 
              color="#fff" 
            />
          </View>
        </View>
      </View>
      
      <View style={styles.wavyPath}>
        <View style={[styles.arrowSegment, { transform: [{ rotate: '18deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-12deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '22deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-16deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '14deg' }] }]} />
      </View>
      
      <View style={styles.arrowHead}>
        <Text style={styles.arrowHeadText}>▼</Text>
      </View>
    </View>
  );
};

export default function TripDetailScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { userProfile } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [cities, setCities] = useState<TripCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const whiteColor = '#FFFFFF';
  const headerColor = '#181C24';

  useEffect(() => {
    console.log('🔍 Detail page - tripId reçu:', tripId);
    if (tripId) {
      loadTripDetails();
    } else {
      console.log('❌ Aucun tripId fourni');
    }
  }, [tripId]);

  const loadTripDetails = async () => {
    if (!tripId) return;
    
    try {
      setLoading(true);
      console.log('🔥 Chargement du trip avec ID:', tripId);
      
      // Load trip details
      const tripDoc = await getDoc(doc(db, 'trips', tripId));
      console.log('📦 TripDoc exists:', tripDoc.exists());
      
      if (tripDoc.exists()) {
        const tripData = { id: tripDoc.id, ...tripDoc.data() } as Trip;
        console.log('✅ Trip data récupéré:', tripData.tripName);
        setTrip(tripData);
        
        // Load cities for this trip
        const citiesQuery = query(
          collection(db, 'trips', tripId, 'cities'),
          where('order', '>=', 0)
        );
        const citiesSnapshot = await getDocs(citiesQuery);
        console.log('🏙️ Nombre de villes trouvées:', citiesSnapshot.docs.length);
        
        const citiesData = citiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TripCity[];
        
        // Sort cities by order
        citiesData.sort((a, b) => a.order - b.order);
        setCities(citiesData);
      } else {
        console.log('❌ Trip document non trouvé dans Firestore');
      }
    } catch (error) {
      console.error('❌ Error loading trip details:', error);
      Alert.alert('Error', 'Unable to load trip details');
    } finally {
      setLoading(false);
    }
  };

  const isMyTrip = trip && userProfile && (trip.userId === userProfile.uid);

  const handleDeleteTrip = () => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Implement delete functionality here
            Alert.alert('Success', 'Trip deleted successfully');
            router.back();
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: headerColor }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="reload" size={48} color="#888" />
          <Text style={styles.loadingText}>Loading trip...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: headerColor }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Trip not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: headerColor }]}>
        {/* Header avec bouton retour, profil utilisateur et menu */}
        <View style={[styles.header, { backgroundColor: headerColor }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={whiteColor} />
          </TouchableOpacity>
          
          {/* User profile in center */}
          <TouchableOpacity 
            style={styles.headerUserProfile}
            onPress={() => {
              if (trip.userId && trip.userId !== userProfile?.uid) {
                router.push(`/user-profile?userId=${trip.userId}`);
              }
            }}
            activeOpacity={0.6}
          >
            <ProfileImage 
              uri={trip.userPhoto}
              size={32}
            />
            <Text style={[styles.headerUserName, { color: whiteColor }]}>
              {trip.userName || 'Unknown User'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setShowMenu(true)}
          >
            <Text style={[styles.menuButtonText, { color: whiteColor }]}>⋯</Text>
          </TouchableOpacity>
        </View>

        {/* Menu popup */}
        <Modal
          visible={showMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMenu(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            onPress={() => setShowMenu(false)}
          >
            <View style={styles.menuContainer}>
              {isMyTrip && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleDeleteTrip}
                >
                  <Text style={[styles.menuItemText, { color: '#ff4444' }]}>
                    Delete Trip
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setShowMenu(false)}
              >
                <Text style={styles.menuItemText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <ScrollView 
          style={[styles.mainScroll, { backgroundColor: headerColor }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Cover Image */}
          <View style={styles.coverImageContainer}>
            <Image 
              source={{ uri: trip.coverImage }} 
              style={styles.coverImage}
              resizeMode="cover"
            />
          </View>

          {/* Trip Info */}
          <View style={styles.tripInfo}>
            <Text style={styles.tripTitle}>
              {trip.tripName || trip.city || 'Voyage sans nom'}
            </Text>
            
            {trip.description && trip.description.trim() && (
              <Text style={styles.tripDescription}>{trip.description}</Text>
            )}
          </View>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Cities and Segments */}
          <View style={styles.citiesContainer}>
            {cities.map((city, index) => (
              <View key={city.id}>
                {/* City Card */}
                <View style={styles.cityCard}>
                  {city.coverImage ? (
                    <Image 
                      source={{ uri: city.coverImage }} 
                      style={styles.cityCoverImage} 
                    />
                  ) : (
                    <View style={styles.cityPlaceholder}>
                      <Text style={styles.cityPlaceholderText}>📍</Text>
                    </View>
                  )}
                  
                  <View style={styles.cityInfo}>
                    <Text style={styles.cityName}>{city.city}</Text>
                    <Text style={styles.cityCountry}>{city.country}</Text>
                    
                    {city.rating > 0 && (
                      <View style={styles.cityRating}>
                        <StarRating
                          rating={city.rating}
                          readonly
                          size="small"
                          color="#f5c518"
                          showRating={true}
                        />
                      </View>
                    )}
                    
                    {city.description && (
                      <Text style={styles.cityDescription} numberOfLines={2}>
                        {city.description}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Segment between cities (if not the last city) */}
                {index < cities.length - 1 && cities[index + 1] && (
                  <TripSegment 
                    segment={{
                      duration: cities[index + 1].duration || '',
                      timeUnit: cities[index + 1].timeUnit || 'hours',
                      transport: cities[index + 1].transport || 'car-outline',
                      order: cities[index + 1].order
                    }}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'transparent',
  },
  headerUserProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  headerUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    maxWidth: 120,
  },
  backButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  menuButton: {
    padding: 8,
    width: 50,
    height: 40,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 5,
    paddingTop: -5,
  },
  menuButtonText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
  },
  mainScroll: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#5784BA',
    fontSize: 16,
    fontWeight: 'bold',
  },
  coverImageContainer: {
    width: '100%',
    height: 250,
    marginBottom: 20,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  tripInfo: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tripTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  tripDescription: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 22,
  },
  separator: {
    height: 1,
    backgroundColor: '#444',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  citiesContainer: {
    paddingHorizontal: 16,
  },
  cityCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cityCoverImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  cityPlaceholder: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityPlaceholderText: {
    fontSize: 24,
  },
  cityInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  cityCountry: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  cityRating: {
    marginBottom: 4,
  },
  cityDescription: {
    fontSize: 12,
    color: '#ccc',
    lineHeight: 16,
  },
  // Segment styles
  segmentContainer: {
    alignItems: 'center',
    paddingVertical: 0,
    marginTop: -5,
    marginBottom: -5,
  },
  wavyPath: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  arrowSegment: {
    width: 3,
    height: 15,
    backgroundColor: '#888',
    marginVertical: 1,
  },
  segmentInfo: {
    marginVertical: 10,
  },
  segmentInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  segmentDuration: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  segmentTransport: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowHead: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 10,
  },
  arrowHeadText: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 30,
  },
});
