import { router } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useVisitedCities } from '../contexts/VisitedCitiesContext';
import { useThemeColor } from '../hooks/useThemeColor';


export default function MyCitiesScreen() {
  const navigation = require('expo-router').useNavigation();
  React.useLayoutEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);
  const { cities: visitedCities } = useVisitedCities();
  React.useEffect(() => {
    console.log('[MyCities] visitedCities state:', visitedCities);
  }, [visitedCities]);
  const textColor = useThemeColor({}, 'text');
  // Calcul instantané des villes à afficher à chaque render
  const displayCities = React.useMemo(() => {
    const validCities = visitedCities.filter(city => typeof city.name === 'string' && city.name.length > 0 && city.country);
    type GroupedCity = {
      name: string;
      country: string;
      ratings: number[];
      manualCount: number;
      postCount: number;
      hasBeenThere: boolean;
    };
    const groupedCities: { [key: string]: GroupedCity } = {};
    validCities.forEach(city => {
      const key = `${city.name}-${city.country}`;
      if (!groupedCities[key]) {
        groupedCities[key] = {
          name: city.name,
          country: city.country,
          ratings: [],
          manualCount: 0,
          postCount: 0,
          hasBeenThere: false,
        };
      }
      if (city.rating !== undefined && city.rating !== null) {
        groupedCities[key].ratings.push(Number(city.rating));
        if (city.source === 'note' || city.source === undefined) {
          groupedCities[key].manualCount += 1;
        }
        if (city.source === 'post') {
          groupedCities[key].postCount += 1;
        }
      } else if (city.source === 'post') {
        groupedCities[key].postCount += 1;
      }
      if (city.beenThere) {
        groupedCities[key].hasBeenThere = true;
      }
    });
    return Object.values(groupedCities).map((city: GroupedCity) => {
      const averageRating = city.ratings.length > 0 ? (city.ratings.reduce((a, b) => a + b, 0) / city.ratings.length) : null;
      let sourceText = '';
      if (city.manualCount > 0 && city.postCount > 0) {
        sourceText = `(based on ${city.manualCount} rating${city.manualCount > 1 ? 's' : ''} and ${city.postCount} post${city.postCount > 1 ? 's' : ''})`;
      } else if (city.manualCount > 0) {
        sourceText = `(based on ${city.manualCount} rating${city.manualCount > 1 ? 's' : ''})`;
      } else if (city.postCount > 0) {
        sourceText = `(based on ${city.postCount} post${city.postCount > 1 ? 's' : ''})`;
      } else if (city.hasBeenThere) {
        sourceText = `(been there)`;
      }
      return {
        ...city,
        averageRating,
        sourceText,
      };
    });
  }, [visitedCities]);

  return (
    <View style={{ flex: 1, backgroundColor: '#181C24', paddingTop: 56 }}>
      {/* Header style notifications (back only, no title) */}
      <View style={[styles.header, { backgroundColor: '#181C24' }]}> 
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 0.5, backgroundColor: 'rgba(255,255,255,0.3)', width: '100%' }} />
      {displayCities.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{ color: textColor, opacity: 0.7, fontSize: 16, textAlign: 'center' }}>
            You haven't added any cities yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayCities}
          key={visitedCities.length}
          keyExtractor={(item, idx) => `${item.name || 'city'}-${item.country || 'country'}-${idx}`}
          renderItem={({ item: city }) => (
            <View style={styles.cityCard}>
              <Image
                source={{ uri: `https://flagcdn.com/w80/${city.country.toLowerCase()}.png` }}
                style={styles.flag}
                resizeMode="cover"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.cityName}>{city.name}</Text>
                {city.averageRating !== null ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.cityRating}>★ {city.averageRating.toFixed(1)}/5</Text>
                    {city.sourceText && (
                      <Text style={styles.citySourceGray}>{city.sourceText}</Text>
                    )}
                  </View>
                ) : (
                  <Text style={styles.cityBeenThere}>I have been there</Text>
                )}
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: '#232323',
    width: '100%',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    justifyContent: 'center',
    height: 40,
    minWidth: 80,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)', // Fond très léger, effet bouton classe (comme explore)
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.7,
    borderColor: 'rgba(255,255,255,0.18)', // Bordure très fine et subtile (comme explore)
    // Optionnel : effet d'ombre léger pour le relief
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
  },
  flag: {
    width: 32,
    height: 22,
    borderRadius: 3,
    marginRight: 12,
  },
  cityName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  cityRating: {
    color: '#FFD700',
    fontSize: 13,
  },
  cityBeenThere: {
    color: '#bbb',
    fontSize: 12,
    fontStyle: 'italic',
  },
  cityPost: {
    color: '#2051A4',
    fontSize: 13,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  citySourceGray: {
    color: '#bbb',
    fontSize: 13,
    fontStyle: 'italic',
    marginLeft: 4,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
