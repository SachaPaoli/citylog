import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { StarRating } from './StarRating';

interface TravelTripCardProps {
  coverImage: string;
  tripName: string;
  averageRating: number;
  countriesCount: number;
  citiesCount: number;
}

export function TravelTripCard({ 
  coverImage, 
  tripName, 
  averageRating, 
  countriesCount, 
  citiesCount 
}: TravelTripCardProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Cover image at the top */}
      <View style={styles.coverImageContainer}>
        <Image
          source={{ uri: coverImage }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      </View>
      
      {/* Trip info */}
      <View style={styles.tripInfo}>
        {/* Trip name */}
        <Text style={[styles.tripName, { color: textColor }]} numberOfLines={2}>
          {tripName}
        </Text>
        
        {/* Average rating with stars like TravelPostCard */}
        <View style={styles.ratingContainer}>
          <StarRating 
            rating={averageRating}
            readonly
            size="small"
            showRating={true}
            color="#f5c518"
          />
        </View>
        
        {/* Countries count */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {countriesCount} pays
          </Text>
        </View>
        
        {/* Cities count */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {citiesCount} villes
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  coverImageContainer: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  tripInfo: {
    padding: 12,
  },
  tripName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsContainer: {
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  statsText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
});
