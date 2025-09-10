import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useVisitedCities } from '../contexts/VisitedCitiesContext';
import { useThemeColor } from '../hooks/useThemeColor';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 60) / 3; // 3 columns with padding

// Mapping from country name to ISO code for flag display
const countryNameToCode: Record<string, string> = {
  Afghanistan: 'AF', Albania: 'AL', Algeria: 'DZ', 'American Samoa': 'AS', Andorra: 'AD', Angola: 'AO', Anguilla: 'AI', Antarctica: 'AQ', 'Antigua and Barbuda': 'AG', Argentina: 'AR', Armenia: 'AM', Aruba: 'AW', Australia: 'AU', Austria: 'AT', Azerbaijan: 'AZ', Bahamas: 'BS', Bahrain: 'BH', Bangladesh: 'BD', Barbados: 'BB', Belarus: 'BY', Belgium: 'BE', Belize: 'BZ', Benin: 'BJ', Bermuda: 'BM', Bhutan: 'BT', Bolivia: 'BO', 'Bosnia and Herzegovina': 'BA', Botswana: 'BW', 'Bouvet Island': 'BV', Brazil: 'BR', 'British Indian Ocean Territory': 'IO', 'Brunei Darussalam': 'BN', Bulgaria: 'BG', 'Burkina Faso': 'BF', Burundi: 'BI', Cambodia: 'KH', Cameroon: 'CM', Canada: 'CA', 'Cape Verde': 'CV', 'Cayman Islands': 'KY', 'Central African Republic': 'CF', Chad: 'TD', Chile: 'CL', China: 'CN', 'Christmas Island': 'CX', 'Cocos (Keeling) Islands': 'CC', Colombia: 'CO', Comoros: 'KM', Congo: 'CG', 'Congo, the Democratic Republic of the': 'CD', 'Cook Islands': 'CK', 'Costa Rica': 'CR', 
  "Cote d'Ivoire": 'CI', Croatia: 'HR', Cuba: 'CU', Cyprus: 'CY', 'Czech Republic': 'CZ', Denmark: 'DK', Djibouti: 'DJ', Dominica: 'DM', 'Dominican Republic': 'DO', Ecuador: 'EC', Egypt: 'EG', 'El Salvador': 'SV', 'Equatorial Guinea': 'GQ', Eritrea: 'ER', Estonia: 'EE', Ethiopia: 'ET', 'Falkland Islands (Malvinas)': 'FK', 'Faroe Islands': 'FO', Fiji: 'FJ', Finland: 'FI', France: 'FR', 'French Guiana': 'GF', 'French Polynesia': 'PF', 'French Southern Territories': 'TF', Gabon: 'GA', Gambia: 'GM', Georgia: 'GE', Germany: 'DE', Ghana: 'GH', Gibraltar: 'GI', Greece: 'GR', Greenland: 'GL', Grenada: 'GD', Guadeloupe: 'GP', Guam: 'GU', Guatemala: 'GT', Guernsey: 'GG', Guinea: 'GN', 'Guinea-Bissau': 'GW', Guyana: 'GY', Haiti: 'HT', 'Heard Island and McDonald Islands': 'HM', 'Holy See (Vatican City State)': 'VA', Honduras: 'HN', 'Hong Kong': 'HK', Hungary: 'HU', Iceland: 'IS', India: 'IN', Indonesia: 'ID', 'Iran, Islamic Republic of': 'IR', Iraq: 'IQ', Ireland: 'IE', 'Isle of Man': 'IM', Israel: 'IL', Italy: 'IT', Jamaica: 'JM', Japan: 'JP', Jersey: 'JE', Jordan: 'JO', Kazakhstan: 'KZ', Kenya: 'KE', Kiribati: 'KI', "Korea, Democratic People's Republic of": 'KP', "Korea, Republic of": 'KR', Kuwait: 'KW', Kyrgyzstan: 'KG', "Lao People's Democratic Republic": 'LA', Latvia: 'LV', Lebanon: 'LB', Lesotho: 'LS', Liberia: 'LR', 'Libyan Arab Jamahiriya': 'LY', Liechtenstein: 'LI', Lithuania: 'LT', Luxembourg: 'LU', Macao: 'MO', 'Macedonia, the Former Yugoslav Republic of': 'MK', Madagascar: 'MG', Malawi: 'MW', Malaysia: 'MY', Maldives: 'MV', Mali: 'ML', Malta: 'MT', 'Marshall Islands': 'MH', Martinique: 'MQ', Mauritania: 'MR', Mauritius: 'MU', Mayotte: 'YT', Mexico: 'MX', 'Micronesia, Federated States of': 'FM', 'Moldova, Republic of': 'MD', Monaco: 'MC', Mongolia: 'MN', Montenegro: 'ME', Montserrat: 'MS', Morocco: 'MA', Mozambique: 'MZ', Myanmar: 'MM', Namibia: 'NA', Nauru: 'NR', Nepal: 'NP', Netherlands: 'NL', 'Netherlands Antilles': 'AN', 'New Caledonia': 'NC', 'New Zealand': 'NZ', Nicaragua: 'NI', Niger: 'NE', Nigeria: 'NG', Niue: 'NU', 'Norfolk Island': 'NF', 'Northern Mariana Islands': 'MP', Norway: 'NO', Oman: 'OM', Pakistan: 'PK', Palau: 'PW', 'Palestinian Territory, Occupied': 'PS', Panama: 'PA', 'Papua New Guinea': 'PG', Paraguay: 'PY', Peru: 'PE', Philippines: 'PH', Pitcairn: 'PN', Poland: 'PL', Portugal: 'PT', 'Puerto Rico': 'PR', Qatar: 'QA', Reunion: 'RE', Romania: 'RO', 'Russian Federation': 'RU', Rwanda: 'RW', 'Saint Barthelemy': 'BL', 'Saint Helena': 'SH', 'Saint Kitts and Nevis': 'KN', 'Saint Lucia': 'LC', 'Saint Martin': 'MF', 'Saint Pierre and Miquelon': 'PM', 'Saint Vincent and the Grenadines': 'VC', Samoa: 'WS', 'San Marino': 'SM', 'Sao Tome and Principe': 'ST', 'Saudi Arabia': 'SA', Senegal: 'SN', Serbia: 'RS', Seychelles: 'SC', 'Sierra Leone': 'SL', Singapore: 'SG', Slovakia: 'SK', Slovenia: 'SI', 'Solomon Islands': 'SB', Somalia: 'SO', 'South Africa': 'ZA', 'South Georgia and the South Sandwich Islands': 'GS', Spain: 'ES', 'Sri Lanka': 'LK', Sudan: 'SD', Suriname: 'SR', 'Svalbard and Jan Mayen': 'SJ', Swaziland: 'SZ', Sweden: 'SE', Switzerland: 'CH', 'Syrian Arab Republic': 'SY', 'Taiwan, Province of China': 'TW', Tajikistan: 'TJ', 'Tanzania, United Republic of': 'TZ', Thailand: 'TH', 'Timor-Leste': 'TL', Togo: 'TG', Tokelau: 'TK', Tonga: 'TO', 'Trinidad and Tobago': 'TT', Tunisia: 'TN', Turkey: 'TR', Turkmenistan: 'TM', 'Turks and Caicos Islands': 'TC', Tuvalu: 'TV', Uganda: 'UG', Ukraine: 'UA', 'United Arab Emirates': 'AE', 'United Kingdom': 'GB', 'United States': 'US', 'United States Minor Outlying Islands': 'UM', Uruguay: 'UY', Uzbekistan: 'UZ', Vanuatu: 'VU', Venezuela: 'VE', 'Viet Nam': 'VN', 'Virgin Islands, British': 'VG', 'Virgin Islands, U.S.': 'VI', 'Wallis and Futuna': 'WF', 'Western Sahara': 'EH', Yemen: 'YE', Zambia: 'ZM', Zimbabwe: 'ZW'
};

interface VisitedCountry {
  name: string;
  code: string;
  flag: string;
}

export default function MyCountries() {
  const navigation = require('expo-router').useNavigation();
  React.useLayoutEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);

  const { cities: visitedCities } = useVisitedCities();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  // Extraire les pays uniques depuis visitedCities (utiliser seulement les noms)
  const visitedCountries = React.useMemo(() => {
    const countries = new Set<string>();
    
    visitedCities.forEach(city => {
      if (city.country) {
        // Normaliser le nom du pays en prenant seulement le nom complet
        let countryName = city.country.trim();
        
        // Si c'est un code ISO (2 lettres), on le garde tel quel pour le mapping
        // Sinon on prend le nom tel quel
        if (countryName.length === 2) {
          // C'est probablement un code ISO, on essaie de le convertir en nom
          const countryCodeToName: Record<string, string> = {
            AF: 'Afghanistan', AL: 'Albania', DZ: 'Algeria', AS: 'American Samoa', AD: 'Andorra', AO: 'Angola', AI: 'Anguilla', AQ: 'Antarctica', AG: 'Antigua and Barbuda', AR: 'Argentina', AM: 'Armenia', AW: 'Aruba', AU: 'Australia', AT: 'Austria', AZ: 'Azerbaijan', BS: 'Bahamas', BH: 'Bahrain', BD: 'Bangladesh', BB: 'Barbados', BY: 'Belarus', BE: 'Belgium', BZ: 'Belize', BJ: 'Benin', BM: 'Bermuda', BT: 'Bhutan', BO: 'Bolivia', BA: 'Bosnia and Herzegovina', BW: 'Botswana', BV: 'Bouvet Island', BR: 'Brazil', IO: 'British Indian Ocean Territory', BN: 'Brunei Darussalam', BG: 'Bulgaria', BF: 'Burkina Faso', BI: 'Burundi', KH: 'Cambodia', CM: 'Cameroon', CA: 'Canada', CV: 'Cape Verde', KY: 'Cayman Islands', CF: 'Central African Republic', TD: 'Chad', CL: 'Chile', CN: 'China', CX: 'Christmas Island', CC: 'Cocos (Keeling) Islands', CO: 'Colombia', KM: 'Comoros', CG: 'Congo', CD: 'Congo, the Democratic Republic of the', CK: 'Cook Islands', CR: 'Costa Rica', CI: "Cote d'Ivoire", HR: 'Croatia', CU: 'Cuba', CY: 'Cyprus', CZ: 'Czech Republic', DK: 'Denmark', DJ: 'Djibouti', DM: 'Dominica', DO: 'Dominican Republic', EC: 'Ecuador', EG: 'Egypt', SV: 'El Salvador', GQ: 'Equatorial Guinea', ER: 'Eritrea', EE: 'Estonia', ET: 'Ethiopia', FK: 'Falkland Islands (Malvinas)', FO: 'Faroe Islands', FJ: 'Fiji', FI: 'Finland', FR: 'France', GF: 'French Guiana', PF: 'French Polynesia', TF: 'French Southern Territories', GA: 'Gabon', GM: 'Gambia', GE: 'Georgia', DE: 'Germany', GH: 'Ghana', GI: 'Gibraltar', GR: 'Greece', GL: 'Greenland', GD: 'Grenada', GP: 'Guadeloupe', GU: 'Guam', GT: 'Guatemala', GG: 'Guernsey', GN: 'Guinea', GW: 'Guinea-Bissau', GY: 'Guyana', HT: 'Haiti', HM: 'Heard Island and McDonald Islands', VA: 'Holy See (Vatican City State)', HN: 'Honduras', HK: 'Hong Kong', HU: 'Hungary', IS: 'Iceland', IN: 'India', ID: 'Indonesia', IR: 'Iran, Islamic Republic of', IQ: 'Iraq', IE: 'Ireland', IM: 'Isle of Man', IL: 'Israel', IT: 'Italy', JM: 'Jamaica', JP: 'Japan', JE: 'Jersey', JO: 'Jordan', KZ: 'Kazakhstan', KE: 'Kenya', KI: 'Kiribati', KP: "Korea, Democratic People's Republic of", KR: "Korea, Republic of", KW: 'Kuwait', KG: 'Kyrgyzstan', LA: "Lao People's Democratic Republic", LV: 'Latvia', LB: 'Lebanon', LS: 'Lesotho', LR: 'Liberia', LY: 'Libyan Arab Jamahiriya', LI: 'Liechtenstein', LT: 'Lithuania', LU: 'Luxembourg', MO: 'Macao', MK: 'Macedonia, the Former Yugoslav Republic of', MG: 'Madagascar', MW: 'Malawi', MY: 'Malaysia', MV: 'Maldives', ML: 'Mali', MT: 'Malta', MH: 'Marshall Islands', MQ: 'Martinique', MR: 'Mauritania', MU: 'Mauritius', YT: 'Mayotte', MX: 'Mexico', FM: 'Micronesia, Federated States of', MD: 'Moldova, Republic of', MC: 'Monaco', MN: 'Mongolia', ME: 'Montenegro', MS: 'Montserrat', MA: 'Morocco', MZ: 'Mozambique', MM: 'Myanmar', NA: 'Namibia', NR: 'Nauru', NP: 'Nepal', NL: 'Netherlands', AN: 'Netherlands Antilles', NC: 'New Caledonia', NZ: 'New Zealand', NI: 'Nicaragua', NE: 'Niger', NG: 'Nigeria', NU: 'Niue', NF: 'Norfolk Island', MP: 'Northern Mariana Islands', NO: 'Norway', OM: 'Oman', PK: 'Pakistan', PW: 'Palau', PS: 'Palestinian Territory, Occupied', PA: 'Panama', PG: 'Papua New Guinea', PY: 'Paraguay', PE: 'Peru', PH: 'Philippines', PN: 'Pitcairn', PL: 'Poland', PT: 'Portugal', PR: 'Puerto Rico', QA: 'Qatar', RE: 'Reunion', RO: 'Romania', RU: 'Russian Federation', RW: 'Rwanda', BL: 'Saint Barthelemy', SH: 'Saint Helena', KN: 'Saint Kitts and Nevis', LC: 'Saint Lucia', MF: 'Saint Martin', PM: 'Saint Pierre and Miquelon', VC: 'Saint Vincent and the Grenadines', WS: 'Samoa', SM: 'San Marino', ST: 'Sao Tome and Principe', SA: 'Saudi Arabia', SN: 'Senegal', RS: 'Serbia', SC: 'Seychelles', SL: 'Sierra Leone', SG: 'Singapore', SK: 'Slovakia', SI: 'Slovenia', SB: 'Solomon Islands', SO: 'Somalia', ZA: 'South Africa', GS: 'South Georgia and the South Sandwich Islands', ES: 'Spain', LK: 'Sri Lanka', SD: 'Sudan', SR: 'Suriname', SJ: 'Svalbard and Jan Mayen', SZ: 'Swaziland', SE: 'Sweden', CH: 'Switzerland', SY: 'Syrian Arab Republic', TW: 'Taiwan, Province of China', TJ: 'Tajikistan', TZ: 'Tanzania, United Republic of', TH: 'Thailand', TL: 'Timor-Leste', TG: 'Togo', TK: 'Tokelau', TO: 'Tonga', TT: 'Trinidad and Tobago', TN: 'Tunisia', TR: 'Turkey', TM: 'Turkmenistan', TC: 'Turks and Caicos Islands', TV: 'Tuvalu', UG: 'Uganda', UA: 'Ukraine', AE: 'United Arab Emirates', GB: 'United Kingdom', US: 'United States', UM: 'United States Minor Outlying Islands', UY: 'Uruguay', UZ: 'Uzbekistan', VU: 'Vanuatu', VE: 'Venezuela', VN: 'Viet Nam', VG: 'Virgin Islands, British', VI: 'Virgin Islands, U.S.', WF: 'Wallis and Futuna', EH: 'Western Sahara', YE: 'Yemen', ZM: 'Zambia', ZW: 'Zimbabwe'
          };
          countryName = countryCodeToName[countryName.toUpperCase()] || countryName;
        }
        
        countries.add(countryName);
      }
    });

    // Transform country names to country data with flags
    const countryData = Array.from(countries).map((countryName) => {
      // Get ISO code for flag
      const code = countryNameToCode[countryName] || 'XX';
      
      return {
        name: countryName,
        code: code,
        flag: `https://flagcdn.com/w320/${code.toLowerCase()}.png` // Higher quality
      };
    }).sort((a, b) => a.name.localeCompare(b.name));

    return countryData;
  }, [visitedCities]);

  const renderCountryCard = (country: VisitedCountry, index: number) => (
    <View key={index} style={styles.countryCard}>
      <View style={styles.flagContainer}>
        <Image
          source={{ uri: country.flag }}
          style={styles.flagImage}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.countryName} numberOfLines={2}>
        {country.name}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#181C24', paddingTop: 56 }}>
      {/* Header style my-cities */}
      <View style={[styles.header, { backgroundColor: '#181C24' }]}> 
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 0.5, backgroundColor: 'rgba(255,255,255,0.3)', width: '100%' }} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {visitedCountries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="flag-outline" size={60} color="#ccc" />
            <Text style={styles.emptyTitle}>No countries visited yet</Text>
            <Text style={styles.emptySubtitle}>
              Start exploring the world and your visited countries will appear here!
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                You've visited {visitedCountries.length} {visitedCountries.length === 1 ? 'country' : 'countries'}
              </Text>
            </View>
            
            <View style={styles.countriesGrid}>
              {visitedCountries.map((country, index) => renderCountryCard(country, index))}
            </View>
          </>
        )}
      </ScrollView>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  statsContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  countriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  countryCard: {
    width: ITEM_SIZE,
    marginBottom: 20,
    alignItems: 'center',
  },
  flagContainer: {
    width: ITEM_SIZE - 10,
    height: (ITEM_SIZE - 10) * 0.67, // Approximate flag ratio
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: 8,
    borderWidth: 0.7,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
  },
  flagImage: {
    width: '100%',
    height: '100%',
  },
  countryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 16,
  },
});
