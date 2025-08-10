import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StarRating } from '../components/StarRating';
import { useVisitedCities } from '../contexts/VisitedCitiesContext';
import { useThemeColor } from '../hooks/useThemeColor';
// Mapping code -> nom complet
const countryCodeToName: Record<string, string> = {
  AF: 'Afghanistan', AL: 'Albania', DZ: 'Algeria', AS: 'American Samoa', AD: 'Andorra', AO: 'Angola', AI: 'Anguilla', AQ: 'Antarctica', AG: 'Antigua and Barbuda', AR: 'Argentina', AM: 'Armenia', AW: 'Aruba', AU: 'Australia', AT: 'Austria', AZ: 'Azerbaijan', BS: 'Bahamas', BH: 'Bahrain', BD: 'Bangladesh', BB: 'Barbados', BY: 'Belarus', BE: 'Belgium', BZ: 'Belize', BJ: 'Benin', BM: 'Bermuda', BT: 'Bhutan', BO: 'Bolivia', BA: 'Bosnia and Herzegovina', BW: 'Botswana', BV: 'Bouvet Island', BR: 'Brazil', IO: 'British Indian Ocean Territory', BN: 'Brunei Darussalam', BG: 'Bulgaria', BF: 'Burkina Faso', BI: 'Burundi', KH: 'Cambodia', CM: 'Cameroon', CA: 'Canada', CV: 'Cape Verde', KY: 'Cayman Islands', CF: 'Central African Republic', TD: 'Chad', CL: 'Chile', CN: 'China', CX: 'Christmas Island', CC: 'Cocos (Keeling) Islands', CO: 'Colombia', KM: 'Comoros', CG: 'Congo', CD: 'Congo, the Democratic Republic of the', CK: 'Cook Islands', CR: 'Costa Rica', CI: "Cote d'Ivoire", HR: 'Croatia', CU: 'Cuba', CY: 'Cyprus', CZ: 'Czech Republic', DK: 'Denmark', DJ: 'Djibouti', DM: 'Dominica', DO: 'Dominican Republic', EC: 'Ecuador', EG: 'Egypt', SV: 'El Salvador', GQ: 'Equatorial Guinea', ER: 'Eritrea', EE: 'Estonia', ET: 'Ethiopia', FK: 'Falkland Islands (Malvinas)', FO: 'Faroe Islands', FJ: 'Fiji', FI: 'Finland', FR: 'France', GF: 'French Guiana', PF: 'French Polynesia', TF: 'French Southern Territories', GA: 'Gabon', GM: 'Gambia', GE: 'Georgia', DE: 'Germany', GH: 'Ghana', GI: 'Gibraltar', GR: 'Greece', GL: 'Greenland', GD: 'Grenada', GP: 'Guadeloupe', GU: 'Guam', GT: 'Guatemala', GG: 'Guernsey', GN: 'Guinea', GW: 'Guinea-Bissau', GY: 'Guyana', HT: 'Haiti', HM: 'Heard Island and McDonald Islands', VA: 'Holy See (Vatican City State)', HN: 'Honduras', HK: 'Hong Kong', HU: 'Hungary', IS: 'Iceland', IN: 'India', ID: 'Indonesia', IR: 'Iran, Islamic Republic of', IQ: 'Iraq', IE: 'Ireland', IM: 'Isle of Man', IL: 'Israel', IT: 'Italy', JM: 'Jamaica', JP: 'Japan', JE: 'Jersey', JO: 'Jordan', KZ: 'Kazakhstan', KE: 'Kenya', KI: 'Kiribati', KP: "Korea, Democratic People's Republic of", KR: 'Korea, Republic of', KW: 'Kuwait', KG: 'Kyrgyzstan', LA: 'Lao People\'s Democratic Republic', LV: 'Latvia', LB: 'Lebanon', LS: 'Lesotho', LR: 'Liberia', LY: 'Libyan Arab Jamahiriya', LI: 'Liechtenstein', LT: 'Lithuania', LU: 'Luxembourg', MO: 'Macao', MK: 'Macedonia, the Former Yugoslav Republic of', MG: 'Madagascar', MW: 'Malawi', MY: 'Malaysia', MV: 'Maldives', ML: 'Mali', MT: 'Malta', MH: 'Marshall Islands', MQ: 'Martinique', MR: 'Mauritania', MU: 'Mauritius', YT: 'Mayotte', MX: 'Mexico', FM: 'Micronesia, Federated States of', MD: 'Moldova, Republic of', MC: 'Monaco', MN: 'Mongolia', ME: 'Montenegro', MS: 'Montserrat', MA: 'Morocco', MZ: 'Mozambique', MM: 'Myanmar', NA: 'Namibia', NR: 'Nauru', NP: 'Nepal', NL: 'Netherlands', AN: 'Netherlands Antilles', NC: 'New Caledonia', NZ: 'New Zealand', NI: 'Nicaragua', NE: 'Niger', NG: 'Nigeria', NU: 'Niue', NF: 'Norfolk Island', MP: 'Northern Mariana Islands', NO: 'Norway', OM: 'Oman', PK: 'Pakistan', PW: 'Palau', PS: 'Palestinian Territory, Occupied', PA: 'Panama', PG: 'Papua New Guinea', PY: 'Paraguay', PE: 'Peru', PH: 'Philippines', PN: 'Pitcairn', PL: 'Poland', PT: 'Portugal', PR: 'Puerto Rico', QA: 'Qatar', RE: 'Reunion', RO: 'Romania', RU: 'Russian Federation', RW: 'Rwanda', BL: 'Saint Barthelemy', SH: 'Saint Helena', KN: 'Saint Kitts and Nevis', LC: 'Saint Lucia', MF: 'Saint Martin', PM: 'Saint Pierre and Miquelon', VC: 'Saint Vincent and the Grenadines', WS: 'Samoa', SM: 'San Marino', ST: 'Sao Tome and Principe', SA: 'Saudi Arabia', SN: 'Senegal', RS: 'Serbia', SC: 'Seychelles', SL: 'Sierra Leone', SG: 'Singapore', SK: 'Slovakia', SI: 'Slovenia', SB: 'Solomon Islands', SO: 'Somalia', ZA: 'South Africa', GS: 'South Georgia and the South Sandwich Islands', ES: 'Spain', LK: 'Sri Lanka', SD: 'Sudan', SR: 'Suriname', SJ: 'Svalbard and Jan Mayen', SZ: 'Swaziland', SE: 'Sweden', CH: 'Switzerland', SY: 'Syrian Arab Republic', TW: 'Taiwan, Province of China', TJ: 'Tajikistan', TZ: 'Tanzania, United Republic of', TH: 'Thailand', TL: 'Timor-Leste', TG: 'Togo', TK: 'Tokelau', TO: 'Tonga', TT: 'Trinidad and Tobago', TN: 'Tunisia', TR: 'Turkey', TM: 'Turkmenistan', TC: 'Turks and Caicos Islands', TV: 'Tuvalu', UG: 'Uganda', UA: 'Ukraine', AE: 'United Arab Emirates', GB: 'United Kingdom', US: 'United States', UM: 'United States Minor Outlying Islands', UY: 'Uruguay', UZ: 'Uzbekistan', VU: 'Vanuatu', VE: 'Venezuela', VN: 'Viet Nam', VG: 'Virgin Islands, British', VI: 'Virgin Islands, U.S.', WF: 'Wallis and Futuna', EH: 'Western Sahara', YE: 'Yemen', ZM: 'Zambia', ZW: 'Zimbabwe'
};

function getCountryName(code: string): string {
  if (!code) return code;
  code = code.toUpperCase();
  return countryCodeToName[code] || code;
}

export default function CityDetailScreen() {
  const router = useRouter();
  const { city, country, countryCode, flag, population } = useLocalSearchParams();
  const { addOrUpdateCity, removeCity, removeCitySource, cities: visitedCities } = useVisitedCities();
  
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'borderColor');
  const mainBlue = '#2051A4'; // Bleu principal pour uniformiser les boutons
  const headerColor = '#181C24'; // Même couleur que trip-detail
  const whiteColor = '#FFFFFF';

  // Récupère la note et le statut pour cette ville
  const manualEntry = visitedCities.find(
    c => c.name === city && c.country === country && c.source === 'note'
  );
  const postEntry = visitedCities.find(
    c => c.name === city && c.country === country && c.source === 'post'
  );
  const initialRating = manualEntry?.rating ?? postEntry?.rating ?? 0;
  const initialBeenThere = manualEntry?.beenThere ?? postEntry?.beenThere ?? false;

  const [userRating, setUserRating] = useState(initialRating);
  const [hasBeenThere, setHasBeenThere] = useState(initialBeenThere);
  const curtainAnimation = useState(new Animated.Value(0))[0];

  // Synchronise les états avec les données du contexte quand elles changent
  useEffect(() => {
    console.log('[CityDetail] visitedCities changed:', visitedCities);
    console.log('[CityDetail] Looking for city:', city, 'country:', country);
    
    const manualEntry = visitedCities.find(
      c => c.name === city && c.country === country && c.source === 'note'
    );
    const postEntry = visitedCities.find(
      c => c.name === city && c.country === country && c.source === 'post'
    );
    
    console.log('[CityDetail] Found manualEntry:', manualEntry);
    console.log('[CityDetail] Found postEntry:', postEntry);
    
    const currentRating = manualEntry?.rating ?? postEntry?.rating ?? 0;
    const currentBeenThere = manualEntry?.beenThere ?? postEntry?.beenThere ?? false;
    
    console.log('[CityDetail] Setting userRating to:', currentRating);
    console.log('[CityDetail] Setting hasBeenThere to:', currentBeenThere);
    
    setUserRating(currentRating);
    setHasBeenThere(currentBeenThere);
  }, [visitedCities, city, country]);

  // Animation du rideau
  useEffect(() => {
    Animated.timing(curtainAnimation, {
      toValue: hasBeenThere ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [hasBeenThere, curtainAnimation]);

  const handleRatingChange = (rating: number) => {
    console.log('[CityDetail] handleRatingChange called with:', rating);
    setUserRating(rating);
  };

  const handleSubmitRating = () => {
    console.log('[CityDetail] handleSubmitRating called with userRating:', userRating);
    if (!city || !country) return;
    if (!userRating || userRating < 1) {
      console.log('[CityDetail] Removing city source (rating < 1)');
      // Supprime la note comme dans l'ancienne version
      removeCitySource(city as string, country as string, 'note');
      setUserRating(0);
      setHasBeenThere(false);
      return;
    }
    console.log('[CityDetail] Adding/updating city with rating:', userRating);
    // Ajoute/met à jour la ville avec la note (comme dans l'ancienne version)
    addOrUpdateCity({
      name: city as string,
      country: country as string,
      flag: (flag as string) || '', // Évite undefined
      rating: userRating,
      beenThere: true, // TOUJOURS true quand on donne une note
      source: 'note',
    });
    setHasBeenThere(true);
  };

  const toggleHasBeenThere = () => {
    if (!city || !country) return;
    
    // Vérifie s'il y a une note manuelle (comme dans l'ancienne version)
    const manualNote = visitedCities.find(
      c => (c.name === city || c.city === city) && c.country === country && c.source === 'note' && typeof c.rating === 'number'
    );
    
    const newValue = !hasBeenThere;
    
    if (!newValue && manualNote) {
      // Si on essaie de retirer "beenThere" mais qu'il y a une note, on ne fait rien
      // (dans l'ancienne version ça affichait une erreur)
      return;
    }
    
    setHasBeenThere(newValue);
    
    if (newValue) {
      // Ajoute la ville comme visitée (comme dans l'ancienne version)
      addOrUpdateCity({
        name: city as string,
        country: country as string,
        flag: (flag as string) || '', // Évite undefined
        rating: userRating || undefined,
        beenThere: true,
        source: 'note',
      });
    } else {
      // Retire complètement la ville (comme dans l'ancienne version)
      removeCity(city as string, country as string);
      setUserRating(0);
    }
  };

  const handleDelete = () => {
    if (!city || !country) return;
    // Supprime seulement la note manuelle (comme dans l'ancienne version)
    removeCitySource(city as string, country as string, 'note');
    setUserRating(0);
    setHasBeenThere(false);
  };

  const flagUrl = `https://flagcdn.com/w80/${
    countryCode
      ? (Array.isArray(countryCode) ? countryCode[0] : countryCode).toLowerCase()
      : country
        ? (Array.isArray(country) ? country[0] : country).toLowerCase()
        : ''
  }.png`;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: headerColor }]}>
        {/* Header avec bouton retour et drapeau */}
        <View style={[styles.header, { backgroundColor: headerColor }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: whiteColor }]}>← Retour</Text>
          </TouchableOpacity>
          
          <Image source={{ uri: flagUrl }} style={[styles.headerFlag, { width: 40, height: 28 }]} />
        </View>

      <ScrollView style={[styles.content, { backgroundColor }]} showsVerticalScrollIndicator={false}>
        {/* Nom de la ville */}
        <View style={styles.cityHeader}>
          <Text style={[styles.cityName, { color: textColor }]}>{city}</Text>
          <Text style={[styles.countryName, { color: textColor }]}> 
            {country && (country as string).length <= 3
              ? getCountryName(country as string)
              : country}
          </Text>
          {population && (
            <Text style={[styles.population, { color: textColor }]}>
              Population: {population}
            </Text>
          )}
        </View>

        {/* Votre note */}
        <View style={styles.userRatingSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Votre note</Text>
          <View style={styles.userRatingContainer}>
            {/* Système de rating avec étoiles extra larges */}
            <View style={styles.starsWrapper}>
              <StarRating 
                rating={userRating} 
                onRatingChange={handleRatingChange}
                size="large"
                color="#f5c518"
                showRating={false}
              />
            </View>
            <Text style={[styles.currentRating, { color: textColor }]}>
              {userRating > 0 ? `${userRating.toFixed(1)}/5` : 'Pas encore noté'}
            </Text>
          </View>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actions}>
          {/* Ligne des boutons de notation */}
          {userRating > 0 && (
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.clearButton, { borderColor }]}
                onPress={handleDelete}
              >
                <Text style={[styles.clearButtonText, { color: textColor }]}>
                  Delete
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: mainBlue }]}
                onPress={handleSubmitRating}
              >
                <Text style={styles.rateButtonText}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Bouton I have been there en dessous */}
          <TouchableOpacity 
            style={[
              styles.visitedButtonFullWidth,
              { borderColor: mainBlue },
              hasBeenThere && { backgroundColor: mainBlue }
            ]}
            onPress={toggleHasBeenThere}
          >
            <View style={styles.visitedButtonContainer}>
              <Animated.View style={[
                styles.curtainEffect,
                {
                  backgroundColor: mainBlue,
                  width: curtainAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]} />
              <View style={styles.visitedButtonContent}>
                <Text style={[
                  styles.visitedButtonTextNew, 
                  hasBeenThere && styles.visitedButtonTextNewActive
                ]}>
                  I have been there
                </Text>
                {hasBeenThere && (
                  <Text style={styles.checkMarkNew}>✓</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingTop: 50, // Espace pour la status bar
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    justifyContent: 'center',
    height: 40,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerFlag: {
    width: 32,
    height: 22,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  cityHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  cityName: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  countryName: {
    fontSize: 18,
    opacity: 0.7,
    textAlign: 'center',
  },
  population: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 4,
  },
  userRatingSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  userRatingContainer: {
    alignItems: 'center',
    gap: 15,
  },
  starsWrapper: {
    transform: [{ scale: 1.3 }], // Agrandit les étoiles de 30%
  },
  currentRating: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    paddingHorizontal: 20,
    gap: 15,
    paddingBottom: 40,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  actionButton: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,
  },
  rateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  visitedButtonFullWidth: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    position: 'relative',
  },
  visitedButtonContainer: {
    flex: 1,
    position: 'relative',
  },
  curtainEffect: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#5784BA',
    zIndex: 1,
  },
  visitedButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 2,
    gap: 8,
  },
  visitedButtonTextNew: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  visitedButtonTextNewActive: {
    color: '#FFFFFF',
  },
  checkMarkNew: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
