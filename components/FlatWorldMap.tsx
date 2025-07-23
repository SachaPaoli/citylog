import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FlatWorldMapProps {
  visitedCountries: string[];
}

interface CountryPost {
  id: string;
  city: string;
  country: string;
  rating: number;
  description: string;
  restaurant: string;
  date: string;
}

// Données des pays avec leurs drapeaux et nombre de villes visitées
const countryData = {
  'France': { flag: '🇫🇷', name: 'France', cities: 3 },
  'Spain': { flag: '🇪🇸', name: 'Espagne', cities: 2 },
  'Italy': { flag: '🇮🇹', name: 'Italie', cities: 4 },
  'Germany': { flag: '🇩🇪', name: 'Allemagne', cities: 2 },
  'UK': { flag: '🇬🇧', name: 'Royaume-Uni', cities: 3 },
  'USA': { flag: '🇺🇸', name: 'États-Unis', cities: 5 },
  'Canada': { flag: '🇨🇦', name: 'Canada', cities: 2 },
  'Japan': { flag: '🇯🇵', name: 'Japon', cities: 3 },
  'Australia': { flag: '🇦🇺', name: 'Australie', cities: 2 },
  'Brazil': { flag: '🇧🇷', name: 'Brésil', cities: 3 },
  'Mexico': { flag: '🇲🇽', name: 'Mexique', cities: 2 },
  'Thailand': { flag: '🇹🇭', name: 'Thaïlande', cities: 4 },
  'India': { flag: '🇮🇳', name: 'Inde', cities: 3 },
  'China': { flag: '🇨🇳', name: 'Chine', cities: 2 },
  'Russia': { flag: '🇷🇺', name: 'Russie', cities: 1 },
};

// Mock data pour les posts de voyage
const mockPosts: CountryPost[] = [
  {
    id: '1',
    city: 'Paris',
    country: 'France',
    rating: 9,
    description: 'Magnifique capitale avec ses monuments iconiques',
    restaurant: 'Le Comptoir du 7ème',
    date: '2024-07-15'
  },
  {
    id: '2',
    city: 'Lyon',
    country: 'France',
    rating: 8,
    description: 'Ville gastronomique exceptionnelle',
    restaurant: 'Bouchon Les Lyonnais',
    date: '2024-07-10'
  },
  {
    id: '3',
    city: 'Nice',
    country: 'France',
    rating: 9,
    description: 'Côte d\'Azur paradisiaque',
    restaurant: 'Chez Pipo',
    date: '2024-07-05'
  }
];

export function FlatWorldMap({ visitedCountries }: FlatWorldMapProps) {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const beigeColor = useThemeColor({ light: '#D4B896', dark: '#D4B896' }, 'beige');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleCountryPress = (countryId: string) => {
    setSelectedCountry(countryId);
    setModalVisible(true);
  };

  const getCountryPosts = (countryId: string) => {
    return mockPosts.filter(post => post.country === countryData[countryId as keyof typeof countryData]?.name);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>🌍 Mes Voyages</Text>
      <Text style={[styles.subtitle, { color: textColor }]}>
        {visitedCountries.length} pays explorés dans le monde
      </Text>
      
      {/* Scroll horizontal des pays visités */}
      <View style={styles.countriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {visitedCountries.map((countryId) => {
            const country = countryData[countryId as keyof typeof countryData];
            if (!country) return null;
            
            return (
              <TouchableOpacity 
                key={countryId}
                style={[styles.countryCard, { borderColor: beigeColor }]}
                onPress={() => handleCountryPress(countryId)}
              >
                <Text style={styles.flagIcon}>{country.flag}</Text>
                <Text style={[styles.countryName, { color: textColor }]}>
                  {country.name}
                </Text>
                <Text style={[styles.cityCount, { color: textColor }]}>
                  {country.cities} ville{country.cities > 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Statistiques */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={styles.pinIndicator} />
          <Text style={[styles.statText, { color: textColor }]}>
            {visitedCountries.length} pays explorés
          </Text>
        </View>
        <Text style={[styles.percentageText, { color: textColor }]}>
          {Math.round((visitedCountries.length / Object.keys(countryData).length) * 100)}% de mes destinations découvertes
        </Text>
      </View>

      {/* Modal pour afficher les posts du pays */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                {selectedCountry && countryData[selectedCountry as keyof typeof countryData]?.flag} {' '}
                {selectedCountry && countryData[selectedCountry as keyof typeof countryData]?.name}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.postsScrollView}>
              {selectedCountry && getCountryPosts(selectedCountry).map((post) => (
                <View key={post.id} style={styles.postCard}>
                  <View style={styles.postHeader}>
                    <Text style={[styles.postCity, { color: textColor }]}>
                      📍 {post.city}
                    </Text>
                    <Text style={[styles.postRating, { color: beigeColor }]}>
                      {post.rating}/10
                    </Text>
                  </View>
                  <Text style={[styles.postDescription, { color: textColor }]}>
                    {post.description}
                  </Text>
                  <Text style={[styles.postRestaurant, { color: textColor }]}>
                    🍽️ {post.restaurant}
                  </Text>
                  <Text style={[styles.postDate, { color: textColor }]}>
                    📅 {new Date(post.date).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              ))}
              
              {selectedCountry && getCountryPosts(selectedCountry).length === 0 && (
                <View style={styles.noPostsContainer}>
                  <Text style={[styles.noPostsText, { color: textColor }]}>
                    Aucun post pour ce pays pour le moment
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 20,
  },
  countriesContainer: {
    height: 140,
    marginBottom: 20,
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  countryCard: {
    width: 100,
    height: 120,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5, // Bordure super fine
  },
  flagIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  countryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  cityCount: {
    fontSize: 11,
    opacity: 0.7,
    textAlign: 'center',
  },
  statsContainer: {
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pinIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#ffffff',
    marginRight: 8,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
  },
  percentageText: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  postsScrollView: {
    flex: 1,
  },
  postCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postCity: {
    fontSize: 16,
    fontWeight: '600',
  },
  postRating: {
    fontSize: 14,
    fontWeight: '500',
  },
  postDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
    lineHeight: 20,
  },
  postRestaurant: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 6,
  },
  postDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  noPostsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noPostsText: {
    fontSize: 16,
    opacity: 0.7,
    fontStyle: 'italic',
  },
});
