import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

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
  return (
    <View style={styles.container}>
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
        <Text style={styles.tripName} numberOfLines={2}>
          {tripName}
        </Text>
        
        {/* Average rating */}
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>★ {averageRating.toFixed(1)}</Text>
        </View>
        
        {/* Countries and cities count */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {countriesCount} pays • {citiesCount} villes
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  coverImageContainer: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#222',
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
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statsContainer: {
    alignItems: 'flex-start',
  },
  statsText: {
    fontSize: 12,
    color: '#E5C9A6',
    fontWeight: '600',
  },
});
