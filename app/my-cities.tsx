import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TravelPostCard } from '../components/TravelPostCard';
import { StarRating } from '../components/StarRating';
import { useAuth } from '../contexts/AuthContext';
import { useVisitedCities } from '../contexts/VisitedCitiesContext';
import { usePosts } from '../hooks/usePosts';
import { useThemeColor } from '../hooks/useThemeColor';

// Mapping from country code to country name
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
  const { posts } = usePosts();
  const { user } = useAuth();
  
  // États pour le modal des posts
  const [showPostsModal, setShowPostsModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<{name: string, countryCode: string} | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // Écouter les changements de navigation pour fermer le modal
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setShowPostsModal(false);
      setShowReviewModal(false);
    });

    return unsubscribe;
  }, [navigation]);
  
  React.useEffect(() => {
    console.log('[DEBUG] showReviewModal changed:', showReviewModal);
  }, [showReviewModal]);
  
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  // Fonction pour gérer le clic sur une ville
  const handleCityPress = (cityName: string, countryCode: string) => {
    console.log('[DEBUG] Clicking on city:', cityName, countryCode);
    
    const cityPosts = posts.filter(post => 
      post.city.toLowerCase() === cityName.toLowerCase() && 
      post.country.toLowerCase() === (countryCodeToName[countryCode] || countryCode).toLowerCase() &&
      post.userId === user?.uid // Filtrer seulement mes posts
    );
    
    console.log('[DEBUG] Found posts for city:', cityPosts.length);
    
    // Vérifier s'il y a un rating manuel ET une review pour cette ville
    const hasManualRatingAndReview = visitedCities.some(c => {
      const cityMatch = c.name?.toLowerCase() === cityName.toLowerCase();
      const countryFullName = countryCodeToName[countryCode];
      const countryMatch = 
        c.country === countryCode || // Code ISO direct
        c.country === countryFullName || // Nom complet
        c.country?.toLowerCase() === countryFullName?.toLowerCase() || // Nom complet en minuscules
        c.country?.toLowerCase() === countryCode.toLowerCase(); // Code ISO en minuscules
      const isManualNote = c.source === 'note';
      const hasRating = c.rating !== undefined && c.rating > 0;
      const hasReview = c.hasReview === true || c.reviewText;
      
      console.log('[DEBUG] Checking city entry:', {
        name: c.name,
        country: c.country,
        source: c.source,
        rating: c.rating,
        hasReviewFlag: c.hasReview,
        reviewText: c.reviewText,
        cityMatch,
        countryMatch,
        isManualNote,
        hasRating,
        hasReview
      });
      
      return cityMatch && countryMatch && isManualNote && hasRating && hasReview;
    });
    
    // Vérifier s'il y a une review pour cette ville (peu importe le rating)
    const hasAnyReview = visitedCities.some(c => {
      const cityMatch = c.name?.toLowerCase() === cityName.toLowerCase();
      const countryFullName = countryCodeToName[countryCode];
      const countryMatch = 
        c.country === countryCode || // Code ISO direct
        c.country === countryFullName || // Nom complet
        c.country?.toLowerCase() === countryFullName?.toLowerCase() || // Nom complet en minuscules
        c.country?.toLowerCase() === countryCode.toLowerCase(); // Code ISO en minuscules
      const hasReview = c.hasReview === true || c.reviewText;
      
      return cityMatch && countryMatch && hasReview;
    });
    
    console.log('[DEBUG] Has manual rating and review:', hasManualRatingAndReview);
    console.log('[DEBUG] Has any review:', hasAnyReview);
    
    // Ouvrir le modal s'il y a des posts OU (rating manuel + review) OU juste une review
    if (cityPosts.length > 0 || hasManualRatingAndReview || hasAnyReview) {
      console.log('[DEBUG] Opening modal');
      setSelectedCity({ name: cityName, countryCode });
      setShowPostsModal(true);
    } else {
      console.log('[DEBUG] Not opening modal - no posts and no review');
    }
  };

  // Filtrer les posts pour la ville sélectionnée
  const selectedCityPosts = React.useMemo(() => {
    if (!selectedCity) return [];
    return posts.filter(post => 
      post.city.toLowerCase() === selectedCity.name.toLowerCase() && 
      post.country.toLowerCase() === (countryCodeToName[selectedCity.countryCode] || selectedCity.countryCode).toLowerCase() &&
      post.userId === user?.uid // Filtrer seulement mes posts
    );
  }, [posts, selectedCity, user?.uid]);
  const displayCities = React.useMemo(() => {
    // Always group and lookup by ISO code
    const validCities = visitedCities.filter(city => typeof city.name === 'string' && city.name.length > 0 && city.country);
    
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
      
        // Vérifier si cette ville a une review
        const hasReview = visitedCities.some(c => {
          const cityMatch = c.name.toLowerCase() === city.name.toLowerCase();
          // Essayer plusieurs variantes de correspondance de pays
          const countryFullName = countryCodeToName[city.countryCode];
          const countryMatch = 
            c.country === city.countryCode || // Code ISO direct
            c.country === countryFullName || // Nom complet
            c.country?.toLowerCase() === countryFullName?.toLowerCase() || // Nom complet en minuscules
            c.country?.toLowerCase() === city.countryCode.toLowerCase(); // Code ISO en minuscules
          
          const hasReviewData = c.source === 'review' || c.hasReview === true || c.reviewText;
          
          return cityMatch && countryMatch && hasReviewData;
        });      let sourceText = '';
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
        hasReview,
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
          renderItem={({ item: city }) => {
            // Vérifier s'il y a des posts pour cette ville
            const cityPosts = posts.filter(post => 
              post.city.toLowerCase() === city.name.toLowerCase() && 
              post.country.toLowerCase() === (countryCodeToName[city.countryCode] || city.countryCode).toLowerCase() &&
              post.userId === user?.uid
            );
            
            // Vérifier s'il y a un rating manuel ET une review pour cette ville
            const hasManualRatingAndReview = visitedCities.some(c => {
              const cityMatch = c.name?.toLowerCase() === city.name.toLowerCase();
              const countryFullName = countryCodeToName[city.countryCode];
              const countryMatch = 
                c.country === city.countryCode || // Code ISO direct
                c.country === countryFullName || // Nom complet
                c.country?.toLowerCase() === countryFullName?.toLowerCase() || // Nom complet en minuscules
                c.country?.toLowerCase() === city.countryCode.toLowerCase(); // Code ISO en minuscules
              const isManualNote = c.source === 'note';
              const hasRating = c.rating !== undefined && c.rating > 0;
              const hasReview = c.hasReview === true || c.reviewText;
              
              return cityMatch && countryMatch && isManualNote && hasRating && hasReview;
            });

            // Vérifier s'il y a juste "been there" + review (sans rating)
            const hasBeenThereAndReview = visitedCities.some(c => {
              const cityMatch = c.name?.toLowerCase() === city.name.toLowerCase();
              const countryFullName = countryCodeToName[city.countryCode];
              const countryMatch = 
                c.country === city.countryCode || // Code ISO direct
                c.country === countryFullName || // Nom complet
                c.country?.toLowerCase() === countryFullName?.toLowerCase() || // Nom complet en minuscules
                c.country?.toLowerCase() === city.countryCode.toLowerCase(); // Code ISO en minuscules
              const isManualNote = c.source === 'note';
              const hasBeenThere = c.beenThere === true;
              const noRating = !c.rating || c.rating === 0;
              
              return cityMatch && countryMatch && isManualNote && hasBeenThere && noRating;
            });
            
            // Une ville est cliquable si elle a des posts OU si elle a une review OU si elle a rating+review OU si elle a beenThere+review
            const isClickable = cityPosts.length > 0 || city.hasReview || hasManualRatingAndReview || (hasBeenThereAndReview && city.hasReview);
            
            return (
              <TouchableOpacity 
                style={styles.cityCard}
                onPress={() => isClickable && handleCityPress(city.name, city.countryCode)}
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
                <View style={styles.cityNameRow}>
                  <Text style={styles.cityName}>
                    {city.name}, {countryCodeToName[city.countryCode] || city.countryCode}
                  </Text>
                  {city.hasReview && (
                    <Ionicons 
                      name="chatbubble-outline" 
                      size={16} 
                      color="#fff" 
                      style={styles.reviewIcon}
                    />
                  )}
                </View>
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
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal pour afficher les posts de la ville sélectionnée */}
      <Modal
        visible={showPostsModal}
        animationType="slide"
        presentationStyle="overFullScreen"
        transparent={true}
        onRequestClose={() => setShowPostsModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowPostsModal(false)} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: textColor }]}>×</Text>
              </TouchableOpacity>
            </View>
            
            {selectedCity && (
              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <Text style={[styles.modalTitle, { color: textColor }]}>
                  {selectedCity.name}, {countryCodeToName[selectedCity.countryCode] || selectedCity.countryCode}
                </Text>
                
                {/* Afficher la carte avec l'icône review si la ville a des posts ET une review */}
                {(() => {
                  const hasPosts = selectedCityPosts.length > 0;
                  
                  if (hasPosts) {
                    // Vérifier s'il y a une review pour cette ville
                    const hasReviewForCity = visitedCities.some(c => {
                      const cityMatch = c.name.toLowerCase() === selectedCity.name.toLowerCase();
                      const countryFullName = countryCodeToName[selectedCity.countryCode];
                      const countryMatch = 
                        c.country === selectedCity.countryCode || 
                        c.country === countryFullName || 
                        c.country?.toLowerCase() === countryFullName?.toLowerCase() || 
                        c.country?.toLowerCase() === selectedCity.countryCode.toLowerCase();
                      const hasReviewData = c.source === 'review' || c.hasReview === true || c.reviewText;
                      return cityMatch && countryMatch && hasReviewData;
                    });

                    // Trouver le rating manuel s'il existe
                    const manualRatingEntry = visitedCities.find(c => {
                      const cityMatch = c.name?.toLowerCase() === selectedCity.name.toLowerCase();
                      const countryFullName = countryCodeToName[selectedCity.countryCode];
                      const countryMatch = 
                        c.country?.toLowerCase() === countryFullName?.toLowerCase() ||
                        c.country?.toLowerCase() === selectedCity.countryCode.toLowerCase();
                      const isManualNote = c.source === 'note';
                      const hasRating = c.rating !== undefined && c.rating > 0;
                      return cityMatch && countryMatch && isManualNote && hasRating;
                    });

                    if (hasReviewForCity || manualRatingEntry?.rating) {
                      return (
                        <TouchableOpacity 
                          style={styles.ratingCard}
                          onPress={() => {
                            console.log('[DEBUG] Clicking on rating card');
                            setShowPostsModal(false); // Fermer la modal principale
                            setShowReviewModal(true);
                          }}
                          activeOpacity={0.7}
                        >
                          <Image
                            source={{
                              uri: `https://flagcdn.com/w80/${selectedCity.countryCode.toLowerCase()}.png`
                            }}
                            style={styles.ratingCardFlag}
                            resizeMode="cover"
                          />
                          <View style={styles.ratingCardContent}>
                            <View style={styles.ratingCardNameRow}>
                              <Text style={styles.ratingCardCityName}>
                                {selectedCity.name}, {countryCodeToName[selectedCity.countryCode] || selectedCity.countryCode}
                              </Text>
                              {hasReviewForCity && (
                                <Ionicons 
                                  name="chatbubble-outline" 
                                  size={16} 
                                  color="#fff" 
                                  style={styles.reviewIcon}
                                />
                              )}
                            </View>
                            <View style={styles.ratingCardRatingRow}>
                              {manualRatingEntry?.rating ? (
                                <>
                                  <Text style={styles.ratingCardRating}>
                                    {manualRatingEntry.rating.toFixed(1).replace('.', ',')} <Text style={{ color: '#FFD700' }}>★</Text>
                                  </Text>
                                  <Text style={styles.ratingCardSource}>based on your rating</Text>
                                </>
                              ) : hasReviewForCity ? (
                                <Text style={styles.ratingCardSource}>You have reviewed this city</Text>
                              ) : null}
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    }
                  }
                  return null;
                })()}
                
                {/* Cas spécial : ville avec rating manuel + review mais sans posts */}
                {(() => {
                  const hasNoPosts = selectedCityPosts.length === 0;
                  
                  if (hasNoPosts) {
                    // Trouver le rating manuel et la review
                    const manualRatingEntry = visitedCities.find(c => {
                      const cityMatch = c.name?.toLowerCase() === selectedCity.name.toLowerCase();
                      const countryFullName = countryCodeToName[selectedCity.countryCode];
                      const countryMatch = 
                        c.country?.toLowerCase() === countryFullName?.toLowerCase() ||
                        c.country?.toLowerCase() === selectedCity.countryCode.toLowerCase();
                      const isManualNote = c.source === 'note';
                      const hasRating = c.rating !== undefined && c.rating > 0;
                      return cityMatch && countryMatch && isManualNote && hasRating;
                    });

                    const reviewEntry = visitedCities.find(c => {
                      const cityMatch = c.name?.toLowerCase() === selectedCity.name.toLowerCase();
                      const countryFullName = countryCodeToName[selectedCity.countryCode];
                      const countryMatch = 
                        c.country === selectedCity.countryCode || 
                        c.country === countryFullName || 
                        c.country?.toLowerCase() === countryFullName?.toLowerCase() || 
                        c.country?.toLowerCase() === selectedCity.countryCode.toLowerCase();
                      return cityMatch && countryMatch && (c.source === 'review' || c.reviewText);
                    });

                    // Vérifier s'il y a juste "been there" sans rating
                    const beenThereEntry = visitedCities.find(c => {
                      const cityMatch = c.name?.toLowerCase() === selectedCity.name.toLowerCase();
                      const countryFullName = countryCodeToName[selectedCity.countryCode];
                      const countryMatch = 
                        c.country?.toLowerCase() === countryFullName?.toLowerCase() ||
                        c.country?.toLowerCase() === selectedCity.countryCode.toLowerCase();
                      const isManualNote = c.source === 'note';
                      const hasBeenThere = c.beenThere === true;
                      const noRating = !c.rating || c.rating === 0;
                      return cityMatch && countryMatch && isManualNote && hasBeenThere && noRating;
                    });

                    if (manualRatingEntry?.rating && reviewEntry?.reviewText) {
                      // Cas: Rating manuel + Review
                      return (
                        <View style={styles.ratingReviewContainer}>
                          {/* Section Your Rating */}
                          <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Your Rating</Text>
                            <StarRating 
                              rating={manualRatingEntry.rating || 0}
                              readonly={true}
                              size="medium"
                              showRating={true}
                              color="#FFD700"
                            />
                          </View>

                          {/* Section Your Review */}
                          <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Your Review</Text>
                            <Text style={styles.reviewText}>{reviewEntry?.reviewText || ''}</Text>
                          </View>
                        </View>
                      );
                    } else if (beenThereEntry && reviewEntry?.reviewText) {
                      // Cas: Juste "I have been there" + Review
                      return (
                        <View style={styles.ratingReviewContainer}>
                          {/* Section I have been there */}
                          <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>I have been there</Text>
                          </View>

                          {/* Section Your Review */}
                          <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Your Review</Text>
                            <Text style={styles.reviewText}>{reviewEntry?.reviewText || ''}</Text>
                          </View>
                        </View>
                      );
                    } else if (reviewEntry?.reviewText) {
                      // Cas: Seulement Review (sans rating manuel ni been there)
                      return (
                        <View style={styles.ratingReviewContainer}>
                          <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Your Review</Text>
                            <Text style={styles.reviewText}>{reviewEntry?.reviewText || ''}</Text>
                          </View>
                        </View>
                      );
                    }
                  }
                  return null;
                })()}
                
                {selectedCityPosts.length > 0 && (
                  <View style={styles.postsContainer}>
                    {selectedCityPosts.map((post, index) => (
                      <View key={post.id || index} style={styles.postWrapper}>
                        <TravelPostCard post={post} />
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal pour afficher la review */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        presentationStyle="overFullScreen"
        transparent={true}
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.reviewModalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowReviewModal(false)} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: textColor }]}>×</Text>
              </TouchableOpacity>
            </View>
            
            {selectedCity && (
              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <Text style={[styles.modalTitle, { color: textColor }]}>
                  {selectedCity.name}, {countryCodeToName[selectedCity.countryCode] || selectedCity.countryCode}
                </Text>
                
                {(() => {
                  // Trouver le rating manuel et la review pour cette ville
                  const manualRatingEntry = visitedCities.find(c => {
                    const cityMatch = c.name?.toLowerCase() === selectedCity.name.toLowerCase();
                    const countryFullName = countryCodeToName[selectedCity.countryCode];
                    const countryMatch = 
                      c.country?.toLowerCase() === countryFullName?.toLowerCase() ||
                      c.country?.toLowerCase() === selectedCity.countryCode.toLowerCase();
                    const isManualNote = c.source === 'note';
                    const hasRating = c.rating !== undefined && c.rating > 0;
                    return cityMatch && countryMatch && isManualNote && hasRating;
                  });

                  const reviewEntry = visitedCities.find(c => {
                    const cityMatch = c.name?.toLowerCase() === selectedCity.name.toLowerCase();
                    const countryFullName = countryCodeToName[selectedCity.countryCode];
                    const countryMatch = 
                      c.country === selectedCity.countryCode || 
                      c.country === countryFullName || 
                      c.country?.toLowerCase() === countryFullName?.toLowerCase() || 
                      c.country?.toLowerCase() === selectedCity.countryCode.toLowerCase();
                    return cityMatch && countryMatch && (c.source === 'review' || c.reviewText);
                  });

                  // Vérifier s'il y a juste "been there" sans rating
                  const beenThereEntry = visitedCities.find(c => {
                    const cityMatch = c.name?.toLowerCase() === selectedCity.name.toLowerCase();
                    const countryFullName = countryCodeToName[selectedCity.countryCode];
                    const countryMatch = 
                      c.country?.toLowerCase() === countryFullName?.toLowerCase() ||
                      c.country?.toLowerCase() === selectedCity.countryCode.toLowerCase();
                    const isManualNote = c.source === 'note';
                    const hasBeenThere = c.beenThere === true;
                    const noRating = !c.rating || c.rating === 0;
                    return cityMatch && countryMatch && isManualNote && hasBeenThere && noRating;
                  });

                  console.log('[DEBUG] Review entry found:', reviewEntry);
                  console.log('[DEBUG] All matching entries for', selectedCity.name, ':', 
                    visitedCities.filter(c => c.name?.toLowerCase() === selectedCity.name.toLowerCase())
                  );

                  return (
                    <View style={styles.ratingReviewContainer}>
                      {/* Section Your Rating si elle existe */}
                      {manualRatingEntry?.rating && (
                        <View style={styles.sectionContainer}>
                          <Text style={styles.sectionTitle}>Your Rating</Text>
                          <StarRating 
                            rating={manualRatingEntry.rating || 0}
                            readonly={true}
                            size="medium"
                            showRating={true}
                            color="#FFD700"
                          />
                        </View>
                      )}

                      {/* Section I have been there si pas de rating mais beenThere = true */}
                      {!manualRatingEntry?.rating && beenThereEntry && (
                        <View style={styles.sectionContainer}>
                          <Text style={styles.sectionTitle}>I have been there</Text>
                        </View>
                      )}

                      {/* Section Your Review si elle existe */}
                      {reviewEntry?.reviewText && (
                        <View style={styles.sectionContainer}>
                          <Text style={styles.sectionTitle}>Your Review</Text>
                          <Text style={styles.reviewText}>{reviewEntry.reviewText}</Text>
                        </View>
                      )}

                      {/* Afficher section review même sans reviewText si hasReview est true */}
                      {!reviewEntry?.reviewText && visitedCities.some(c => {
                        const cityMatch = c.name?.toLowerCase() === selectedCity.name.toLowerCase();
                        const countryFullName = countryCodeToName[selectedCity.countryCode];
                        const countryMatch = 
                          c.country === selectedCity.countryCode || 
                          c.country === countryFullName || 
                          c.country?.toLowerCase() === countryFullName?.toLowerCase() || 
                          c.country?.toLowerCase() === selectedCity.countryCode.toLowerCase();
                        return cityMatch && countryMatch && c.hasReview === true;
                      }) && (
                        <View style={styles.sectionContainer}>
                          <Text style={styles.sectionTitle}>Your Review</Text>
                          <Text style={styles.reviewText}>You have reviewed this city</Text>
                        </View>
                      )}

                      {/* Fallback si pas de contenu spécifique */}
                      {!manualRatingEntry?.rating && !beenThereEntry && !reviewEntry?.reviewText && !visitedCities.some(c => {
                        const cityMatch = c.name?.toLowerCase() === selectedCity.name.toLowerCase();
                        const countryFullName = countryCodeToName[selectedCity.countryCode];
                        const countryMatch = 
                          c.country === selectedCity.countryCode || 
                          c.country === countryFullName || 
                          c.country?.toLowerCase() === countryFullName?.toLowerCase() || 
                          c.country?.toLowerCase() === selectedCity.countryCode.toLowerCase();
                        return cityMatch && countryMatch && c.hasReview === true;
                      }) && (
                        <View style={styles.sectionContainer}>
                          <Text style={styles.sectionTitle}>Your Experience</Text>
                          <Text style={styles.reviewText}>You have visited this city!</Text>
                        </View>
                      )}
                    </View>
                  );
                })()}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
    flex: 1,
  },
  cityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  reviewIcon: {
    marginLeft: 8,
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
  // Styles pour le modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    justifyContent: 'flex-end',
  },
  reviewModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 15,
    paddingTop: 20,
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalScroll: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  postsContainer: {
    paddingBottom: 20,
  },
  postWrapper: {
    marginBottom: 16,
  },
  noPostsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noPostsText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  // Styles pour la carte de rating manuel
  ratingCard: {
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
    marginBottom: 20,
  },
  ratingCardFlag: {
    width: 32,
    height: 22,
    borderRadius: 3,
    marginRight: 12,
  },
  ratingCardContent: {
    flex: 1,
  },
  ratingCardCityName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
    flex: 1,
  },
  ratingCardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  ratingCardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingCardRating: {
    color: '#FFD700',
    fontSize: 13,
  },
  ratingCardSource: {
    color: '#bbb',
    fontSize: 13,
    fontStyle: 'italic',
    marginLeft: 4,
  },
  // Styles pour la page rating + review
  ratingReviewContainer: {
    paddingBottom: 20,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  reviewText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 0.7,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  // Styles pour "I have been there" dans la modal
});
