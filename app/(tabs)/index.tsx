import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TravelTripCard } from '../../components/TravelTripCard';
import { db } from '../../config/firebase';

import { CityLogTitle } from '@/components/CityLogTitle';
import { TravelPostCard } from '@/components/TravelPostCard';
import { useFollowingPosts } from '@/hooks/useFollowingPosts';
import { usePosts } from '@/hooks/usePosts';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Post } from '@/types/Post';
import { TripService } from '@/services/TripService';

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
  cardWidth: number;
  textColor: string;
}
const TripsTab: React.FC<TripsTabProps> = React.memo(({ trips, cardWidth, textColor }) => {
  if (trips.length === 0) {
    return (
      <View style={styles.centerContent}>
        <Text style={[styles.emptyText, { color: textColor }]}>Aucun trip pour l'instant.</Text>
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingTop: 10 }}>
      {trips.map((trip) => {
        // Calculer les statistiques du trip à partir des villes
        const cities = trip.cities || [];
        const uniqueCountries = cities.length > 0 ? [...new Set(cities.map((city: any) => city.country))] : [];
        const averageRating = cities.length > 0 
          ? Math.round((cities.reduce((sum: number, city: any) => sum + (city.rating || 0), 0) / cities.length) * 10) / 10
          : trip.rating || 0;

        return (
          <View key={trip.id} style={{ width: cardWidth, marginBottom: 18 }}>
            <TravelTripCard
              coverImage={trip.coverImage || 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400'}
              tripName={trip.tripName || trip.city || 'Voyage sans nom'}
              averageRating={averageRating}
              countriesCount={uniqueCountries.length}
              citiesCount={cities.length}
            />
          </View>
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

  // Précharge les trips dès le montage pour un switch instantané
  useEffect(() => {
    let didCancel = false;
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
        
        if (!didCancel) setTrips(tripsArr);
      } catch (e) {
        console.error('Erreur chargement trips Firestore:', e);
      }
    };
    if (trips.length === 0) {
      fetchTrips();
    }
    return () => { didCancel = true; };
  }, [trips.length]);

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
        {/* Onglets */}
        <View style={[styles.tabsContainer, { backgroundColor: '#181C24', paddingTop: 0, paddingBottom: 12 }]}> 
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'cities' && { borderBottomColor: '#FFFFFF' }]}
            onPress={() => setActiveTab('cities')}
          >
            <Text style={[
              styles.tabText, 
              { color: activeTab === 'cities' ? '#FFFFFF' : '#B0B0B0' }
            ]}>
              Cities
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'trips' && { borderBottomColor: '#FFFFFF' }]}
            onPress={() => setActiveTab('trips')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'trips' ? '#FFFFFF' : '#B0B0B0' }
            ]}>
              Trips
            </Text>
          </TouchableOpacity>
        </View>
        {/* Ligne de séparation fine */}
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.2)', width: '100%' }} />
        <ScrollView 
          style={[styles.scrollView, { backgroundColor: '#181C24' }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Messages d'état */}
          {((activeTab === 'cities' && followingLoading) || (activeTab === 'trips' && loading)) && !refreshing && (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={textActiveColor} />
              <Text style={[styles.loadingText, { color: textColor }]}> 
                Chargement des voyages...
              </Text>
            </View>
          )}
          {error && (
            <View style={styles.centerContent}>
              <Text style={[styles.errorText, { color: 'red' }]}>
                {error}
              </Text>
            </View>
          )}
          {/* Posts */}
          <View style={styles.postsContainer}>
            {activeTab === 'cities' ? (
              <CitiesTab followingPosts={followingPosts} followingLoading={followingLoading} textColor={textColor} />
            ) : (
              <TripsTab trips={trips} cardWidth={cardWidth} textColor={textColor} />
            )}
          </View>
        </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 2,
    marginTop: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginHorizontal: -6,
  },
  tabText: {
    fontSize: 14,
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
