import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TravelPost {
  id: string;
  city: string;
  country: string;
  photo: string;
  userPhoto: string;
  userName: string;
  rating: number;
  description: string;
  restaurants: string[];
  photos: string[];
}

// Données de test pour un post détaillé
const mockPost: TravelPost = {
  id: '1',
  city: 'Paris',
  country: 'France',
  photo: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop',
  userPhoto: 'https://images.unsplash.com/photo-1494790108755-2616b5739775?w=100&h=100&fit=crop&crop=face',
  userName: 'Marie',
  rating: 9,
  description: 'Une ville magnifique ! La Tour Eiffel était encore plus impressionnante que je ne l\'imaginais. Les cafés parisiens ont un charme unique. J\'ai passé des heures à me promener le long de la Seine et à découvrir les petites rues pavées de Montmartre.',
  restaurants: [
    'Le Comptoir du Relais',
    'L\'Ami Jean',
    'Bistrot Paul Bert'
  ],
  photos: [
    'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1549144511-f099e773c147?w=400&h=300&fit=crop',
  ]
};

export default function PostDetailScreen() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header avec bouton retour */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backText, { color: textColor }]}>← Retour</Text>
          </TouchableOpacity>
        </View>

        {/* Photo principale */}
        <Image source={{ uri: mockPost.photo }} style={styles.mainPhoto} />

        {/* Informations du post */}
        <View style={styles.contentContainer}>
          {/* User info et localisation */}
          <View style={styles.userSection}>
            <Image source={{ uri: mockPost.userPhoto }} style={styles.userPhoto} />
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: textColor }]}>{mockPost.userName}</Text>
              <Text style={[styles.location, { color: textColor }]}>
                {mockPost.city}, {mockPost.country}
              </Text>
            </View>
          </View>

          {/* Note */}
          <View style={styles.ratingSection}>
            <Text style={[styles.ratingLabel, { color: textColor }]}>Note :</Text>
            <Text style={[styles.rating, { color: '#FFD700' }]}>
              ★ {mockPost.rating}/10
            </Text>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Description</Text>
            <Text style={[styles.description, { color: textColor }]}>
              {mockPost.description}
            </Text>
          </View>

          {/* Restaurants */}
          <View style={styles.restaurantsSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Restaurants visités</Text>
            {mockPost.restaurants.map((restaurant, index) => (
              <View key={index} style={styles.restaurantItem}>
                <Text style={[styles.restaurantName, { color: textColor }]}>
                  • {restaurant}
                </Text>
              </View>
            ))}
          </View>

          {/* Photos supplémentaires */}
          <View style={styles.photosSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Plus de photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
              {mockPost.photos.map((photo, index) => (
                <Image key={index} source={{ uri: photo }} style={styles.additionalPhoto} />
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  mainPhoto: {
    width: '100%',
    height: 250,
    backgroundColor: '#333',
  },
  contentContainer: {
    padding: 16,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 16,
    marginTop: 2,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  rating: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  restaurantsSection: {
    marginBottom: 20,
  },
  restaurantItem: {
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 16,
  },
  photosSection: {
    marginBottom: 20,
  },
  photosScroll: {
    marginTop: 8,
  },
  additionalPhoto: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#333',
  },
});
