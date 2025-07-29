import { useThemeColor } from '@/hooks/useThemeColor';
import { RealCitiesService } from '@/services/RealCitiesService';
import { SimpleCityRatingModal } from '@/components/SimpleCityRatingModal';
import { StarRating } from '@/components/StarRating';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const textColor = useThemeColor({}, 'text');
  const textActiveColor = useThemeColor({}, 'textActive');
  const backgroundColor = useThemeColor({}, 'background');
  const buttonBackgroundColor = useThemeColor({}, 'buttonBackground');
  const borderColor = useThemeColor({}, 'borderColor');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal de notation
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState<any>(null);

  // Rechercher des villes avec l'API 154k
  const searchCities = async (query: string) => {
    if (!query.trim()) {
      setCities([]);
      return;
    }
    
    setLoading(true);
    try {
      const results = await RealCitiesService.searchCities(query, 50);
      console.log(`Trouvé ${results.length} villes pour: ${query}`);
      setCities(results);
    } catch (error) {
      console.error('Erreur recherche:', error);
      setCities([]);
    }
    setLoading(false);
  };

  // Recherche automatique quand on tape
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCities(searchQuery);
    }, 300); // Délai de 300ms pour éviter trop de requêtes

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleCityPress = (city: any) => {
    setSelectedCity(city);
    setModalVisible(true);
  };

  const handleRateCity = (cityId: number, rating: number) => {
    console.log(`Ville ${cityId} notée ${rating}/5`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Explorer les Villes
        </Text>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { color: textColor, borderColor: borderColor }]}
          placeholder="Rechercher une ville..."
          placeholderTextColor={`${textColor}80`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Contenu principal */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && searchQuery.length > 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={textActiveColor} />
            <Text style={[styles.loadingText, { color: textColor }]}>
              Recherche en cours...
            </Text>
          </View>
        )}

        {/* Liste des villes */}
        {!loading && cities.length > 0 && (
          <View style={styles.citiesList}>
            {cities.map((city, index) => (
              <TouchableOpacity
                key={`${city.name}-${city.country}-${index}`}
                style={[styles.cityCard, { backgroundColor: buttonBackgroundColor, borderColor: borderColor }]}
                onPress={() => handleCityPress(city)}
              >
                <View style={styles.cityMainContent}>
                  <Image
                    source={{ uri: `https://flagcdn.com/w80/${city.country.toLowerCase()}.png` }}
                    style={styles.countryFlag}
                    resizeMode="cover"
                  />
                  <View style={styles.cityTextInfo}>
                    <Text style={[styles.cityName, { color: '#FFFFFF' }]}>
                      {city.name}
                    </Text>
                    <Text style={[styles.countryName, { color: textActiveColor }]}>
                      {city.country}
                    </Text>
                  </View>
                </View>
                
                {/* Note moyenne simulée */}
                <View style={styles.ratingSection}>
                  <StarRating 
                    rating={3.5 + Math.random() * 1.5} 
                    readonly={true} 
                    size="small"
                    color="#FFD700"
                  />
                  <Text style={[styles.ratingsCount, { color: textColor }]}>
                    ({Math.floor(Math.random() * 100) + 10})
                  </Text>
                </View>
                
                <Text style={[styles.tapHint, { color: textActiveColor }]}>
                  Tapez pour noter
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Message si aucune ville trouvée */}
        {!loading && cities.length === 0 && searchQuery.length > 0 && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: textColor }]}>
              Aucune ville trouvée pour "{searchQuery}"
            </Text>
          </View>
        )}

        {/* Instructions initiales */}
        {searchQuery.length === 0 && (
          <View style={styles.instructionContainer}>
            <Text style={[styles.instructionText, { color: textColor }]}>
              Tapez le nom d'une ville pour commencer votre recherche
            </Text>
            <Text style={[styles.instructionSubtext, { color: textColor }]}>
              Plus de 154 000 villes disponibles dans le monde
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal de notation */}
      <SimpleCityRatingModal
        visible={modalVisible}
        city={selectedCity}
        onClose={() => setModalVisible(false)}
        onRate={handleRateCity}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  backButton: {
    paddingVertical: 5,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  searchInput: {
    height: 45,
    borderWidth: 1.5,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: 'rgba(212, 184, 150, 0.1)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    opacity: 0.7,
  },
  countriesList: {
    paddingBottom: 20,
  },
  countryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(212, 184, 150, 0.05)',
  },
  flagEmoji: {
    fontSize: 32,
    marginRight: 15,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  countryRegion: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  countryCapital: {
    fontSize: 12,
    opacity: 0.8,
  },
  arrowIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  citiesList: {
    paddingBottom: 20,
  },
  cityCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityInfo: {
    flex: 1,
  },
  cityMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cityTextInfo: {
    flex: 1,
    marginLeft: 4,
  },
  cityHeader: {
    marginBottom: 8,
  },
  cityName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cityPopulation: {
    fontSize: 14,
    opacity: 0.7,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ratingsCount: {
    fontSize: 12,
    opacity: 0.7,
  },
  userRatingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userRatingLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tapHint: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  countryFlag: {
    width: 32,
    height: 24,
    borderRadius: 4,
    marginRight: 12,
  },
  instructionContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  instructionSubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});
