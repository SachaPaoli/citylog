import { router } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useVisitedCities } from '../contexts/VisitedCitiesContext';
import { useThemeColor } from '../hooks/useThemeColor';
// Mapping from country name to ISO code for flag display
const countryCodeToName: Record<string, string> = {
  AF: 'Afghanistan', AL: 'Albania', DZ: 'Algeria', AS: 'American Samoa', AD: 'Andorra', AO: 'Angola', AI: 'Anguilla', AQ: 'Antarctica', AG: 'Antigua and Barbuda', AR: 'Argentina', AM: 'Armenia', AW: 'Aruba', AU: 'Australia', AT: 'Austria', AZ: 'Azerbaijan', BS: 'Bahamas', BH: 'Bahrain', BD: 'Bangladesh', BB: 'Barbados', BY: 'Belarus', BE: 'Belgium', BZ: 'Belize', BJ: 'Benin', BM: 'Bermuda', BT: 'Bhutan', BO: 'Bolivia', BA: 'Bosnia and Herzegovina', BW: 'Botswana', BV: 'Bouvet Island', BR: 'Brazil', IO: 'British Indian Ocean Territory', BN: 'Brunei Darussalam', BG: 'Bulgaria', BF: 'Burkina Faso', BI: 'Burundi', KH: 'Cambodia', CM: 'Cameroon', CA: 'Canada', CV: 'Cape Verde', KY: 'Cayman Islands', CF: 'Central African Republic', TD: 'Chad', CL: 'Chile', CN: 'China', CX: 'Christmas Island', CC: 'Cocos (Keeling) Islands', CO: 'Colombia', KM: 'Comoros', CG: 'Congo', CD: 'Congo, the Democratic Republic of the', CK: 'Cook Islands', CR: 'Costa Rica', CI: 'Cote d\'Ivoire', HR: 'Croatia', CU: 'Cuba', CY: 'Cyprus', CZ: 'Czech Republic', DK: 'Denmark', DJ: 'Djibouti', DM: 'Dominica', DO: 'Dominican Republic', EC: 'Ecuador', EG: 'Egypt', SV: 'El Salvador', GQ: 'Equatorial Guinea', ER: 'Eritrea', EE: 'Estonia', ET: 'Ethiopia', FK: 'Falkland Islands (Malvinas)', FO: 'Faroe Islands', FJ: 'Fiji', FI: 'Finland', FR: 'France', GF: 'French Guiana', PF: 'French Polynesia', TF: 'French Southern Territories', GA: 'Gabon', GM: 'Gambia', GE: 'Georgia', DE: 'Germany', GH: 'Ghana', GI: 'Gibraltar', GR: 'Greece', GL: 'Greenland', GD: 'Grenada', GP: 'Guadeloupe', GU: 'Guam', GT: 'Guatemala', GG: 'Guernsey', GN: 'Guinea', GW: 'Guinea-Bissau', GY: 'Guyana', HT: 'Haiti', HM: 'Heard Island and McDonald Islands', VA: 'Holy See (Vatican City State)', HN: 'Honduras', HK: 'Hong Kong', HU: 'Hungary', IS: 'Iceland', IN: 'India', ID: 'Indonesia', IR: 'Iran, Islamic Republic of', IQ: 'Iraq', IE: 'Ireland', IM: 'Isle of Man', IL: 'Israel', IT: 'Italy', JM: 'Jamaica', JP: 'Japan', JE: 'Jersey', JO: 'Jordan', KZ: 'Kazakhstan', KE: 'Kenya', KI: 'Kiribati', KP: 'Korea, Democratic People\'s Republic of', KR: 'Korea, Republic of', KW: 'Kuwait', KG: 'Kyrgyzstan', LA: 'Lao People\'s Democratic Republic', LV: 'Latvia', LB: 'Lebanon', LS: 'Lesotho', LR: 'Liberia', LY: 'Libyan Arab Jamahiriya', LI: 'Liechtenstein', LT: 'Lithuania', LU: 'Luxembourg', MO: 'Macao', MK: 'Macedonia, the Former Yugoslav Republic of', MG: 'Madagascar', MW: 'Malawi', MY: 'Malaysia', MV: 'Maldives', ML: 'Mali', MT: 'Malta', MH: 'Marshall Islands', MQ: 'Martinique', MR: 'Mauritania', MU: 'Mauritius', YT: 'Mayotte', MX: 'Mexico', FM: 'Micronesia, Federated States of', MD: 'Moldova, Republic of', MC: 'Monaco', MN: 'Mongolia', ME: 'Montenegro', MS: 'Montserrat', MA: 'Morocco', MZ: 'Mozambique', MM: 'Myanmar', NA: 'Namibia', NR: 'Nauru', NP: 'Nepal', NL: 'Netherlands', AN: 'Netherlands Antilles', NC: 'New Caledonia', NZ: 'New Zealand', NI: 'Nicaragua', NE: 'Niger', NG: 'Nigeria', NU: 'Niue', NF: 'Norfolk Island', MP: 'Northern Mariana Islands', NO: 'Norway', OM: 'Oman', PK: 'Pakistan', PW: 'Palau', PS: 'Palestinian Territory, Occupied', PA: 'Panama', PG: 'Papua New Guinea', PY: 'Paraguay', PE: 'Peru', PH: 'Philippines', PN: 'Pitcairn', PL: 'Poland', PT: 'Portugal', PR: 'Puerto Rico', QA: 'Qatar', RE: 'Reunion', RO: 'Romania', RU: 'Russian Federation', RW: 'Rwanda', BL: 'Saint Barthelemy', SH: 'Saint Helena', KN: 'Saint Kitts and Nevis', LC: 'Saint Lucia', MF: 'Saint Martin', PM: 'Saint Pierre and Miquelon', VC: 'Saint Vincent and the Grenadines', WS: 'Samoa', SM: 'San Marino', ST: 'Sao Tome and Principe', SA: 'Saudi Arabia', SN: 'Senegal', RS: 'Serbia', SC: 'Seychelles', SL: 'Sierra Leone', SG: 'Singapore', SK: 'Slovakia', SI: 'Slovenia', SB: 'Solomon Islands', SO: 'Somalia', ZA: 'South Africa', GS: 'South Georgia and the South Sandwich Islands', ES: 'Spain', LK: 'Sri Lanka', SD: 'Sudan', SR: 'Suriname', SJ: 'Svalbard and Jan Mayen', SZ: 'Swaziland', SE: 'Sweden', CH: 'Switzerland', SY: 'Syrian Arab Republic', TW: 'Taiwan, Province of China', TJ: 'Tajikistan', TZ: 'Tanzania, United Republic of', TH: 'Thailand', TL: 'Timor-Leste', TG: 'Togo', TK: 'Tokelau', TO: 'Tonga', TT: 'Trinidad and Tobago', TN: 'Tunisia', TR: 'Turkey', TM: 'Turkmenistan', TC: 'Turks and Caicos Islands', TV: 'Tuvalu', UG: 'Uganda', UA: 'Ukraine', AE: 'United Arab Emirates', GB: 'United Kingdom', US: 'United States', UM: 'United States Minor Outlying Islands', UY: 'Uruguay', UZ: 'Uzbekistan', VU: 'Vanuatu', VE: 'Venezuela', VN: 'Viet Nam', VG: 'Virgin Islands, British', VI: 'Virgin Islands, U.S.', WF: 'Wallis and Futuna', EH: 'Western Sahara', YE: 'Yemen', ZM: 'Zambia', ZW: 'Zimbabwe'
};
// Mapping from country name to ISO code for flag display
const countryNameToCode: Record<string, string> = {
  Afghanistan: 'AF', Albania: 'AL', Algeria: 'DZ', 'American Samoa': 'AS', Andorra: 'AD', Angola: 'AO', Anguilla: 'AI', Antarctica: 'AQ', 'Antigua and Barbuda': 'AG', Argentina: 'AR', Armenia: 'AM', Aruba: 'AW', Australia: 'AU', Austria: 'AT', Azerbaijan: 'AZ', Bahamas: 'BS', Bahrain: 'BH', Bangladesh: 'BD', Barbados: 'BB', Belarus: 'BY', Belgium: 'BE', Belize: 'BZ', Benin: 'BJ', Bermuda: 'BM', Bhutan: 'BT', Bolivia: 'BO', 'Bosnia and Herzegovina': 'BA', Botswana: 'BW', 'Bouvet Island': 'BV', Brazil: 'BR', 'British Indian Ocean Territory': 'IO', 'Brunei Darussalam': 'BN', Bulgaria: 'BG', 'Burkina Faso': 'BF', Burundi: 'BI', Cambodia: 'KH', Cameroon: 'CM', Canada: 'CA', 'Cape Verde': 'CV', 'Cayman Islands': 'KY', 'Central African Republic': 'CF', Chad: 'TD', Chile: 'CL', China: 'CN', 'Christmas Island': 'CX', 'Cocos (Keeling) Islands': 'CC', Colombia: 'CO', Comoros: 'KM', Congo: 'CG', 'Congo, the Democratic Republic of the': 'CD', 'Cook Islands': 'CK', 'Costa Rica': 'CR', 
  "Cote d'Ivoire": 'CI', Croatia: 'HR', Cuba: 'CU', Cyprus: 'CY', 'Czech Republic': 'CZ', Denmark: 'DK', Djibouti: 'DJ', Dominica: 'DM', 'Dominican Republic': 'DO', Ecuador: 'EC', Egypt: 'EG', 'El Salvador': 'SV', 'Equatorial Guinea': 'GQ', Eritrea: 'ER', Estonia: 'EE', Ethiopia: 'ET', 'Falkland Islands (Malvinas)': 'FK', 'Faroe Islands': 'FO', Fiji: 'FJ', Finland: 'FI', France: 'FR', 'French Guiana': 'GF', 'French Polynesia': 'PF', 'French Southern Territories': 'TF', Gabon: 'GA', Gambia: 'GM', Georgia: 'GE', Germany: 'DE', Ghana: 'GH', Gibraltar: 'GI', Greece: 'GR', Greenland: 'GL', Grenada: 'GD', Guadeloupe: 'GP', Guam: 'GU', Guatemala: 'GT', Guernsey: 'GG', Guinea: 'GN', 'Guinea-Bissau': 'GW', Guyana: 'GY', Haiti: 'HT', 'Heard Island and McDonald Islands': 'HM', 'Holy See (Vatican City State)': 'VA', Honduras: 'HN', 'Hong Kong': 'HK', Hungary: 'HU', Iceland: 'IS', India: 'IN', Indonesia: 'ID', 'Iran, Islamic Republic of': 'IR', Iraq: 'IQ', Ireland: 'IE', 'Isle of Man': 'IM', Israel: 'IL', Italy: 'IT', Jamaica: 'JM', Japan: 'JP', Jersey: 'JE', Jordan: 'JO', Kazakhstan: 'KZ', Kenya: 'KE', Kiribati: 'KI', "Korea, Democratic People's Republic of": 'KP', "Korea, Republic of": 'KR', Kuwait: 'KW', Kyrgyzstan: 'KG', "Lao People's Democratic Republic": 'LA', Latvia: 'LV', Lebanon: 'LB', Lesotho: 'LS', Liberia: 'LR', 'Libyan Arab Jamahiriya': 'LY', Liechtenstein: 'LI', Lithuania: 'LT', Luxembourg: 'LU', Macao: 'MO', 'Macedonia, the Former Yugoslav Republic of': 'MK', Madagascar: 'MG', Malawi: 'MW', Malaysia: 'MY', Maldives: 'MV', Mali: 'ML', Malta: 'MT', 'Marshall Islands': 'MH', Martinique: 'MQ', Mauritania: 'MR', Mauritius: 'MU', Mayotte: 'YT', Mexico: 'MX', 'Micronesia, Federated States of': 'FM', 'Moldova, Republic of': 'MD', Monaco: 'MC', Mongolia: 'MN', Montenegro: 'ME', Montserrat: 'MS', Morocco: 'MA', Mozambique: 'MZ', Myanmar: 'MM', Namibia: 'NA', Nauru: 'NR', Nepal: 'NP', Netherlands: 'NL', 'Netherlands Antilles': 'AN', 'New Caledonia': 'NC', 'New Zealand': 'NZ', Nicaragua: 'NI', Niger: 'NE', Nigeria: 'NG', Niue: 'NU', 'Norfolk Island': 'NF', 'Northern Mariana Islands': 'MP', Norway: 'NO', Oman: 'OM', Pakistan: 'PK', Palau: 'PW', 'Palestinian Territory, Occupied': 'PS', Panama: 'PA', 'Papua New Guinea': 'PG', Paraguay: 'PY', Peru: 'PE', Philippines: 'PH', Pitcairn: 'PN', Poland: 'PL', Portugal: 'PT', 'Puerto Rico': 'PR', Qatar: 'QA', Reunion: 'RE', Romania: 'RO', 'Russian Federation': 'RU', Rwanda: 'RW', 'Saint Barthelemy': 'BL', 'Saint Helena': 'SH', 'Saint Kitts and Nevis': 'KN', 'Saint Lucia': 'LC', 'Saint Martin': 'MF', 'Saint Pierre and Miquelon': 'PM', 'Saint Vincent and the Grenadines': 'VC', Samoa: 'WS', 'San Marino': 'SM', 'Sao Tome and Principe': 'ST', 'Saudi Arabia': 'SA', Senegal: 'SN', Serbia: 'RS', Seychelles: 'SC', 'Sierra Leone': 'SL', Singapore: 'SG', Slovakia: 'SK', Slovenia: 'SI', 'Solomon Islands': 'SB', Somalia: 'SO', 'South Africa': 'ZA', 'South Georgia and the South Sandwich Islands': 'GS', Spain: 'ES', 'Sri Lanka': 'LK', Sudan: 'SD', Suriname: 'SR', 'Svalbard and Jan Mayen': 'SJ', Swaziland: 'SZ', Sweden: 'SE', Switzerland: 'CH', 'Syrian Arab Republic': 'SY', 'Taiwan, Province of China': 'TW', Tajikistan: 'TJ', 'Tanzania, United Republic of': 'TZ', Thailand: 'TH', 'Timor-Leste': 'TL', Togo: 'TG', Tokelau: 'TK', Tonga: 'TO', 'Trinidad and Tobago': 'TT', Tunisia: 'TN', Turkey: 'TR', Turkmenistan: 'TM', 'Turks and Caicos Islands': 'TC', Tuvalu: 'TV', Uganda: 'UG', Ukraine: 'UA', 'United Arab Emirates': 'AE', 'United Kingdom': 'GB', 'United States': 'US', 'United States Minor Outlying Islands': 'UM', Uruguay: 'UY', Uzbekistan: 'UZ', Vanuatu: 'VU', Venezuela: 'VE', 'Viet Nam': 'VN', 'Virgin Islands, British': 'VG', 'Virgin Islands, U.S.': 'VI', 'Wallis and Futuna': 'WF', 'Western Sahara': 'EH', Yemen: 'YE', Zambia: 'ZM', Zimbabwe: 'ZW'
};


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
    // Always group and lookup by ISO code
    const validCities = visitedCities.filter(city => typeof city.name === 'string' && city.name.length > 0 && city.country);
    
    console.log('[MyCities] All visitedCities:', visitedCities);
    
    type GroupedCity = {
      name: string;
      countryCode: string; // ISO code
      ratings: number[];
      manualCount: number;
      postCount: number;
      hasBeenThere: boolean;
    };
    const groupedCities: { [key: string]: GroupedCity } = {};
    validCities.forEach(city => {
      // Normalize country to ISO code
      let code = city.country.trim();
      if (code.length > 2) {
        // If not ISO code, try to map from name
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
        // Post sans note (juste "been there")
        groupedCities[key].postCount += 1;
      } else if (city.source === 'note') {
        // Note manuelle sans rating (juste "been there")
        groupedCities[key].manualCount += 1;
      }
      if (city.beenThere) {
        groupedCities[key].hasBeenThere = true;
      }
    });
    return Object.values(groupedCities).map((city: GroupedCity) => {
      // Calculer la moyenne de TOUTES les notes (manuelles + posts)
      const averageRating = city.ratings.length > 0 ? (city.ratings.reduce((a, b) => a + b, 0) / city.ratings.length) : null;
      
      let sourceText = '';
      if (city.manualCount > 0 && city.postCount > 0) {
        // Tu as à la fois une note manuelle ET des posts
        const postText = city.postCount === 1 ? '1 post' : `${city.postCount} posts`;
        if (city.ratings.length > 0) {
          sourceText = `based on your rating and ${postText}`;
        } else {
          sourceText = `based on your visit and ${postText}`;
        }
      } else if (city.manualCount > 0) {
        // Seulement une note manuelle
        if (city.ratings.length > 0) {
          sourceText = 'based on your rating';
        } else {
          sourceText = 'based on your visit';
        }
      } else if (city.postCount > 0) {
        // Seulement des posts
        sourceText = `based on ${city.postCount} post${city.postCount > 1 ? 's' : ''}`;
      } else if (city.hasBeenThere) {
        // Juste "been there"
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
          data={[...displayCities].reverse()}
          key={visitedCities.length}
          keyExtractor={(item, idx) => `${item.name || 'city'}-${item.countryCode || 'country'}-${idx}`}
          renderItem={({ item: city }) => (
            <View style={styles.cityCard}>
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
