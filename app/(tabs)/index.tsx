import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TravelTripCard } from '../../components/TravelTripCard';
import { db } from '../../config/firebase';

import { CityLogTitle } from '@/components/CityLogTitle';
import { TravelPostCard } from '@/components/TravelPostCard';
import { useFollowingPosts } from '@/hooks/useFollowingPosts';
import { usePosts } from '@/hooks/usePosts';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Post } from '@/types/Post';

// Onglet Cities
interface CitiesTabProps {
  followingPosts: Post[];
  followingLoading: boolean;
  textColor: string;
}
const CitiesTab: React.FC<CitiesTabProps> = React.memo(({ followingPosts, followingLoading, textColor }) => (
  <>
    {!followingLoading && followingPosts.length === 0 && (
      <View style={styles.centerContent}>
        <Text style={[styles.emptyText, { color: textColor }]}> 
          Aucun voyage dans votre feed.
        </Text>
        <Text style={[styles.emptySubtext, { color: textColor }]}> 
          Suivez des utilisateurs pour voir leurs voyages ! 👥
        </Text>
      </View>
    )}
    {followingPosts.map((post) => (
      <TravelPostCard 
        key={post.id} 
        post={post}
      />
    ))}
  </>
));

// Onglet Trips
interface TripsTabProps {
  trips: any[];
  textColor: string;
}
const TripsTab: React.FC<TripsTabProps> = React.memo(({ trips, textColor }) => {
  if (trips.length === 0) {
    return (
      <View style={styles.centerContent}>
        <Text style={[styles.emptyText, { color: textColor }]}>Aucun trip pour l'instant.</Text>
      </View>
    );
  }

  return (
    <View style={{ paddingTop: 10 }}>
      {trips.map((trip) => {
        // Calculer les statistiques du trip à partir des villes
        const cities = trip.cities || [];
        const uniqueCountries = cities.length > 0 ? [...new Set(cities.map((city: any) => city.country))] : [];
        const averageRating = cities.length > 0 
          ? Math.round((cities.reduce((sum: number, city: any) => sum + (city.rating || 0), 0) / cities.length) * 10) / 10
          : trip.rating || 0;

        return (
          <TravelTripCard
            key={trip.id}
            tripId={trip.id}
            coverImage={trip.coverImage || 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400'}
            tripName={trip.tripName || trip.city || 'Voyage sans nom'}
            averageRating={averageRating}
            countriesCount={uniqueCountries.length}
            citiesCount={cities.length}
            userId={trip.userId}
            userName={trip.userName || 'Utilisateur'}
            userPhoto={trip.userPhoto}
            createdAt={trip.createdAt}
          />
        );
      })}
    </View>
  );
});

export default function HomeScreen() {
  const [trips, setTrips] = useState<any[]>([]);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textActiveColor = useThemeColor({}, 'textActive');
  const borderColor = useThemeColor({}, 'borderColor');
  
  const { posts, loading, error, refreshPosts } = usePosts();
  const { posts: followingPosts, loading: followingLoading, refreshFollowingPosts } = useFollowingPosts();
  const [refreshing, setRefreshing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'cities' | 'trips'>('cities');
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 60) / 2;

  // Animations pour le sliding - comme dans ranking
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const tabIndicatorAnim = React.useRef(new Animated.Value(0)).current;

  // Précharge les trips dès le montage pour un switch instantané
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const q = query(collection(db, 'trips'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const tripsArr: any[] = [];
        
        // Pour chaque trip, récupérer aussi ses villes
        for (const tripDoc of snap.docs) {
          const tripData: any = { id: tripDoc.id, ...tripDoc.data() };
          
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
          } catch (error) {
            console.log('Pas de villes pour le trip:', tripDoc.id);
            tripData.cities = [];
          }
          
          tripsArr.push(tripData);
        }
        
        setTrips(tripsArr);
      } catch (e) {
        console.error('Erreur chargement trips Firestore:', e);
      }
    };
    
    fetchTrips();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'cities') {
      await refreshFollowingPosts();
    } else if (activeTab === 'trips') {
      // Force reload trips from Firestore avec leurs villes
      try {
        const q = query(collection(db, 'trips'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const tripsArr: any[] = [];
        
        // Pour chaque trip, récupérer aussi ses villes
        for (const tripDoc of snap.docs) {
          const tripData: any = { id: tripDoc.id, ...tripDoc.data() };
          
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
          } catch (error) {
            console.log('Pas de villes pour le trip:', tripDoc.id);
            tripData.cities = [];
          }
          
          tripsArr.push(tripData);
        }
        
        setTrips(tripsArr);
      } catch (e) {
        console.error('Erreur chargement trips Firestore:', e);
      }
    }
    setRefreshing(false);
  };

  // Fonction de changement d'onglet avec slide - comme dans ranking
  const switchTab = (tab: 'cities' | 'trips') => {
    if (tab === activeTab) return;
    
    const screenWidth = Dimensions.get('window').width;
    const targetSlideValue = tab === 'cities' ? 0 : -screenWidth;
    const targetIndicatorValue = tab === 'cities' ? 0 : screenWidth / 2;
    
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: targetSlideValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(tabIndicatorAnim, {
        toValue: targetIndicatorValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    setActiveTab(tab);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#181C24' }]}> 
      <View style={{ flex: 1 }}>
        {/* Header Explore-like */}
        <View style={{ backgroundColor: '#181C24', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <CityLogTitle />
            <TouchableOpacity onPress={() => router.push('/notifications')} style={{ padding: 8 }}>
              <Ionicons name="notifications-outline" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        {/* Onglets avec sliding indicator - comme dans ranking */}
        <View style={[styles.tabsContainer, { backgroundColor: '#181C24', paddingTop: 0, paddingBottom: 0, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' }]}> 
          <View style={{ paddingHorizontal: 0, flexDirection: 'row', position: 'relative' }}>
            <TouchableOpacity 
              style={[styles.tab]} 
              onPress={() => switchTab('cities')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabText, 
                { color: activeTab === 'cities' ? '#FFFFFF' : '#888' }
              ]}>
                Cities
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab]} 
              onPress={() => switchTab('trips')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'trips' ? '#FFFFFF' : '#888' }
              ]}>
                Trips
              </Text>
            </TouchableOpacity>
            
            {/* Barre blanche de sélection animée */}
            <Animated.View 
              style={[
                styles.tabIndicator,
                { transform: [{ translateX: tabIndicatorAnim }] }
              ]} 
            />
          </View>
        </View>

        {/* Contenu avec sliding animation */}
        <Animated.View 
          style={[
            styles.slidingContent,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          {/* Onglet Cities */}
          <ScrollView 
            style={[styles.tabContent, { backgroundColor: '#181C24' }]}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Messages d'état - Cities */}
            {error && (
              <View style={styles.centerContent}>
                <Text style={[styles.errorText, { color: 'red' }]}>
                  {error}
                </Text>
              </View>
            )}
            
            <View style={styles.postsContainer}>
              <CitiesTab 
                followingPosts={followingPosts} 
                followingLoading={followingLoading} 
                textColor={textColor} 
              />
            </View>
          </ScrollView>

          {/* Onglet Trips */}
          <ScrollView 
            style={[styles.tabContent, { backgroundColor: '#181C24' }]}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.postsContainer}>
              <TripsTab 
                trips={trips} 
                textColor={textColor}
              />
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    paddingTop: 0,
    paddingBottom: 5,
  },
  scrollView: {
    flex: 1,
  },
  tabsContainer: {
    position: 'relative',
    paddingVertical: 10,
  },
  tab: {
    width: Dimensions.get('window').width / 2,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: Dimensions.get('window').width / 2,
    height: 2,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
  },
  slidingContent: {
    flexDirection: 'row',
    width: Dimensions.get('window').width * 2,
  },
  tabContent: {
    width: Dimensions.get('window').width,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  postsContainer: {
    paddingBottom: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    opacity: 0.7,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});
