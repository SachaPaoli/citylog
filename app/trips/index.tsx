import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface Trip {
  id: string;
  name: string;
  country: string;
  coverImage: string;
  postsCount: number;
  description?: string;
}

const tripsData: Trip[] = [
  {
    id: '1',
    name: 'Voyage à Paris',
    country: 'France',
    coverImage: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400',
    postsCount: 15,
    description: 'Une semaine magique dans la ville lumière'
  },
  {
    id: '2', 
    name: 'Road Trip California',
    country: 'États-Unis',
    coverImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
    postsCount: 23,
    description: 'De San Francisco à Los Angeles'
  },
  {
    id: '3',
    name: 'Escapade Tokyo',
    country: 'Japon', 
    coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
    postsCount: 18,
    description: 'Découverte de la culture japonaise'
  },
  {
    id: '4',
    name: 'Safari Kenya',
    country: 'Kenya',
    coverImage: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400',
    postsCount: 12,
    description: 'À la rencontre de la faune sauvage'
  },
  {
    id: '5',
    name: 'Îles Grecques',
    country: 'Grèce',
    coverImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400',
    postsCount: 20,
    description: 'Santorini et Mykonos'
  },
  {
    id: '6',
    name: 'Backpack Thaïlande',
    country: 'Thaïlande',
    coverImage: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400',
    postsCount: 28,
    description: 'Temples, plages et street food'
  }
];

export default function TripsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const beigeColor = '#D4B896';
  
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 60) / 2; // 20px padding + 20px gap

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
            // Ici on supprimerait le voyage
            console.log('Suppression du voyage:', tripId);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: textColor }]}>←</Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: textColor }]}>Mes Trips</Text>
        
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: beigeColor }]}
          onPress={() => router.push('/trips/create')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={[styles.content, { backgroundColor }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tripsGrid}>
          {tripsData.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={[styles.tripCard, { width: cardWidth }]}
              onPress={() => {
                // Navigation vers le détail du voyage
                console.log('Voir trip:', trip.name);
              }}
              onLongPress={() => handleDeleteTrip(trip.id)}
            >
              <Image 
                source={{ uri: trip.coverImage }}
                style={styles.tripImage}
                resizeMode="cover"
              />
              <View style={styles.tripInfo}>
                <Text style={[styles.tripName, { color: '#333' }]} numberOfLines={2}>
                  {trip.name}
                </Text>
                <Text style={styles.tripCountry} numberOfLines={1}>
                  {trip.country}
                </Text>
                {trip.description && (
                  <Text style={styles.tripDescription} numberOfLines={2}>
                    {trip.description}
                  </Text>
                )}
                <Text style={styles.tripPostsCount}>
                  {trip.postsCount} posts
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50, // Espace pour la status bar
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tripsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 40,
  },
  tripCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tripImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  tripInfo: {
    padding: 12,
  },
  tripName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tripCountry: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  tripDescription: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    lineHeight: 16,
  },
  tripPostsCount: {
    fontSize: 12,
    color: '#D4B896',
    fontWeight: '600',
  },
});
