
import { useThemeColor } from '@/hooks/useThemeColor';
import { RealCitiesService } from '@/services/RealCitiesService';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SearchCityScreen() {
  const textColor = useThemeColor({}, 'text');
  const textActiveColor = useThemeColor({}, 'textActive');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'borderColor');
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();
  const favoriteIndex = Number(params.favoriteIndex ?? 0);

  // Recherche des villes via l'API (comme Explore)
  const searchCities = async (query: string) => {
    if (!query.trim()) {
      setCities([]);
      return;
    }
    setLoading(true);
    try {
      const results = await RealCitiesService.searchCities(query, 50);
      setCities(results);
    } catch (error) {
      setCities([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCities(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelect = (city: any) => {
    // Génère le flag unicode à partir du code pays
    let flag = '';
    if (city.countryCode) {
      flag = countryCodeToFlag(city.countryCode);
    }
    // Retourne sur la page précédente (profil) avec les params de la ville sélectionnée
    router.replace({
      pathname: '/(tabs)/profile',
      params: {
        favoriteIndex: String(favoriteIndex),
        city: city.name,
        country: city.country,
        flag: flag || '',
      },
    });
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
        style={[styles.input, { color: textColor, borderColor: '#333' }]}
        placeholder="Rechercher une ville ou un pays"
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {loading && searchQuery.length > 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={textActiveColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Recherche en cours...</Text>
        </View>
      )}
      {!loading && cities.length > 0 && (
        <ScrollView style={styles.citiesList}>
          {cities.map((city, index) => (
            <TouchableOpacity
              key={`${city.name}-${city.country}-${index}`}
              style={[styles.card, { backgroundColor: '#232323' }]}
              onPress={() => handleSelect(city)}
            >
              <Image
                source={{ uri: `https://flagcdn.com/w80/${city.countryCode?.toLowerCase() || ''}.png` }}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.info}>
                <Text style={[styles.city, { color: textColor }]}>{city.name}</Text>
                <Text style={[styles.country, { color: textColor }]}>{city.country}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      {!loading && cities.length === 0 && searchQuery.length > 0 && (
        <Text style={{ color: textColor, textAlign: 'center', marginTop: 40 }}>Aucune ville trouvée</Text>
      )}
      {searchQuery.length === 0 && (
        <View style={styles.instructionContainer}>
          <Text style={[styles.instructionText, { color: textColor }]}>Tape le nom d'une ville pour commencer ta recherche</Text>
          <Text style={[styles.instructionSubtext, { color: textColor }]}>Plus de 154 000 villes disponibles dans le monde</Text>
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
    paddingBottom: 15,
    paddingTop: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232323',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  image: {
    width: 60,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  city: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  country: {
    fontSize: 14,
    opacity: 0.7,
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
