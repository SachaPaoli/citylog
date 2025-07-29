import { Colors } from '@/constants/Colors';
import { EnrichedRealCityData, RealCitiesService } from '@/services/RealCitiesService';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { CityRatingModal } from './CityRatingModal';
import { StarRating } from './StarRating';

export function RealCitiesTest() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState<EnrichedRealCityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [citiesCount, setCitiesCount] = useState(0);
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<EnrichedRealCityData | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    // Charger les statistiques au démarrage
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const count = await RealCitiesService.getCitiesCount();
      const countryList = await RealCitiesService.getAvailableCountries();
      setCitiesCount(count);
      setCountries(countryList);
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.length < 2) {
      Alert.alert('Recherche', 'Entrez au moins 2 caractères');
      return;
    }

    setLoading(true);
    try {
      const results = await RealCitiesService.searchCities(searchQuery, 20);
      setCities(results);
    } catch (error) {
      console.error('Erreur recherche:', error);
      Alert.alert('Erreur', 'Problème lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const searchByCountry = async (countryCode: string) => {
    setLoading(true);
    try {
      const results = await RealCitiesService.searchByCountry(countryCode, 30);
      setCities(results);
      setSearchQuery(`Pays: ${countryCode}`);
    } catch (error) {
      console.error('Erreur recherche pays:', error);
      Alert.alert('Erreur', 'Problème lors de la recherche par pays');
    } finally {
      setLoading(false);
    }
  };

  const handleCityPress = (city: EnrichedRealCityData) => {
    setSelectedCity(city);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = (cityId: number, rating: number) => {
    // Ici tu peux sauvegarder la note en base de données
    console.log(`Note ${rating}/5 pour la ville ${cityId}`);
    
    // Mettre à jour la ville dans la liste
    setCities(prevCities => 
      prevCities.map(city => 
        city.id === cityId 
          ? { ...city, userRating: rating }
          : city
      )
    );
    
    Alert.alert('Note enregistrée', `Vous avez donné ${rating}/5 étoiles !`);
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(Math.floor(rating)) + (rating % 1 !== 0 ? '✨' : '');
  };

  const renderCity = (city: EnrichedRealCityData) => (
    <TouchableOpacity 
      key={city.id} 
      style={styles.cityCard}
      onPress={() => handleCityPress(city)}
    >
      <Image 
        source={{ uri: city.image }} 
        style={styles.cityImage}
        defaultSource={{ uri: 'https://flagcdn.com/w320/fr.png' }}
        onError={() => console.log(`Image failed for ${city.name}`)}
      />
      <View style={styles.cityInfo}>
        <Text style={styles.cityName}>{city.name}</Text>
        <Text style={styles.cityCountry}>
          {city.country} ({city.countryCode}) - {city.region}
        </Text>
        <Text style={styles.cityCoords}>
          📍 {city.latitude?.toFixed(4) ?? 'N/A'}, {city.longitude?.toFixed(4) ?? 'N/A'}
        </Text>
        {city.population && (
          <Text style={styles.cityPopulation}>
            👥 {city.population.toLocaleString()} habitants
          </Text>
        )}
        <View style={styles.cityRating}>
          <StarRating 
            rating={city.averageRating} 
            readonly={true} 
            size="small"
            color="#FFD700"
          />
          <Text style={styles.totalRatings}>
            ({city.totalRatings} notes)
          </Text>
        </View>
        <Text style={styles.cityDescription} numberOfLines={2}>
          {city.description}
        </Text>
        <View style={styles.highlightsContainer}>
          {city.highlights.slice(0, 2).map((highlight: string, index: number) => (
            <Text key={index} style={styles.highlight}>
              • {highlight}
            </Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌍 Base de Données Massive !</Text>
        <Text style={styles.stats}>
          📊 {citiesCount.toLocaleString()} villes • {countries.length} pays
        </Text>
      </View>

      {/* Recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une ville..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? '⏳' : '🔍'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pays populaires */}
      <View style={styles.countriesContainer}>
        <Text style={styles.sectionTitle}>Pays populaires :</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['FR', 'GB', 'US', 'IT', 'ES', 'DE', 'JP'].map(country => (
            <TouchableOpacity
              key={country}
              style={styles.countryButton}
              onPress={() => searchByCountry(country)}
            >
              <Text style={styles.countryButtonText}>{country}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Résultats */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Recherche en cours...</Text>
        </View>
      )}

      {cities.length > 0 && !loading && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            🎯 {cities.length} résultats trouvés
          </Text>
          {cities.map(renderCity)}
        </View>
      )}

      {cities.length === 0 && !loading && searchQuery.length > 0 && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>
            Aucune ville trouvée pour "{searchQuery}"
          </Text>
        </View>
      )}

      {/* Modal de notation */}
      <CityRatingModal
        city={selectedCity}
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onRatingSubmit={handleRatingSubmit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  stats: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  searchInput: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    marginRight: 10,
  },
  searchButton: {
    width: 45,
    height: 45,
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 18,
  },
  countriesContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  countryButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  countryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  resultsContainer: {
    padding: 15,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  cityCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cityImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cityCountry: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  cityCoords: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  cityPopulation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  cityRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 13,
    marginRight: 8,
  },
  visitsText: {
    fontSize: 11,
    color: '#888',
  },
  totalRatings: {
    fontSize: 11,
    color: '#888',
    marginLeft: 8,
  },
  cityDescription: {
    fontSize: 12,
    color: '#555',
    lineHeight: 16,
    marginBottom: 6,
  },
  highlightsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  highlight: {
    fontSize: 11,
    color: Colors.light.tint,
    marginRight: 8,
  },
  noResults: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
