import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserProfile {
  name: string;
  photo: string;
  followers: number;
  following: number;
  visitedCountries: string[];
}

interface CountryVisit {
  country: string;
  cities: Array<{
    id: string;
    name: string;
    photo: string;
    rating: number;
    description: string;
  }>;
}

// Données de test
const userProfile: UserProfile = {
  name: 'Marie Dubois',
  photo: 'https://images.unsplash.com/photo-1494790108755-2616b5739775?w=200&h=200&fit=crop&crop=face',
  followers: 234,
  following: 89,
  visitedCountries: ['France', 'Japan', 'USA', 'Italy', 'Spain']
};

const countryVisits: CountryVisit[] = [
  {
    country: 'France',
    cities: [
      {
        id: '1',
        name: 'Paris',
        photo: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=200&h=150&fit=crop',
        rating: 9,
        description: 'Ville magnifique avec une architecture incroyable'
      },
      {
        id: '2',
        name: 'Lyon',
        photo: 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=200&h=150&fit=crop',
        rating: 8,
        description: 'Excellente gastronomie et vieille ville charmante'
      }
    ]
  },
  {
    country: 'Japan',
    cities: [
      {
        id: '3',
        name: 'Tokyo',
        photo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&h=150&fit=crop',
        rating: 10,
        description: 'Mélange parfait entre tradition et modernité'
      }
    ]
  }
];

export default function ProfileScreen() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const screenWidth = Dimensions.get('window').width;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header du profil */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: userProfile.photo }} style={styles.profilePhoto} />
          <Text style={[styles.userName, { color: textColor }]}>{userProfile.name}</Text>
          
          {/* Stats followers/following */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>{userProfile.followers}</Text>
              <Text style={[styles.statLabel, { color: textColor }]}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>{userProfile.following}</Text>
              <Text style={[styles.statLabel, { color: textColor }]}>Following</Text>
            </View>
          </View>
        </View>

        {/* Carte du monde simplifiée */}
        <View style={styles.mapSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Pays visités</Text>
          <View style={styles.worldMap}>
            {/* Simulation d'une carte du monde avec des pays */}
            <View style={styles.mapContainer}>
              <Text style={[styles.mapTitle, { color: textColor }]}>🗺️ Carte du Monde</Text>
              <View style={styles.countriesGrid}>
                {['France', 'Japan', 'USA', 'Italy', 'Spain', 'Germany', 'UK', 'Brazil'].map((country) => (
                  <TouchableOpacity
                    key={country}
                    style={[
                      styles.countryItem,
                      {
                        backgroundColor: userProfile.visitedCountries.includes(country) 
                          ? '#4CAF50' 
                          : '#333333'
                      }
                    ]}
                    onPress={() => {
                      if (userProfile.visitedCountries.includes(country)) {
                        setSelectedCountry(selectedCountry === country ? null : country);
                      }
                    }}
                  >
                    <Text style={[styles.countryText, { color: '#FFFFFF' }]}>
                      {country}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Villes visitées pour le pays sélectionné */}
        {selectedCountry && (
          <View style={styles.citiesSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Villes visitées en {selectedCountry}
            </Text>
            {countryVisits
              .filter(visit => visit.country === selectedCountry)
              .map(visit => (
                <View key={visit.country}>
                  {visit.cities.map(city => (
                    <TouchableOpacity
                      key={city.id}
                      style={styles.cityCard}
                      onPress={() => router.push('/trip-detail')}
                    >
                      <Image source={{ uri: city.photo }} style={styles.cityPhoto} />
                      <View style={styles.cityInfo}>
                        <Text style={[styles.cityName, { color: textColor }]}>{city.name}</Text>
                        <Text style={[styles.cityRating, { color: '#FFD700' }]}>
                          ★ {city.rating}/10
                        </Text>
                        <Text style={[styles.cityDescription, { color: textColor }]} numberOfLines={2}>
                          {city.description}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
          </View>
        )}
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
  profileHeader: {
    alignItems: 'center',
    padding: 20,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  mapSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  worldMap: {
    minHeight: 200,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    padding: 16,
  },
  mapContainer: {
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  countriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  countryItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 70,
    alignItems: 'center',
  },
  countryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  citiesSection: {
    padding: 16,
  },
  cityCard: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cityPhoto: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  cityInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cityName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cityRating: {
    fontSize: 14,
    marginBottom: 4,
  },
  cityDescription: {
    fontSize: 12,
    opacity: 0.8,
  },
});
