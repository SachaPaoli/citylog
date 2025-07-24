import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TravelPost {
  id: string;
  city: string;
  country: string;
  photo: string;
  userPhoto: string;
  userName: string;
  rating: number;
  description: string;
}

interface TravelPostCardProps {
  post: TravelPost;
  onPress?: () => void;
}

export function TravelPostCard({ post, onPress }: TravelPostCardProps) {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const beigeColor = '#E5C9A6'; // Couleur beige pour les notes

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor }]} 
      onPress={() => router.push('/post-detail')}
    >
      <View style={styles.content}>
        {/* Photo principale de la ville */}
        <View style={styles.photoContainer}>
          <Image 
            source={{ uri: post.photo }} 
            style={styles.cityPhoto}
            defaultSource={require('@/assets/images/placeholder.png')}
          />
        </View>
        
        {/* Informations à droite */}
        <View style={styles.infoContainer}>
          {/* Photo de profil et nom */}
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: post.userPhoto }} 
              style={styles.userPhoto}
              defaultSource={require('@/assets/images/placeholder.png')}
            />
            <Text style={[styles.userName, { color: textColor }]}>
              {post.userName}
            </Text>
          </View>
          
          {/* Ville et pays */}
          <Text style={[styles.location, { color: textColor }]}>
            {post.city}, {post.country}
          </Text>
          
          {/* Note */}
          <View style={styles.ratingContainer}>
            <Text style={[styles.rating, { color: beigeColor }]}>
              {post.rating}/10
            </Text>
          </View>
          
          {/* Description courte */}
          <Text style={[styles.description, { color: textColor }]} numberOfLines={2}>
            {post.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    padding: 16,
  },
  photoContainer: {
    flex: 1,
    marginRight: 16,
  },
  cityPhoto: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userPhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#333',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  location: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingContainer: {
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 16,
  },
});
