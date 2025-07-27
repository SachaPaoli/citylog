import { useThemeColor } from '@/hooks/useThemeColor';
import { useWorldData } from '@/hooks/useWorldData';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const beigeColor = '#E5C9A6';
  
  const [activeTab, setActiveTab] = useState<'countries' | 'cities'>('countries');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    countries, 
    selectedCountry, 
    cities, 
    loading, 
    error,
    loadCitiesForCountry,
    searchCountries,
    searchCities 
  } = useWorldData();

  // Filtrer selon la recherche
  const filteredCountries = searchCountries(searchQuery);
  const filteredCities = searchCities(searchQuery);

  const handleCountryPress = (country: any) => {
    loadCitiesForCountry(country);
    setActiveTab('cities');
  };

  const handleBackToCountries = () => {
    setActiveTab('countries');
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header avec navigation */}
      <View style={styles.header}>
        {selectedCountry && activeTab === 'cities' && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackToCountries}
          >
            <Text style={[styles.backButtonText, { color: beigeColor }]}>← Retour</Text>
          </TouchableOpacity>
        )}
        
        <Text style={[styles.headerTitle, { color: textColor }]}>
          {activeTab === 'countries' ? 'Explorer le Monde' : `Villes de ${selectedCountry?.name}`}
        </Text>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { color: textColor, borderColor: beigeColor }]}
          placeholder={activeTab === 'countries' ? "Rechercher un pays..." : "Rechercher une ville..."}
          placeholderTextColor={`${beigeColor}80`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Contenu principal */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={beigeColor} />
            <Text style={[styles.loadingText, { color: textColor }]}>
              Chargement...
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: 'red' }]}>{error}</Text>
          </View>
        )}

        {/* Liste des pays */}
        {activeTab === 'countries' && !loading && (
          <View style={styles.countriesList}>
            {filteredCountries.map((country) => (
              <TouchableOpacity
                key={country.code}
                style={[styles.countryCard, { borderColor: beigeColor }]}
                onPress={() => handleCountryPress(country)}
              >
                <Text style={styles.flagEmoji}>{country.flag}</Text>
                <View style={styles.countryInfo}>
                  <Text style={[styles.countryName, { color: textColor }]}>
                    {country.name}
                  </Text>
                  <Text style={[styles.countryRegion, { color: textColor }]}>
                    {country.region}
                  </Text>
                  {country.capital && (
                    <Text style={[styles.countryCapital, { color: beigeColor }]}>
                      Capitale: {country.capital}
                    </Text>
                  )}
                </View>
                <Text style={[styles.arrowIcon, { color: beigeColor }]}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Liste des villes */}
        {activeTab === 'cities' && !loading && (
          <View style={styles.citiesList}>
            {filteredCities.map((city) => (
              <TouchableOpacity
                key={city.name}
                style={[styles.cityCard, { backgroundColor: '#2a2a2a' }]}
              >
                <Image source={{ uri: city.imageUrl }} style={styles.cityImage} />
                <View style={styles.cityInfo}>
                  <Text style={[styles.cityName, { color: textColor }]}>
                    {city.name}
                  </Text>
                  <Text style={[styles.cityPopulation, { color: beigeColor }]}>
                    {city.population.toLocaleString()} habitants
                  </Text>
                  <Text style={[styles.cityDescription, { color: textColor }]} numberOfLines={3}>
                    {city.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            
            {filteredCities.length === 0 && !loading && (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: textColor }]}>
                  Aucune ville trouvée pour ce pays.
                </Text>
                <Text style={[styles.emptySubtext, { color: textColor }]}>
                  Notre base de données s'enrichit régulièrement !
                </Text>
              </View>
            )}
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
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
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
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
  },
  cityImage: {
    width: 100,
    height: 80,
  },
  cityInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  cityName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cityPopulation: {
    fontSize: 12,
    marginBottom: 6,
  },
  cityDescription: {
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 16,
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
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});
