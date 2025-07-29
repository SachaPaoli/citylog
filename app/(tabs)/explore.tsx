import { SimpleCityRatingModal } from '@/components/SimpleCityRatingModal';
import { StarRating } from '@/components/StarRating';
import { useThemeColor } from '@/hooks/useThemeColor';
import { RealCitiesService } from '@/services/RealCitiesService';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const textColor = useThemeColor({}, 'text');
  const textActiveColor = useThemeColor({}, 'textActive');
  const backgroundColor = useThemeColor({}, 'background');
  const buttonBackgroundColor = useThemeColor({}, 'buttonBackground');
  const borderColor = useThemeColor({}, 'borderColor');
  const headerColor = '#2A2A2A'; // Gris très foncé comme la page d'accueil
  
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'cities' | 'members'>('cities');
  
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
    <SafeAreaView style={[styles.container, { backgroundColor: headerColor }]}>
      {/* Barre de recherche */}
      <View style={[styles.searchContainer, { backgroundColor: headerColor }]}>
        <TextInput
          style={[styles.searchInput, { color: textColor, borderColor: borderColor }]}
          placeholder="Rechercher une ville..."
          placeholderTextColor={`${textColor}80`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Onglets */}
      <View style={[styles.tabsContainer, { backgroundColor: headerColor }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'cities' && styles.activeTab
          ]}
          onPress={() => setActiveTab('cities')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'cities' ? '#FFFFFF' : textColor }
          ]}>
            Cities
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'members' && styles.activeTab
          ]}
          onPress={() => setActiveTab('members')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'members' ? '#FFFFFF' : textColor }
          ]}>
            Members
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenu principal */}
      <ScrollView style={[styles.content, { backgroundColor }]} showsVerticalScrollIndicator={false}>
        {activeTab === 'cities' && (
          <>
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
                    style={[styles.cityCard, { backgroundColor: '#3A3A3A', borderColor: '#555' }]}
                    onPress={() => handleCityPress(city)}
                  >
                    <Image
                      source={{ uri: `https://flagcdn.com/w80/${city.country.toLowerCase()}.png` }}
                      style={styles.countryFlag}
                      resizeMode="cover"
                    />
                    <View style={styles.cityTextInfo}>
                      <Text style={[styles.cityName, { color: '#FFFFFF' }]}>
                        {city.name}
                      </Text>
                      <Text style={[styles.countryName, { color: '#CCCCCC' }]}>
                        {city.country}
                      </Text>
                    </View>
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
          </>
        )}

        {activeTab === 'members' && (
          <View style={styles.instructionContainer}>
            <Text style={[styles.instructionText, { color: textColor }]}>
              Section Members
            </Text>
            <Text style={[styles.instructionSubtext, { color: textColor }]}>
              Fonctionnalité à venir...
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
    paddingBottom: 12,
    paddingTop: 15,
  },
  searchInput: {
    height: 38,
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: 'rgba(212, 184, 150, 0.1)',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
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
    paddingBottom: 15,
    paddingTop: 10,
  },
  cityCard: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  },
  cityName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  countryName: {
    fontSize: 13,
    opacity: 0.8,
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
    width: 28,
    height: 20,
    borderRadius: 3,
    marginRight: 10,
  },
  instructionContainer: {
    alignItems: 'center',
    paddingVertical: 40,
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
