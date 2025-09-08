import { StarRating } from '@/components/StarRating';
import { TravelPostCard } from '@/components/TravelPostCard';
import { getCountryName } from '@/constants/CountryNames';
import { useThemeColor } from '@/hooks/useThemeColor';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Table exhaustive ISO 3166-1 alpha-2 code -> nom anglais
const countryNamesEn: Record<string, string> = {
  AF: 'Afghanistan', AL: 'Albania', DZ: 'Algeria', AS: 'American Samoa', 
  AD: 'Andorra', AO: 'Angola', AI: 'Anguilla', AQ: 'Antarctica', 
  AG: 'Antigua and Barbuda', AR: 'Argentina', AM: 'Armenia', AW: 'Aruba', 
  AU: 'Australia', AT: 'Austria', AZ: 'Azerbaijan', BS: 'Bahamas', 
  BH: 'Bahrain', BD: 'Bangladesh', BB: 'Barbados', BY: 'Belarus',
  BE: 'Belgium', BZ: 'Belize', BJ: 'Benin', BM: 'Bermuda', 
  BT: 'Bhutan', BO: 'Bolivia', BA: 'Bosnia and Herzegovina',
  BW: 'Botswana', BV: 'Bouvet Island', BR: 'Brazil', 
  IO: 'British Indian Ocean Territory', BN: 'Brunei Darussalam',
  BG: 'Bulgaria', BF: 'Burkina Faso', BI: 'Burundi', KH: 'Cambodia', 
  CM: 'Cameroon', CA: 'Canada', CV: 'Cape Verde', KY: 'Cayman Islands', 
  CF: 'Central African Republic', TD: 'Chad', CL: 'Chile', CN: 'China', 
  CX: 'Christmas Island', CC: 'Cocos (Keeling) Islands', CO: 'Colombia', 
  KM: 'Comoros', CG: 'Congo', CD: 'Congo, the Democratic Republic of the',
  CK: 'Cook Islands', CR: 'Costa Rica', CI: 'Cote d\'Ivoire', HR: 'Croatia', 
  CU: 'Cuba', CY: 'Cyprus', CZ: 'Czech Republic', DK: 'Denmark', 
  DJ: 'Djibouti', DM: 'Dominica', DO: 'Dominican Republic', EC: 'Ecuador', 
  EG: 'Egypt', SV: 'El Salvador', GQ: 'Equatorial Guinea', ER: 'Eritrea', 
  EE: 'Estonia', ET: 'Ethiopia', FK: 'Falkland Islands (Malvinas)',
  FO: 'Faroe Islands', FJ: 'Fiji', FI: 'Finland', FR: 'France', 
  GF: 'French Guiana', PF: 'French Polynesia', TF: 'French Southern Territories', 
  GA: 'Gabon', GM: 'Gambia', GE: 'Georgia', DE: 'Germany', GH: 'Ghana',
  GI: 'Gibraltar', GR: 'Greece', GL: 'Greenland', GD: 'Grenada', 
  GP: 'Guadeloupe', GU: 'Guam', GT: 'Guatemala', GG: 'Guernsey', 
  GN: 'Guinea', GW: 'Guinea-Bissau', GY: 'Guyana', HT: 'Haiti', 
  HM: 'Heard Island and McDonald Islands', VA: 'Holy See (Vatican City State)', 
  HN: 'Honduras', HK: 'Hong Kong', HU: 'Hungary', IS: 'Iceland', 
  IN: 'India', ID: 'Indonesia', IR: 'Iran, Islamic Republic of', 
  IQ: 'Iraq', IE: 'Ireland', IM: 'Isle of Man', IL: 'Israel',
  IT: 'Italy', JM: 'Jamaica', JP: 'Japan', JE: 'Jersey', 
  JO: 'Jordan', KZ: 'Kazakhstan', KE: 'Kenya', KI: 'Kiribati',
  KP: 'Korea, Democratic People\'s Republic of', KR: 'Korea, Republic of', 
  KW: 'Kuwait', KG: 'Kyrgyzstan', LA: 'Lao People\'s Democratic Republic', 
  LV: 'Latvia', LB: 'Lebanon', LS: 'Lesotho', LR: 'Liberia',
  LY: 'Libyan Arab Jamahiriya', LI: 'Liechtenstein', LT: 'Lithuania', 
  LU: 'Luxembourg', MO: 'Macao', MK: 'Macedonia, the Former Yugoslav Republic of', 
  MG: 'Madagascar', MW: 'Malawi', MY: 'Malaysia', MV: 'Maldives',
  ML: 'Mali', MT: 'Malta', MH: 'Marshall Islands', MQ: 'Martinique', 
  MR: 'Mauritania', MU: 'Mauritius', YT: 'Mayotte', MX: 'Mexico', 
  FM: 'Micronesia, Federated States of', MD: 'Moldova, Republic of', 
  MC: 'Monaco', MN: 'Mongolia', ME: 'Montenegro', MS: 'Montserrat', 
  MA: 'Morocco', MZ: 'Mozambique', MM: 'Myanmar', NA: 'Namibia', 
  NR: 'Nauru', NP: 'Nepal', NL: 'Netherlands', AN: 'Netherlands Antilles', 
  NC: 'New Caledonia', NZ: 'New Zealand', NI: 'Nicaragua', NE: 'Niger', 
  NG: 'Nigeria', NU: 'Niue', NF: 'Norfolk Island', MP: 'Northern Mariana Islands', 
  NO: 'Norway', OM: 'Oman', PK: 'Pakistan', PW: 'Palau',
  PS: 'Palestinian Territory, Occupied', PA: 'Panama', PG: 'Papua New Guinea', 
  PY: 'Paraguay', PE: 'Peru', PH: 'Philippines', PN: 'Pitcairn', 
  PL: 'Poland', PT: 'Portugal', PR: 'Puerto Rico', QA: 'Qatar', 
  RE: 'Reunion', RO: 'Romania', RU: 'Russian Federation', RW: 'Rwanda', 
  BL: 'Saint Barthelemy', SH: 'Saint Helena', KN: 'Saint Kitts and Nevis', 
  LC: 'Saint Lucia', MF: 'Saint Martin', PM: 'Saint Pierre and Miquelon',
  VC: 'Saint Vincent and the Grenadines', WS: 'Samoa', SM: 'San Marino', 
  ST: 'Sao Tome and Principe', SA: 'Saudi Arabia', SN: 'Senegal', 
  RS: 'Serbia', SC: 'Seychelles', SL: 'Sierra Leone', SG: 'Singapore',
  SK: 'Slovakia', SI: 'Slovenia', SB: 'Solomon Islands', SO: 'Somalia', 
  ZA: 'South Africa', GS: 'South Georgia and the South Sandwich Islands', 
  ES: 'Spain', LK: 'Sri Lanka', SD: 'Sudan', SR: 'Suriname',
  SJ: 'Svalbard and Jan Mayen', SZ: 'Swaziland', SE: 'Sweden', 
  CH: 'Switzerland', SY: 'Syrian Arab Republic', TW: 'Taiwan, Province of China', 
  TJ: 'Tajikistan', TZ: 'Tanzania, United Republic of', TH: 'Thailand',
  TL: 'Timor-Leste', TG: 'Togo', TK: 'Tokelau', TO: 'Tonga', 
  TT: 'Trinidad and Tobago', TN: 'Tunisia', TR: 'Turkey', 
  TM: 'Turkmenistan', TC: 'Turks and Caicos Islands', TV: 'Tuvalu', 
  UG: 'Uganda', UA: 'Ukraine', AE: 'United Arab Emirates', 
  GB: 'United Kingdom', US: 'United States', UM: 'United States Minor Outlying Islands',
  UY: 'Uruguay', UZ: 'Uzbekistan', VU: 'Vanuatu', VE: 'Venezuela', 
  VN: 'Viet Nam', VG: 'Virgin Islands, British', VI: 'Virgin Islands, U.S.', 
  WF: 'Wallis and Futuna', EH: 'Western Sahara', YE: 'Yemen', 
  ZM: 'Zambia', ZW: 'Zimbabwe',
};

// Types
type VisitedCity = {
  name: string;
  country: string;
  countryCode?: string;
  rating?: number;
  source?: string;
  beenThere?: boolean;
};

type GroupedCity = {
  name: string;
  countryCode: string;
  ratings: number[];
  manualCount: number;
  postCount: number;
  hasBeenThere: boolean;
  averageRating?: number | null;
  sourceText?: string;
};

const DRAFT_KEY = 'visited_city_draft';

export default function VisitedCityScreen() {
  // Import posts from your source (adjust path if needed)
  const { posts: allPosts = [] } = require('../../hooks/usePosts').usePosts?.() || {};
  
  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const textActiveColor = useThemeColor({}, 'textActive');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'borderColor');

  // Modal state for viewing posts and rating
  const [showCityModal, setShowCityModal] = useState(false);
  const [modalCity, setModalCity] = useState<any>(null);

  // Helper functions
  function normalize(str: string) {
    if (!str) return "";
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/\u0300-\u036f/g, "") // Remove accents
      .trim();
  }

  function getPostsForCity(cityObj: any) {
    if (!cityObj) return [];
    const cityName = cityObj.city || cityObj.name || "";
    // Try to match country using country, countryName, or countryCode
    let countryName = cityObj.country || cityObj.countryName || cityObj.countryCode || "";
    // If countryCode is used, convert to full country name if possible
    if (countryName.length === 2 && countryNamesEn[countryName]) {
      countryName = countryNamesEn[countryName];
    }
    return allPosts.filter((post: { city?: string; country?: string; }) => {
      const postCity = post.city || "";
      const postCountry = post.country || "";
      return normalize(postCity) === normalize(cityName) &&
             normalize(postCountry) === normalize(countryName);
    });
  }

  // Visited cities tab logic (copied from add-city.tsx)
  const { cities: visitedCities } = require('../../contexts/VisitedCitiesContext').useVisitedCities();
  // Mapping from country name to ISO code for flag display
  const countryCodeToName = countryNamesEn;
  const countryNameToCode = Object.fromEntries(Object.entries(countryNamesEn).map(([code, name]) => [name, code]));

  const displayCities = React.useMemo(() => {
    const validCities = (visitedCities as VisitedCity[]).filter((city: VisitedCity) => typeof city.name === 'string' && city.name.length > 0 && city.country);
    const groupedCities: { [key: string]: GroupedCity } = {};
    validCities.forEach((city: VisitedCity) => {
      let code = city.country.trim();
      if (code.length > 2) {
        code = countryNameToCode[code] || code;
      }
      code = code.toUpperCase();
      const key = `${city.name.trim().toLowerCase()}-${code}`;
      if (!groupedCities[key]) {
        groupedCities[key] = {
          name: city.name,
          countryCode: code,
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
      } else if (city.source === 'note') {
        groupedCities[key].manualCount += 1;
      }
      if (city.beenThere) {
        groupedCities[key].hasBeenThere = true;
      }
    });
    return Object.values(groupedCities).map((city: GroupedCity) => {
      const averageRating = city.ratings.length > 0 ? (city.ratings.reduce((a: number, b: number) => a + b, 0) / city.ratings.length) : null;
      let sourceText = '';
      if (city.manualCount > 0 && city.postCount > 0) {
        const postText = city.postCount === 1 ? '1 post' : `${city.postCount} posts`;
        if (city.ratings.length > 0) {
          sourceText = `based on your rating and ${postText}`;
        } else {
          sourceText = `based on your visit and ${postText}`;
        }
      } else if (city.manualCount > 0) {
        if (city.ratings.length > 0) {
          sourceText = 'based on your rating';
        } else {
          sourceText = 'based on your visit';
        }
      } else if (city.postCount > 0) {
        sourceText = `based on ${city.postCount} post${city.postCount > 1 ? 's' : ''}`;
      } else if (city.hasBeenThere) {
        sourceText = 'been there';
      }
      return {
        ...city,
        averageRating,
        sourceText,
      };
    });
  }, [visitedCities]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: '#181C24' }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: '#181C24' }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: '#fff' }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: '#fff' }]}>
            Visited Cities
          </Text>
          <View style={styles.headerRight}>
            {/* Espace pour équilibrer le header */}
          </View>
        </View>

        {/* Contenu */}
        <View style={styles.visitedCityTab}>
          {displayCities.length === 0 ? (
            <View style={styles.centered}>
              <Text style={{ color: textColor, opacity: 0.7, fontSize: 16, textAlign: 'center' }}>
                You haven't added any cities yet.
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
              {[...displayCities].reverse().map((city, idx) => {
                const isSimpleRating = city.averageRating !== null && city.manualCount === 1 && city.postCount === 0;
                const hasPosts = city.postCount > 0;
                const hasBeenThere = city.hasBeenThere && city.averageRating === null;
                const isClickable = isSimpleRating || hasPosts || hasBeenThere;
                
                const handlePress = () => {
                  if (isSimpleRating) {
                    router.push({
                      pathname: '/trips/create',
                      params: {
                        cityName: city.name,
                        countryName: countryCodeToName[city.countryCode] || city.countryCode,
                        rating: city.averageRating,
                      }
                    });
                  } else if (hasBeenThere) {
                    // For cities with "I have been there" but no rating
                    router.push({
                      pathname: '/trips/create',
                      params: {
                        cityName: city.name,
                        countryName: countryCodeToName[city.countryCode] || city.countryCode,
                        rating: 0, // Default rating for "been there" cities
                      }
                    });
                  } else if (hasPosts) {
                    setModalCity(city);
                    setShowCityModal(true);
                    // Debug: log posts for this city
                    setTimeout(() => {
                      console.log('allPosts:', allPosts);
                      console.log('getPostsForCity(modalCity):', getPostsForCity(city));
                    }, 500);
                  }
                };
                return (
                  <React.Fragment key={`${city.name || 'city'}-${city.countryCode || 'country'}-${idx}`}>
                    <TouchableOpacity
                      style={styles.cityCard}
                      activeOpacity={isClickable ? 0.7 : 1}
                      onPress={handlePress}
                      disabled={!isClickable}
                    >
                      <Image
                        source={{
                          uri: city.countryCode && countryCodeToName[city.countryCode]
                            ? `https://flagcdn.com/w80/${city.countryCode.toLowerCase()}.png`
                            : undefined
                        }}
                        style={styles.flag}
                        resizeMode="cover"
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cityName}>
                          {city.name}, {countryCodeToName[city.countryCode] || city.countryCode}
                        </Text>
                        {city.averageRating !== null ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={styles.cityRating}>
                              {city.averageRating.toFixed(1).replace('.', ',')} <Text style={{ color: '#FFD700' }}>★</Text>
                            </Text>
                            {city.manualCount === 1 && city.postCount === 0 ? (
                              <Text style={styles.citySourceGray}>based on your rating</Text>
                            ) : city.sourceText ? (
                              <Text style={styles.citySourceGray}>{city.sourceText}</Text>
                            ) : null}
                          </View>
                        ) : (
                          <Text style={styles.cityBeenThere}>I have been there</Text>
                        )}
                      </View>
                      <View style={styles.cityPlusButton}>
                        <Text style={styles.cityPlusText}>+</Text>
                      </View>
                    </TouchableOpacity>
                    <View style={{ height: 16 }} />
                  </React.Fragment>
                );
              })}
            </ScrollView>
          )}

          {/* Modal for posts and rating */}
          {showCityModal && modalCity && (
            <Modal
              visible={showCityModal}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setShowCityModal(false)}
            >
              <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <View style={{ height: '75%', backgroundColor: '#181C24', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 }}>
                  <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 8 }} onPress={() => setShowCityModal(false)}>
                    <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>×</Text>
                  </TouchableOpacity>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Show manual rating card in modal only if manualCount > 0 and there is at least one post for the city */}
                    {modalCity.manualCount > 0 && modalCity.postCount > 0 && Array.isArray(modalCity.ratings) && modalCity.ratings.length > 0 && (
                      <TouchableOpacity
                        style={styles.cityCard}
                        activeOpacity={0.7}
                        onPress={() => {
                          setShowCityModal(false);
                          router.push({
                            pathname: '/trips/create',
                            params: {
                              cityName: modalCity.name,
                              countryName: countryCodeToName[modalCity.countryCode] || modalCity.countryCode,
                              rating: typeof modalCity.ratings[0] === 'number' ? modalCity.ratings[0] : ''
                            }
                          });
                        }}
                      >
                        <Image
                          source={{
                            uri: modalCity.countryCode ? `https://flagcdn.com/w80/${modalCity.countryCode.toLowerCase()}.png` : undefined
                          }}
                          style={styles.flag}
                          resizeMode="cover"
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cityName}>{modalCity.name}, {countryCodeToName[modalCity.countryCode] || modalCity.countryCode}</Text>
                          <Text style={styles.cityRating}>★ {typeof modalCity.ratings[0] === 'number' ? modalCity.ratings[0].toFixed(1).replace('.', ',') : ''}</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    {/* TravelPostCards for each post */}
                    {getPostsForCity(modalCity).length > 0 && getPostsForCity(modalCity).map((post: any, i: number) => (
                      <View key={post.id || i} style={{ marginVertical: 12 }}>
                        <TravelPostCard 
                          post={post as any}
                          onPress={() => {
                            setShowCityModal(false);
                            router.push({
                              pathname: '/trips/create',
                              params: {
                                post: JSON.stringify(post)
                              }
                            });
                          }}
                        />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  cityPlusButton: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cityPlusText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
  },
  visitedCityTab: {
    flex: 1,
    backgroundColor: '#181C24',
    padding: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.7,
    borderColor: 'rgba(255,255,255,0.18)',
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
  citySourceGray: {
    color: '#bbb',
    fontSize: 13,
    fontStyle: 'italic',
    marginLeft: 4,
  },
});
