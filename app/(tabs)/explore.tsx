import { SimpleCityRatingModal } from '@/components/SimpleCityRatingModal';
import { UserSearchCard } from '@/components/UserSearchCard';
import { useThemeColor } from '@/hooks/useThemeColor';
import { RealCitiesGeoNamesService } from '@/services/RealCitiesGeoNamesService'; // Nouveau service GeoNames
import { UserSearchResult, UserSearchService } from '@/services/UserSearchService';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVisitedCities } from '../../contexts/VisitedCitiesContext';

import { useRouter } from 'expo-router';

export default function ExploreScreen() {
  const router = useRouter();
  // Ajout d'un état pour savoir si la recherche a été effectuée (évite le clignotement)
  const [searchDone, setSearchDone] = useState(false);
  const { addOrUpdateCity, removeCity, removeCitySource, cities: visitedCities } = useVisitedCities();
  const textColor = useThemeColor({}, 'text');
  const textActiveColor = useThemeColor({}, 'textActive');
  const backgroundColor = useThemeColor({}, 'background');
  const buttonBackgroundColor = useThemeColor({}, 'buttonBackground');
  const borderColor = useThemeColor({}, 'borderColor');
  const headerColor = '#181C24'; // Electric dark gray

  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState<any[]>([]);
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'cities' | 'members'>('cities');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Animations pour le sliding - comme dans index
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const tabIndicatorAnim = React.useRef(new Animated.Value(0)).current;

  // Fonction pour normaliser les chaînes (insensible à la casse et aux accents)
  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-z0-9\s]/g, '') // Garde seulement lettres, chiffres et espaces
      .trim();
  };

  // Rechercher des villes avec l'API GeoNames (500+ habitants)
  const searchCities = async (query: string) => {
    if (!query.trim()) {
      setCities([]);
      setSearchDone(false);
      return;
    }

    setLoading(true);
    setSearchDone(false);
    try {
      console.log(`🔍 Recherche GeoNames pour: "${query}"`);
      const results = await RealCitiesGeoNamesService.searchCities(query, 50);
      
      console.log(`✅ Trouvé ${results.length} villes pour: ${query}`);
      setCities(results);
    } catch (error) {
      console.error('❌ Erreur recherche GeoNames:', error);
      setCities([]);
    }
    setLoading(false);
    setSearchDone(true);
  };

  // Rechercher des utilisateurs
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      // Si pas de recherche, charger quelques utilisateurs populaires
      setUserLoading(true);
      try {
        const popularUsers = await UserSearchService.getPopularUsers(15);
        console.log(`Utilisateurs populaires chargés: ${popularUsers.length}`);
        setUsers(popularUsers);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs populaires:', error);
        setUsers([]);
      }
      setUserLoading(false);
      return;
    }

    setUserLoading(true);
    try {
      console.log(`🔍 Recherche d'utilisateurs pour: "${query}"`);
      const results = await UserSearchService.searchUsersByName(query, 20);
      console.log(`✅ Trouvé ${results.length} utilisateurs:`, results.map(u => u.displayName));
      setUsers(results);
    } catch (error) {
      console.error('Erreur recherche utilisateurs:', error);
      setUsers([]);
    }
    setUserLoading(false);
  };

  // Recherche automatique quand on tape
  useEffect(() => {
    // Recherche instantanée sans délai
    if (activeTab === 'cities') {
      searchCities(searchQuery);
    } else if (activeTab === 'members') {
      searchUsers(searchQuery);
    }
  }, [searchQuery, activeTab]);

  // Charger des utilisateurs populaires au démarrage
  useEffect(() => {
    if (activeTab === 'members') {
      searchUsers(''); // Chargera les utilisateurs populaires
    }
  }, [activeTab]);

  // Injecte le rating et beenThere du contexte dans la modale
  const handleCityPress = (city: any) => {
    router.push({
      pathname: '/city-detail',
      params: {
        city: city.name,
        country: city.country,
        countryCode: city.countryCode,
        flag: city.flag,
        population: city.population,
      },
    });
  };

  // Ajout/MAJ/Suppression d'une ville visitée ou notée
  const handleRateCity = (cityId: number, rating: number | null | undefined) => {
    if (!selectedCity) return;
    if (!rating || rating < 1) {
      // Always remove only the manual note/rating (source 'note')
      removeCitySource(selectedCity.name, selectedCity.country, 'note');
      setModalVisible(false);
      return;
    }
    addOrUpdateCity({
      name: selectedCity.name,
      country: selectedCity.country,
      flag: '',
      rating,
      beenThere: true,
      source: 'note',
    });
    setModalVisible(false);
  };

  const handleBeenThere = () => {
    if (!selectedCity) return;
    // Si déjà beenThere, on retire complètement la ville
    if (selectedCity.beenThere) {
      removeCity(selectedCity.name, selectedCity.country);
      setModalVisible(false);
      return;
    }
    // Sinon, on ajoute/MAJ la ville comme visitée
    addOrUpdateCity({
      name: selectedCity.name,
      country: selectedCity.country,
      flag: '',
      rating: selectedCity.userRating ?? undefined,
      beenThere: true,
    });
    setTimeout(() => {
      setModalVisible(false);
    }, 800);
  };

  // Fonction de changement d'onglet avec slide - comme dans index
  const switchTab = (tab: 'cities' | 'members') => {
    if (tab === activeTab) return;
    
    const screenWidth = Dimensions.get('window').width;
    const targetSlideValue = tab === 'cities' ? 0 : -screenWidth;
    const targetIndicatorValue = tab === 'cities' ? 0 : screenWidth / 2;
    
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: targetSlideValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(tabIndicatorAnim, {
        toValue: targetIndicatorValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    setActiveTab(tab);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[styles.container, { backgroundColor: headerColor }]}> 
      {/* Error message overlay always at the top, above all content */}
      {showError && errorMessage && (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 48, alignItems: 'center', zIndex: 99999, elevation: 99 }} pointerEvents="box-none">
          <View style={{ backgroundColor: '#fff', borderRadius: 16, paddingVertical: 18, paddingHorizontal: 24, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, elevation: 99, flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 260, maxWidth: '90%' }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FF4C4C', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>!</Text>
            </View>
            <Text style={{ color: '#181C24', fontWeight: 'bold', fontSize: 16, flex: 1 }}>
              {errorMessage}
            </Text>
          </View>
        </View>
      )}
      {/* ...existing code... */}
      
  

      <View style={{ backgroundColor: '#181C24', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4, marginTop: 12 }}>
        <View style={{ position: 'relative', justifyContent: 'center' }}>
          <TextInput
            style={{
              width: '100%',
              borderWidth: 1,
              borderRadius: 8,
              padding: 12,
              paddingRight: 36,
              fontSize: 16,
              color: textColor,
              borderColor: borderColor,
              backgroundColor: 'rgba(255,255,255,0.04)',
            }}
            placeholder="Rechercher une ville..."
            placeholderTextColor={`${textColor}80`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery(''); // Efface seulement le texte, garde les onglets ouverts
              }} 
              style={{ position: 'absolute', right: 10, top: 0, height: '100%', justifyContent: 'center', alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Onglets avec sliding indicator - comme dans index */}
      <View 
        style={[
          styles.tabsContainer, 
          { 
            backgroundColor: headerColor,
            paddingTop: 0, 
            paddingBottom: 0, 
            borderBottomWidth: 1, 
            borderBottomColor: 'rgba(255,255,255,0.2)'
          }
        ]}
      > 
        <View style={{ flexDirection: 'row', position: 'relative', width: '100%' }}>
          <TouchableOpacity
            style={[styles.tab]}
            onPress={() => switchTab('cities')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'cities' ? '#FFFFFF' : '#888' }
            ]}>
              Cities
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab]}
            onPress={() => switchTab('members')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'members' ? '#FFFFFF' : '#888' }
            ]}>
              Members
            </Text>
          </TouchableOpacity>

          {/* Barre blanche de sélection animée */}
          <Animated.View 
            style={[
              styles.tabIndicator,
              { transform: [{ translateX: tabIndicatorAnim }] }
            ]} 
          />
        </View>
      </View>

      {/* Ligne de séparation */}
      <View 
        style={{ 
          backgroundColor: '#181C24', 
          borderBottomWidth: 1, 
          borderBottomColor: 'rgba(255, 255, 255, 0.2)',
        }} 
      />

      {/* Contenu avec sliding animation */}
      <Animated.View 
        style={[
          styles.slidingContent,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        {/* Onglet Cities */}
        <ScrollView 
          style={[styles.tabContentSlide, { backgroundColor: headerColor }]} 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View>
                {loading && searchQuery.length > 0 && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={textActiveColor} />
                    <Text style={[styles.loadingText, { color: textColor }]}> 
                      Recherche en cours...
                    </Text>
                  </View>
                )}

                {/* ...existing code... */}
                {!loading && cities.length > 0 && (
              <View style={styles.citiesList}>
                {cities.map((city, index) => {
                  // ...existing code...
                  const countryNamesEn: Record<string, string> = {
                    AF: 'Afghanistan', AL: 'Albania', DZ: 'Algeria', AS: 'American Samoa', AD: 'Andorra', AO: 'Angola', AI: 'Anguilla', AQ: 'Antarctica', AG: 'Antigua and Barbuda', AR: 'Argentina', AM: 'Armenia', AW: 'Aruba', AU: 'Australia', AT: 'Austria', AZ: 'Azerbaijan', BS: 'Bahamas', BH: 'Bahrain', BD: 'Bangladesh', BB: 'Barbados', BY: 'Belarus', BE: 'Belgium', BZ: 'Belize', BJ: 'Benin', BM: 'Bermuda', BT: 'Bhutan', BO: 'Bolivia', BA: 'Bosnia and Herzegovina', BW: 'Botswana', BV: 'Bouvet Island', BR: 'Brazil', IO: 'British Indian Ocean Territory', BN: 'Brunei Darussalam', BG: 'Bulgaria', BF: 'Burkina Faso', BI: 'Burundi', KH: 'Cambodia', CM: 'Cameroon', CA: 'Canada', CV: 'Cape Verde', KY: 'Cayman Islands', CF: 'Central African Republic', TD: 'Chad', CL: 'Chile', CN: 'China', CX: 'Christmas Island', CC: 'Cocos (Keeling) Islands', CO: 'Colombia', KM: 'Comoros', CG: 'Congo', CD: 'Congo, Democratic Republic', CK: 'Cook Islands', CR: 'Costa Rica', CI: 'Côte d’Ivoire', HR: 'Croatia', CU: 'Cuba', CY: 'Cyprus', CZ: 'Czech Republic', DK: 'Denmark', DJ: 'Djibouti', DM: 'Dominica', DO: 'Dominican Republic', EC: 'Ecuador', EG: 'Egypt', SV: 'El Salvador', GQ: 'Equatorial Guinea', ER: 'Eritrea', EE: 'Estonia', ET: 'Ethiopia', FK: 'Falkland Islands', FO: 'Faroe Islands', FJ: 'Fiji', FI: 'Finland', FR: 'France', GF: 'French Guiana', PF: 'French Polynesia', TF: 'French Southern Territories', GA: 'Gabon', GM: 'Gambia', GE: 'Georgia', DE: 'Germany', GH: 'Ghana', GI: 'Gibraltar', GR: 'Greece', GL: 'Greenland', GD: 'Grenada', GP: 'Guadeloupe', GU: 'Guam', GT: 'Guatemala', GG: 'Guernsey', GN: 'Guinea', GW: 'Guinea-Bissau', GY: 'Guyana', HT: 'Haiti', HM: 'Heard Island and McDonald Islands', VA: 'Holy See', HN: 'Honduras', HK: 'Hong Kong', HU: 'Hungary', IS: 'Iceland', IN: 'India', ID: 'Indonesia', IR: 'Iran', IQ: 'Iraq', IE: 'Ireland', IM: 'Isle of Man', IL: 'Israel', IT: 'Italy', JM: 'Jamaica', JP: 'Japan', JE: 'Jersey', JO: 'Jordan', KZ: 'Kazakhstan', KE: 'Kenya', KI: 'Kiribati', KP: 'Korea, Democratic People’s Republic', KR: 'Korea, Republic', KW: 'Kuwait', KG: 'Kyrgyzstan', LA: 'Lao People’s Democratic Republic', LV: 'Latvia', LB: 'Lebanon', LS: 'Lesotho', LR: 'Liberia', LY: 'Libya', LI: 'Liechtenstein', LT: 'Lithuania', LU: 'Luxembourg', MO: 'Macao', MK: 'Macedonia', MG: 'Madagascar', MW: 'Malawi', MY: 'Malaysia', MV: 'Maldives', ML: 'Mali', MT: 'Malta', MH: 'Marshall Islands', MQ: 'Martinique', MR: 'Mauritania', MU: 'Mauritius', YT: 'Mayotte', MX: 'Mexico', FM: 'Micronesia', MD: 'Moldova', MC: 'Monaco', MN: 'Mongolia', ME: 'Montenegro', MS: 'Montserrat', MA: 'Morocco', MZ: 'Mozambique', MM: 'Myanmar', NA: 'Namibia', NR: 'Nauru', NP: 'Nepal', NL: 'Netherlands', NC: 'New Caledonia', NZ: 'New Zealand', NI: 'Nicaragua', NE: 'Niger', NG: 'Nigeria', NU: 'Niue', NF: 'Norfolk Island', MP: 'Northern Mariana Islands', NO: 'Norway', OM: 'Oman', PK: 'Pakistan', PW: 'Palau', PS: 'Palestine', PA: 'Panama', PG: 'Papua New Guinea', PY: 'Paraguay', PE: 'Peru', PH: 'Philippines', PN: 'Pitcairn', PL: 'Poland', PT: 'Portugal', PR: 'Puerto Rico', QA: 'Qatar', RE: 'Réunion', RO: 'Romania', RU: 'Russia', RW: 'Rwanda', BL: 'Saint Barthélemy', SH: 'Saint Helena', KN: 'Saint Kitts and Nevis', LC: 'Saint Lucia', MF: 'Saint Martin', PM: 'Saint Pierre and Miquelon', VC: 'Saint Vincent and the Grenadines', WS: 'Samoa', SM: 'San Marino', ST: 'Sao Tome and Principe', SA: 'Saudi Arabia', SN: 'Senegal', RS: 'Serbia', SC: 'Seychelles', SL: 'Sierra Leone', SG: 'Singapore', SX: 'Sint Maarten', SK: 'Slovakia', SI: 'Slovenia', SB: 'Solomon Islands', SO: 'Somalia', ZA: 'South Africa', GS: 'South Georgia and the South Sandwich Islands', SS: 'South Sudan', ES: 'Spain', LK: 'Sri Lanka', SD: 'Sudan', SR: 'Suriname', SJ: 'Svalbard and Jan Mayen', SZ: 'Swaziland', SE: 'Sweden', CH: 'Switzerland', SY: 'Syrian Arab Republic', TW: 'Taiwan', TJ: 'Tajikistan', TZ: 'Tanzania', TH: 'Thailand', TL: 'Timor-Leste', TG: 'Togo', TK: 'Tokelau', TO: 'Tonga', TT: 'Trinidad and Tobago', TN: 'Tunisia', TR: 'Turkey', TM: 'Turkmenistan', TC: 'Turks and Caicos Islands', TV: 'Tuvalu', UG: 'Uganda', UA: 'Ukraine', AE: 'United Arab Emirates', GB: 'United Kingdom', US: 'United States', UM: 'United States Minor Outlying Islands', UY: 'Uruguay', UZ: 'Uzbekistan', VU: 'Vanuatu', VE: 'Venezuela', VN: 'Vietnam', VG: 'Virgin Islands, British', VI: 'Virgin Islands, U.S.', WF: 'Wallis and Futuna', EH: 'Western Sahara', YE: 'Yemen', ZM: 'Zambia', ZW: 'Zimbabwe'
                  };
                  let countryDisplay = city.countryFull || city.country;
                  if (city.countryCode && countryNamesEn[city.countryCode.toUpperCase()]) {
                    countryDisplay = countryNamesEn[city.countryCode.toUpperCase()];
                  }
                  return (
                    <TouchableOpacity
                      key={`${city.name}-${city.country}-${index}`}
                      style={styles.cityCard}
                      onPress={() => handleCityPress(city)}
                    >
                      <Image
                        source={{ uri: `https://flagcdn.com/w80/${city.countryCode ? city.countryCode.toLowerCase() : city.country.toLowerCase()}.png` }}
                        style={styles.countryFlag}
                        resizeMode="cover"
                      />
                      <View style={styles.cityTextInfo}>
                        <Text style={[styles.cityName, { color: '#FFFFFF' }]}> 
                          {city.name}
                        </Text>
                        <Text style={[styles.countryName, { color: '#CCCCCC' }]}> 
                          {countryDisplay}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* ...existing code... */}
            {searchQuery.trim().length > 0 && !loading && searchDone && cities.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: textColor }]}> 
                  Aucune ville trouvée pour "{searchQuery}"
                </Text>
              </View>
            )}

            {/* ...existing code... */}
            {searchQuery.length === 0 && (
              <View style={styles.instructionContainer}>
                <Text style={[styles.instructionText, { color: textColor }]}> 
                  Tapez le nom d'une ville pour commencer votre recherche
                </Text>
              </View>
            )}
          </View>
          </View>
        </ScrollView>

        {/* Onglet Members */}
        <ScrollView 
          style={[styles.tabContentSlide, { backgroundColor: headerColor }]} 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={{ flex: 1 }}>
              {users.length > 0 ? (
                <View style={{ paddingTop: 16 }}>
                  {users.map((user) => (
                    <UserSearchCard key={user.uid} user={user} />
                  ))}
                </View>
              ) : searchQuery.trim() === '' && !userLoading ? (
                <View style={styles.instructionContainer}>
                  <Text style={[styles.instructionText, { color: textColor }]}> 
                    Rechercher des voyageurs
                  </Text>
                  <Text style={[styles.instructionSubtext, { color: textColor }]}> 
                    Utilisez la barre de recherche pour trouver d'autres utilisateurs
                  </Text>
                </View>
              ) : searchQuery.trim() !== '' && !userLoading && users.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: textColor }]}>
                    Aucun utilisateur trouvé
                  </Text>
                  <Text style={[styles.instructionSubtext, { color: textColor }]}>
                    Essayez un autre terme de recherche
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      {/* ...existing code... */}
      <SimpleCityRatingModal
        visible={modalVisible}
        city={selectedCity}
        onClose={() => setModalVisible(false)}
        onRate={handleRateCity}
        onBeenThere={(city) => {
          if (!city) return;
          // Si la ville a une note manuelle, afficher le message d'erreur et ne rien changer
          const manualNote = visitedCities.find(
            c => (c.name === city.name || c.city === city.name) && c.country === city.country && c.source === 'note' && typeof c.rating === 'number'
          );
          if (manualNote) {
            setErrorMessage(`Delete your rating first if you want to delete "${city.name}" from your cities`);
            setShowError(true);
            setTimeout(() => {
              setShowError(false);
              setErrorMessage(null);
            }, 5000);
            return;
          }
          // Si déjà beenThere, on retire complètement la ville
          if (city.beenThere) {
            removeCity(city.name, city.country);
            return;
          }
          // Sinon, on ajoute/MAJ la ville comme visitée
          addOrUpdateCity({
            name: city.name,
            country: city.country,
            flag: '',
            rating: city.userRating ?? undefined,
            beenThere: true,
            source: 'note',
          });
          // NE FERME PLUS LA MODALE
        }}
        onDelete={(city) => {
          if (!city) return;
          // Always remove only the manual note/rating (source 'note')
          removeCitySource(city.name, city.country, 'note');
          setModalVisible(false);
        }}
      />
    </SafeAreaView>
    </TouchableWithoutFeedback>
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
    paddingHorizontal: 0,
    paddingBottom: 12,
    position: 'relative',
    paddingVertical: 15,
  },
  tab: {
    width: Dimensions.get('window').width / 2,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: Dimensions.get('window').width / 2,
    height: 2,
    backgroundColor: '#FFFFFF',
  },
  slidingContent: {
    flexDirection: 'row',
    width: Dimensions.get('window').width * 2,
    flex: 1,
  },
  tabContentSlide: {
    width: Dimensions.get('window').width,
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
    paddingBottom: 70, // Encore plus de padding pour garantir la visibilité
    paddingTop: 10,
  },
  cityCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 0.7,
    borderColor: 'rgba(255,255,255,0.18)', // Bordure très fine et subtile
    backgroundColor: 'rgba(255,255,255,0.04)', // Fond très léger, effet bouton classe
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    // Optionnel : effet d'ombre léger pour le relief
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
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
