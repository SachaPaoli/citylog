import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Données des pays et villes pour la recherche
const countriesData = {
  'France': ['Paris', 'Lyon', 'Marseille', 'Nice', 'Toulouse', 'Bordeaux', 'Lille', 'Nantes'],
  'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Malaga', 'Zaragoza'],
  'Italy': ['Rome', 'Milan', 'Naples', 'Turin', 'Florence', 'Venice', 'Bologna', 'Genoa'],
  'Germany': ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt', 'Stuttgart', 'Dresden'],
  'UK': ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Edinburgh', 'Glasgow', 'Bristol'],
  'USA': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio'],
  'Canada': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg'],
  'Japan': ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle'],
  'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte'],
};

export default function ExploreScreen() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const beigeColor = '#D4B896';
  
  const [activeTab, setActiveTab] = useState<'places' | 'members'>('places');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  // Filtrer les pays selon la recherche
  const filteredCountries = Object.keys(countriesData)
    .filter(country => 
      country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      countriesData[country as keyof typeof countriesData].some(city => 
        city.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .sort();

  const toggleCountry = (country: string) => {
    setExpandedCountry(expandedCountry === country ? null : country);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { color: textColor, borderColor: beigeColor }]}
          placeholder="Rechercher des lieux ou membres..."
          placeholderTextColor={`${beigeColor}80`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Onglets Places / Members */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'places' && { borderBottomColor: beigeColor }]}
          onPress={() => setActiveTab('places')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'places' ? beigeColor : textColor }]}>
            Places
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'members' && { borderBottomColor: beigeColor }]}
          onPress={() => setActiveTab('members')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'members' ? beigeColor : textColor }]}>
            Members
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenu selon l'onglet sélectionné */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'places' ? (
          <View style={styles.placesContent}>
            {filteredCountries.map((country) => (
              <View key={country} style={styles.countrySection}>
                <TouchableOpacity 
                  style={styles.countryHeader}
                  onPress={() => toggleCountry(country)}
                >
                  <Text style={[styles.countryName, { color: textColor }]}>
                    🌍 {country}
                  </Text>
                  <Text style={[styles.expandIcon, { color: beigeColor }]}>
                    {expandedCountry === country ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>
                
                {expandedCountry === country && (
                  <View style={styles.citiesContainer}>
                    {countriesData[country as keyof typeof countriesData]
                      .filter(city => 
                        searchQuery === '' || 
                        city.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((city) => (
                        <TouchableOpacity 
                          key={city}
                          style={styles.cityItem}
                        >
                          <Text style={[styles.cityName, { color: textColor }]}>
                            📍 {city}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          /* Contenu Members */
          <View style={styles.membersContent}>
            <Text style={[styles.membersTitle, { color: textColor }]}>
              👥 Membres CityLog
            </Text>
            <View style={styles.membersPlaceholder}>
              <Text style={[styles.membersText, { color: textColor }]}>
                Ici tu pourras rechercher et découvrir d'autres voyageurs !
              </Text>
              <Text style={[styles.membersSubtext, { color: textColor }]}>
                Fonctionnalité à venir... 🚀
              </Text>
            </View>
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  placesContent: {
    paddingBottom: 20,
  },
  countrySection: {
    marginBottom: 15,
  },
  countryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(212, 184, 150, 0.1)',
    borderRadius: 10,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  citiesContainer: {
    marginTop: 10,
    paddingLeft: 15,
  },
  cityItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 5,
    backgroundColor: 'rgba(212, 184, 150, 0.05)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#D4B896',
  },
  cityName: {
    fontSize: 15,
  },
  membersContent: {
    alignItems: 'center',
    paddingTop: 40,
  },
  membersTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  membersPlaceholder: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  membersText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
  },
  membersSubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});
