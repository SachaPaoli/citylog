
import { useThemeColor } from '@/hooks/useThemeColor';
import { RealCitiesService } from '@/services/RealCitiesService';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

export default function SearchCityScreen() {
  // Désactive le header natif pour cette page
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);
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
      {/* Nouveau header style my-posts */}
      <View style={{ backgroundColor: '#181C24', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4, marginTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Bouton retour */}
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
            <Text style={{ color: '#fff', fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          {/* Titre centré */}
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 22, textAlign: 'center', flex: 1 }} numberOfLines={1}>Search City</Text>
          {/* Espace à droite */}
          <View style={{ width: 30 }} />
        </View>
        {/* Barre de recherche avec croix à l'intérieur */}
        <View style={{ position: 'relative', justifyContent: 'center', marginTop: 8 }}>
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
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ position: 'absolute', right: 10, top: 0, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {loading && searchQuery.length > 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={textActiveColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Recherche en cours...</Text>
        </View>
      )}
      {/* Liste des villes */}
      {!loading && cities.length > 0 && (
        <ScrollView style={styles.citiesList} contentContainerStyle={{ paddingBottom: 70, paddingTop: 10 }} showsVerticalScrollIndicator={false}>
          {cities.map((city, index) => {
            // Table exhaustive ISO 3166-1 alpha-2 code -> nom anglais
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
                onPress={() => handleSelect(city)}
              >
                <Image
                  source={{ uri: `https://flagcdn.com/w80/${city.countryCode?.toLowerCase() || city.country?.toLowerCase() || ''}.png` }}
                  style={styles.countryFlag}
                  resizeMode="cover"
                />
                <View style={styles.cityTextInfo}>
                  <Text style={[styles.cityName, { color: '#FFFFFF' }]}>{city.name}</Text>
                  <Text style={[styles.countryName, { color: '#CCCCCC' }]}>{countryDisplay}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
