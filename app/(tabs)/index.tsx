import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CityLogTitle } from '@/components/CityLogTitle';
import { TravelPostCard } from '@/components/TravelPostCard';
import { useThemeColor } from '@/hooks/useThemeColor';

// Données de test pour les posts
const mockPosts = [
  {
    id: '1',
    city: 'Paris',
    country: 'France',
    photo: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop',
    userPhoto: 'https://images.unsplash.com/photo-1494790108755-2616b5739775?w=100&h=100&fit=crop&crop=face',
    userName: 'Marie',
    rating: 9,
    description: 'Une ville magnifique ! La Tour Eiffel était encore plus impressionnante que je ne l\'imaginais. Les cafés parisiens ont un charme unique.',
  },
  {
    id: '2',
    city: 'Tokyo',
    country: 'Japan',
    photo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
    userPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    userName: 'Alex',
    rating: 10,
    description: 'Tokyo est incroyable ! Le mélange entre tradition et modernité est fascinant. Les ramen étaient délicieux.',
  },
  {
    id: '3',
    city: 'New York',
    country: 'USA',
    photo: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop',
    userPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    userName: 'Sophie',
    rating: 8,
    description: 'La ville qui ne dort jamais ! Times Square était bondé mais l\'énergie était électrisante. Central Park parfait pour se détendre.',
  },
];

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const beigeColor = '#E5C9A6'; // Couleur beige pour la ligne

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Titre CityLog */}
        <CityLogTitle />
        
        {/* Ligne de séparation grise */}
        <View style={styles.separatorContainer}>
          <View style={[styles.separatorLine, { backgroundColor: '#333333' }]} />
        </View>
        
        {/* Liste des posts */}
        <View style={styles.postsContainer}>
          {mockPosts.map((post) => (
            <TravelPostCard 
              key={post.id} 
              post={post}
            />
          ))}
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
  separatorContainer: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  separatorLine: {
    height: 0.5,
    width: '100%',
  },
  postsContainer: {
    paddingBottom: 20,
  },
});
