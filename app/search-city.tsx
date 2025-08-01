
import { useThemeColor } from '@/hooks/useThemeColor';
import { RealCitiesService } from '@/services/RealCitiesService';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SearchCityScreen() {
  const textColor = useThemeColor({}, 'text');
  const textActiveColor = useThemeColor({}, 'textActive');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'borderColor');
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const params = useLocalSearchParams();
  const favoriteIndex = Number(params.favoriteIndex ?? 0);

  // Recherche des villes via l'API (comme Explore)
  const searchCities = async (query: string) => {
    if (!query.trim()) {
      setCities([]);
      setSearchDone(false);
      return;
    }
    setLoading(true);
    setSearchDone(false);
    try {
      const results = await RealCitiesService.searchCities(query, 50);
      // Filtrer les doublons (même nom, même pays)
      const uniqueCities = [];
      const seen = new Set();
      for (const city of results) {
        const key = `${city.name.toLowerCase()}-${city.country.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueCities.push(city);
        }
      }
      setCities(uniqueCities);
    } catch (error) {
      setCities([]);
    }
    setLoading(false);
    setSearchDone(true);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCities(searchQuery);
    }, 100); // Délai réduit à 100ms pour accélérer le loading
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelect = (city: any) => {
    // Génère le flag unicode à partir du code pays
    let flag = '';
    if (city.countryCode) {
      flag = countryCodeToFlag(city.countryCode);
    }
    // Navigation vers le profil avec push, puis replace pour nettoyer l'URL
    const paramsObj = {
      favoriteIndex: String(favoriteIndex),
      city: city.name,
      country: city.country,
      flag: flag || '',
      countryCode: city.countryCode ? city.countryCode.toLowerCase() : '',
    };
    console.log('NAVIGATE TO PROFILE WITH:', paramsObj);
    router.push({ pathname: '/(tabs)/profile', params: paramsObj });
    setTimeout(() => {
      router.replace('/(tabs)/profile');
    }, 500);
  };

  // Utilitaire pour convertir un code pays en drapeau unicode
  function countryCodeToFlag(code: string) {
    return code
      .toUpperCase()
      .replace(/./g, char =>
        String.fromCodePoint(127397 + char.charCodeAt(0))
      );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}> 
      <TextInput
        style={[styles.input, { color: textColor, borderColor: borderColor }]}
        placeholder="Rechercher une ville..."
        placeholderTextColor={`${textColor}80`}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {loading && searchQuery.length > 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={textActiveColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Recherche en cours...</Text>
        </View>
      )}
      {/* Liste des villes */}
      {!loading && cities.length > 0 && (
        <View style={styles.citiesList}>
          {cities.map((city, index) => (
            <TouchableOpacity
              key={`${city.name}-${city.country}-${index}`}
              style={styles.cityCard}
              onPress={() => handleSelect(city)}
            >
              <Image
                source={{ uri: `https://flagcdn.com/w80/${city.countryCode?.toLowerCase() || city.country?.toLowerCase() || ''}.png` }}
                style={styles.countryFlag}
                resizeMode="cover"
              />
              <View style={styles.cityTextInfo}>
                <Text style={[styles.cityName, { color: '#FFFFFF' }]}>{city.name}</Text>
                <Text style={[styles.countryName, { color: '#CCCCCC' }]}>{city.country}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {/* Message si aucune ville trouvée */}
      {searchQuery.trim().length > 0 && !loading && searchDone && cities.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: textColor }]}>Aucune ville trouvée pour "{searchQuery}"</Text>
        </View>
      )}
      {/* Instructions initiales */}
      {searchQuery.length === 0 && (
        <View style={styles.instructionContainer}>
          <Text style={[styles.instructionText, { color: textColor }]}>Tapez le nom d'une ville pour commencer votre recherche</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
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
  citiesList: {
    paddingBottom: 70,
    paddingTop: 10,
  },
  cityCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 0.7,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
});
