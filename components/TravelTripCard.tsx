import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface TravelTripCardProps {
  coverImage: string;
  tripName: string;
  rating: number;
}

export function TravelTripCard({ coverImage, tripName, rating }: TravelTripCardProps) {
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
      {/* Trip name below */}
      <Text style={styles.tripName}>{tripName}</Text>
      {/* General rating below */}
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>★ {rating}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    alignItems: 'center',
    paddingBottom: 18,
    overflow: 'hidden',
  },
  coverImageContainer: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  tripName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  ratingContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
});
