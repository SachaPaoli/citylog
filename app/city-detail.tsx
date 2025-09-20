import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, getDocs, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StarRating } from '../components/StarRating';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
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
  // État pour afficher la bottom sheet de rating
  const [showRateModal, setShowRateModal] = useState(false);
  // État pour afficher le modal de commentaire
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Fonction pour charger la review existante quand on ouvre le modal
  const loadExistingReview = () => {
    if (!city || !country) return;
    
    // Chercher la review existante dans visitedCities
    const existingReview = visitedCities.find(c => 
      c.name === city && 
      c.country === country && 
      (c.source === 'review' || c.reviewText)
    );
    
    console.log('[CityDetail] Loading existing review:', existingReview);
    
    if (existingReview && existingReview.reviewText) {
      setCommentText(existingReview.reviewText);
      return true; // Indique qu'on a trouvé une review existante
    } else {
      setCommentText('');
      return false; // Nouvelle review
    }
  };

  // État pour savoir si on édite une review existante
  const [isEditingReview, setIsEditingReview] = useState(false);
  
  // État pour le menu déroulant
  const [showMenu, setShowMenu] = useState(false);

  // Ouvrir le modal et charger la review existante
  const openCommentModal = () => {
    const hasExistingReview = loadExistingReview();
    setIsEditingReview(hasExistingReview || false);
    setShowCommentModal(true);
  };
  
  const { user } = useAuth();
  const { city, country, countryCode, flag, population } = useLocalSearchParams();

  // Nettoie le nom pour obtenir le nom de base (ex: "Marseille 01" -> "Marseille")
  function getBaseCityName(name: string): string {
    if (!name) return '';
    // Prend le premier mot avant un chiffre ou un séparateur
    return name.replace(/([\s-]?\d+.*$)/, '').trim();
  }

  // Cache local pour les images de villes (évite les requêtes inutiles)
  const cityImageCache = React.useRef<{ [key: string]: string | null }>({});


  // État pour l'URL de l'image de la ville
  const [cityImageUrl, setCityImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  
  // État pour la description de la ville
  const [cityDescription, setCityDescription] = useState<string | null>(null);
  const [isLoadingDescription, setIsLoadingDescription] = useState(false);

  // Cache pour les descriptions
  const cityDescriptionCache = React.useRef<{ [key: string]: string | null }>({});

  // État pour la carte avec pin rouge
  const [cityMapUrl, setCityMapUrl] = useState<string | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(false);

  // Cache pour les cartes
  const cityMapCache = React.useRef<{ [key: string]: string | null }>({});

  // Liste des capitales par pays qui méritent une vraie image
  const capitalsByCountry: Record<string, string> = {
    'France': 'Paris',
    'FR': 'Paris',
    'Germany': 'Berlin',
    'DE': 'Berlin',
    'Italy': 'Rome',
    'IT': 'Rome',
    'Spain': 'Madrid',
    'ES': 'Madrid',
    'United Kingdom': 'London',
    'GB': 'London',
    'United States': 'Washington',
    'US': 'Washington',
    'Canada': 'Ottawa',
    'CA': 'Ottawa',
    'Japan': 'Tokyo',
    'JP': 'Tokyo',
    'Australia': 'Canberra',
    'AU': 'Canberra',
    'Netherlands': 'Amsterdam',
    'NL': 'Amsterdam',
    'Switzerland': 'Bern',
    'CH': 'Bern',
    'Austria': 'Vienna',
    'AT': 'Vienna',
    'Belgium': 'Brussels',
    'BE': 'Brussels',
    'Portugal': 'Lisbon',
    'PT': 'Lisbon',
    'Greece': 'Athens',
    'GR': 'Athens',
    'Turkey': 'Ankara',
    'TR': 'Ankara',
    'Russia': 'Moscow',
    'RU': 'Moscow',
    'China': 'Beijing',
    'CN': 'Beijing',
    'India': 'New Delhi',
    'IN': 'New Delhi',
    'Brazil': 'Brasília',
    'BR': 'Brasília',
    'Argentina': 'Buenos Aires',
    'AR': 'Buenos Aires',
    'Mexico': 'Mexico City',
    'MX': 'Mexico City',
    'Egypt': 'Cairo',
    'EG': 'Cairo',
    'Thailand': 'Bangkok',
    'TH': 'Bangkok',
    'South Korea': 'Seoul',
    'KR': 'Seoul',
    'Morocco': 'Rabat',
    'MA': 'Rabat',
    'Czech Republic': 'Prague',
    'CZ': 'Prague',
    'Poland': 'Warsaw',
    'PL': 'Warsaw',
    'Hungary': 'Budapest',
    'HU': 'Budapest',
    'Denmark': 'Copenhagen',
    'DK': 'Copenhagen',
    'Sweden': 'Stockholm',
    'SE': 'Stockholm',
    'Norway': 'Oslo',
    'NO': 'Oslo',
    'Finland': 'Helsinki',
    'FI': 'Helsinki',
    'Ireland': 'Dublin',
    'IE': 'Dublin',
    'Croatia': 'Zagreb',
    'HR': 'Zagreb',
    'Slovenia': 'Ljubljana',
    'SI': 'Ljubljana',
    'Slovakia': 'Bratislava',
    'SK': 'Bratislava',
    'Romania': 'Bucharest',
    'RO': 'Bucharest',
    'Bulgaria': 'Sofia',
    'BG': 'Sofia',
    'Serbia': 'Belgrade',
    'RS': 'Belgrade',
    'Israel': 'Jerusalem',
    'IL': 'Jerusalem',
    'Jordan': 'Amman',
    'JO': 'Amman',
    'Lebanon': 'Beirut',
    'LB': 'Beirut',
    'UAE': 'Abu Dhabi',
    'AE': 'Abu Dhabi',
    'Qatar': 'Doha',
    'QA': 'Doha',
    'Singapore': 'Singapore',
    'SG': 'Singapore',
    'Malaysia': 'Kuala Lumpur',
    'MY': 'Kuala Lumpur',
    'Indonesia': 'Jakarta',
    'ID': 'Jakarta',
    'Philippines': 'Manila',
    'PH': 'Manila',
    'Vietnam': 'Hanoi',
    'VN': 'Hanoi',
    'South Africa': 'Cape Town',
    'ZA': 'Cape Town',
    'Kenya': 'Nairobi',
    'KE': 'Nairobi',
    'Nigeria': 'Abuja',
    'NG': 'Abuja',
    'Chile': 'Santiago',
    'CL': 'Santiago',
    'Peru': 'Lima',
    'PE': 'Lima',
    'Colombia': 'Bogotá',
    'CO': 'Bogotá',
    'Venezuela': 'Caracas',
    'VE': 'Caracas',
    'Uruguay': 'Montevideo',
    'UY': 'Montevideo',
    'New Zealand': 'Wellington',
    'NZ': 'Wellington'
  };

  // Normalise un nom en retirant les accents pour la comparaison
  function normalizeString(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Retire les accents
      .toLowerCase()
      .trim();
  }

  // Vérifie si une ville est une capitale dans son pays
  function isCapital(cityName: string, countryName: string): boolean {
    const baseName = getBaseCityName(cityName);
    const capital = capitalsByCountry[countryName];
    
    console.log(`[Capital] Checking: "${cityName}" (base: "${baseName}") in ${countryName}`);
    console.log(`[Capital] Capital of ${countryName}:`, capital);
    
    // Si pas de capitale définie pour ce pays
    if (!capital) {
      console.log(`[Capital] REJECTED: No capital defined for ${countryName}`);
      return false;
    }
    
    // Si le nom original contient des chiffres/suffixes, ce n'est pas la ville principale
    if (cityName !== baseName) {
      console.log(`[Capital] REJECTED: "${cityName}" is not the main city (base would be "${baseName}")`);
      return false;
    }
    
    const normalizedBaseName = normalizeString(baseName);
    const normalizedCapital = normalizeString(capital);
    
    // SEULEMENT match exact avec la capitale
    const exactMatch = normalizedCapital === normalizedBaseName;
    
    if (exactMatch) {
      console.log(`[Capital] EXACT MATCH found: ${capital} (${normalizedCapital}) === ${baseName} (${normalizedBaseName})`);
    } else {
      console.log(`[Capital] NO MATCH: ${capital} (${normalizedCapital}) !== ${baseName} (${normalizedBaseName})`);
    }
    
    console.log(`[Capital] Result for ${baseName}: ${exactMatch}`);
    return exactMatch;
  }

  // Récupère les coordonnées de la ville via GeoNames et génère une carte avec pin rouge
  async function fetchCityMap(cityName: string, countryName: string) {
    setIsLoadingMap(true);
    const baseName = getBaseCityName(cityName);
    const cacheKey = `${baseName.toLowerCase()}_${countryName.toLowerCase()}_map`;
    
    console.log(`[FetchMap] Starting fetch for: ${baseName}, ${countryName}`);
    
    // Vérification du cache - ON FORCE LE RECHARGEMENT POUR TESTER
    // if (cityMapCache.current[cacheKey] !== undefined) {
    //   console.log(`[FetchMap] Found in cache: ${cityMapCache.current[cacheKey]}`);
    //   setCityMapUrl(cityMapCache.current[cacheKey]);
    //   setIsLoadingMap(false);
    //   return;
    // }

    try {
      console.log(`[FetchMap] Generating country outline map for: ${baseName} in ${countryName}`);
      
      // Cartes SVG simples depuis un CDN fiable
      const countryOutlines: Record<string, string> = {
        'france': 'https://cdn.jsdelivr.net/npm/svg-country-flags@1.2.10/svg/fr.svg',
        'fr': 'https://cdn.jsdelivr.net/npm/svg-country-flags@1.2.10/svg/fr.svg',
        'germany': 'https://cdn.jsdelivr.net/npm/svg-country-flags@1.2.10/svg/de.svg',
        'de': 'https://cdn.jsdelivr.net/npm/svg-country-flags@1.2.10/svg/de.svg',
        'italy': 'https://cdn.jsdelivr.net/npm/svg-country-flags@1.2.10/svg/it.svg',
        'it': 'https://cdn.jsdelivr.net/npm/svg-country-flags@1.2.10/svg/it.svg',
        'spain': 'https://cdn.jsdelivr.net/npm/svg-country-flags@1.2.10/svg/es.svg',
        'es': 'https://cdn.jsdelivr.net/npm/svg-country-flags@1.2.10/svg/es.svg',
        'united kingdom': 'https://cdn.jsdelivr.net/npm/svg-country-flags@1.2.10/svg/gb.svg',
        'gb': 'https://cdn.jsdelivr.net/npm/svg-country-flags@1.2.10/svg/gb.svg',
        'united states': 'https://cdn.jsdelivr.net/npm/svg-country-flags@1.2.10/svg/us.svg',
        'us': 'https://cdn.jsdelivr.net/npm/svg-country-flags@1.2.10/svg/us.svg',
        'japan': 'https://cdn.jsdelivr.net/npm/svg-country-flags@1.2.10/svg/jp.svg',
        'jp': 'https://cdn.jsdelivr.net/npm/svg-country-flags@1.2.10/svg/jp.svg',
      };
      
      const countryKey = countryName.toLowerCase();
      let mapUrl = countryOutlines[countryKey];
      
      if (!mapUrl) {
        // Fallback : image simple avec le nom du pays
        mapUrl = `https://via.placeholder.com/400x200/f0f0f0/333333?text=🗺️+${encodeURIComponent(countryName)}`;
        console.log(`[FetchMap] Using fallback for: ${countryName}`);
      } else {
        console.log(`[FetchMap] Using country outline for: ${countryName}`);
      }
      
      // Stocker dans le cache et l'état  
      cityMapCache.current[cacheKey] = mapUrl;
      setCityMapUrl(mapUrl);
      
    } catch (error) {
      console.log(`[FetchMap] Error fetching map for ${baseName}:`, error);
      cityMapCache.current[cacheKey] = null;
      setCityMapUrl(null);
    }
    
    setIsLoadingMap(false);
  }

  // Récupère une image de la ville via Wikimedia pour les capitales uniquement
  async function fetchCityImage(cityName: string, countryName: string) {
    setIsLoadingImage(true);
    const baseName = getBaseCityName(cityName);
    const cacheKey = `${baseName.toLowerCase()}_${countryName.toLowerCase()}`;
    
    console.log(`[FetchImage] Starting fetch for: ${baseName}, ${countryName}`);
    
    // Vérification du cache
    if (cityImageCache.current[cacheKey] !== undefined) {
      console.log(`[FetchImage] Found in cache: ${cityImageCache.current[cacheKey]}`);
      setCityImageUrl(cityImageCache.current[cacheKey]);
      setIsLoadingImage(false);
      return;
    }

    // Vérifier si la ville est une capitale
    const isFamous = isCapital(cityName, countryName);
    console.log(`[FetchImage] Is ${baseName} a capital? ${isFamous}`);

    // Si la ville n'est pas une capitale, affiche directement le drapeau
    if (!isFamous) {
      console.log(`[FetchImage] Not a capital, using flag for: ${baseName}`);
      cityImageCache.current[cacheKey] = flagUrl;
      setCityImageUrl(flagUrl);
      setIsLoadingImage(false);
      return;
    }

    console.log(`[FetchImage] Fetching real image for capital city: ${baseName}`);
    let imgUrl: string | null = null;
    let wikidataId: string | null = null;

    // 1. Cherche la page Wikipedia pour la ville célèbre
    try {
      console.log(`[FetchImage] Searching Wikipedia for: ${baseName}, ${countryName}`);
      const searchRes = await axios.get('https://en.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          list: 'search',
          srsearch: `${baseName}, ${countryName}`,
          format: 'json',
          origin: '*',
        },
        timeout: 10000
      });
      const page = searchRes.data?.query?.search?.[0];
      console.log(`[FetchImage] Wikipedia search result:`, page?.title);
      
      if (page) {
        // 2. Récupère l'ID Wikidata via la page Wikipedia
        const pageInfoRes = await axios.get('https://en.wikipedia.org/w/api.php', {
          params: {
            action: 'query',
            prop: 'pageprops',
            pageids: page.pageid,
            format: 'json',
            origin: '*',
          },
          timeout: 10000
        });
        const pageData = pageInfoRes.data?.query?.pages?.[page.pageid];
        wikidataId = pageData?.pageprops?.wikibase_item || null;
        console.log(`[FetchImage] Wikidata ID found: ${wikidataId}`);
      }
    } catch (e) {
      console.log('[FetchImage] Wikipedia search failed for famous city:', baseName, e);
    }

    // 3. Si Wikidata trouvé, récupère l'image officielle (P18)
    if (wikidataId) {
      try {
        console.log(`[FetchImage] Fetching Wikidata image for: ${wikidataId}`);
        const wikidataRes = await axios.get(`https://www.wikidata.org/w/api.php`, {
          params: {
            action: 'wbgetclaims',
            entity: wikidataId,
            property: 'P18',
            format: 'json',
            origin: '*',
          },
          timeout: 10000
        });
        const claims = wikidataRes.data?.claims?.P18;
        if (claims && claims.length > 0) {
          // P18 = nom du fichier image sur Wikimedia Commons
          const fileName = claims[0].mainsnak.datavalue.value;
          // Transforme le nom en URL
          imgUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
          console.log(`[FetchImage] Image URL found: ${imgUrl}`);
        }
      } catch (e) {
        console.log('[FetchImage] Wikidata image fetch failed for famous city:', baseName, e);
      }
    }

    // 4. Résultat final
    if (imgUrl) {
      console.log(`[FetchImage] SUCCESS: Real image found for ${baseName}`);
      cityImageCache.current[cacheKey] = imgUrl;
      setCityImageUrl(imgUrl);
    } else {
      console.log(`[FetchImage] FALLBACK: Using flag for famous city ${baseName} (no image found)`);
      cityImageCache.current[cacheKey] = flagUrl;
      setCityImageUrl(flagUrl);
    }
    
    setIsLoadingImage(false);
  }

  // Charge l'image au montage ou quand la ville change
  useEffect(() => {
    console.log('[UseEffect] Triggered with city:', city, 'country:', country);
    if (city && country) {
      console.log('[UseEffect] Calling fetchCityMap...');
      fetchCityImage(city as string, country as string);
      fetchCityDescription(city as string, country as string);
      fetchCityMap(city as string, country as string);
    } else {
      console.log('[UseEffect] Skipping fetch - missing city or country');
    }
  }, [city, country]);

  // Récupère une description courte de la ville via Wikipedia
  async function fetchCityDescription(cityName: string, countryName: string) {
    setIsLoadingDescription(true);
    const baseName = getBaseCityName(cityName);
    const cacheKey = `${baseName.toLowerCase()}_${countryName.toLowerCase()}_desc`;
    
    console.log(`[FetchDescription] Starting fetch for: ${baseName}, ${countryName}`);
    
    // Vérification du cache
    if (cityDescriptionCache.current[cacheKey] !== undefined) {
      console.log(`[FetchDescription] Found in cache: ${cityDescriptionCache.current[cacheKey]}`);
      setCityDescription(cityDescriptionCache.current[cacheKey]);
      setIsLoadingDescription(false);
      return;
    }

    try {
      let description: string | null = null;
      
      // Construire différentes variantes de recherche pour être plus précis
      const countryLong = getCountryName(countryName);
      const searchQueries = [
        `${baseName}, ${countryLong}`,  // Ex: "Paris, France"
        `${baseName}, ${countryName}`,  // Ex: "Paris, FR" 
        `${baseName} ${countryLong}`,   // Ex: "Paris France"
        `${baseName} ${countryName}`    // Ex: "Paris FR"
      ];
      
      console.log(`[FetchDescription] Trying search queries for ${baseName}:`, searchQueries);
      
      // Essayer chaque variante de recherche jusqu'à trouver une description
      for (const searchQuery of searchQueries) {
        try {
          const searchApiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=0&gsrlimit=3&gsrsearch=${encodeURIComponent(searchQuery)}&prop=extracts&exintro=true&explaintext=true&exsentences=3&origin=*`;
          
          console.log(`[FetchDescription] Trying search: "${searchQuery}"`);
          const searchResponse = await axios.get(searchApiUrl, { timeout: 8000 });
          
          if (searchResponse.data?.query?.pages) {
            const pages = Object.values(searchResponse.data.query.pages) as any[];
            
            // Chercher la page qui correspond le mieux (contient le nom du pays)
            for (const page of pages) {
              if (page.extract && page.title) {
                console.log(`[FetchDescription] Found page: "${page.title}"`);
                
                // Vérifier que la page correspond bien à notre ville/pays
                const pageTitle = page.title.toLowerCase();
                const cityLower = baseName.toLowerCase();
                const countryLower = countryLong.toLowerCase();
                const countryCodeLower = countryName.toLowerCase();
                
                if (pageTitle.includes(cityLower) && 
                    (pageTitle.includes(countryLower) || pageTitle.includes(countryCodeLower))) {
                  description = page.extract;
                  console.log(`[FetchDescription] Perfect match found: "${page.title}"`);
                  break;
                } else if (pageTitle.includes(cityLower) && !description) {
                  // Si pas de match parfait, garder comme fallback
                  description = page.extract;
                  console.log(`[FetchDescription] Partial match as fallback: "${page.title}"`);
                }
              }
            }
            
            if (description) break; // Si on a trouvé une description, arrêter
          }
        } catch (queryError) {
          console.log(`[FetchDescription] Search query failed: "${searchQuery}"`, queryError);
          continue;
        }
      }
      
      // Si aucune recherche spécifique n'a fonctionné, essayer juste le nom de la ville
      if (!description) {
        try {
          const directUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(baseName)}`;
          console.log(`[FetchDescription] Trying direct summary for: ${baseName}`);
          
          const summaryResponse = await axios.get(directUrl, { timeout: 8000 });
          if (summaryResponse.data && summaryResponse.data.extract) {
            description = summaryResponse.data.extract;
            console.log(`[FetchDescription] Got direct summary as last resort`);
          }
        } catch (directError) {
          console.log(`[FetchDescription] Direct summary also failed`);
        }
      }
      
      // Limiter à 3 phrases maximum
      if (description) {
        const sentences = description.split('. ');
        if (sentences.length > 3) {
          description = sentences.slice(0, 3).join('. ') + '.';
        }
      }
      
      // Sauvegarder dans le cache
      cityDescriptionCache.current[cacheKey] = description;
      setCityDescription(description);
      
      if (description) {
        console.log(`[FetchDescription] SUCCESS: Description found for ${baseName}, ${countryName}`);
      } else {
        console.log(`[FetchDescription] NO DESCRIPTION: No summary found for ${baseName}, ${countryName}`);
      }
      
    } catch (error) {
      console.log(`[FetchDescription] ERROR: Failed to fetch description for ${baseName}, ${countryName}:`, error);
      cityDescriptionCache.current[cacheKey] = null;
      setCityDescription(null);
    }
    
    setIsLoadingDescription(false);
  }
  const router = useRouter();
  
  const { addOrUpdateCity, removeCity, removeCitySource, cities: visitedCities } = useVisitedCities();
  
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'borderColor');
  const mainBlue = '#2051A4'; // Bleu principal pour uniformiser les boutons
  const headerColor = '#181C24'; // Même couleur que trip-detail
  const whiteColor = '#FFFFFF';

  // État pour stocker la note moyenne globale
  const [globalAverageRating, setGlobalAverageRating] = useState<number | null>(null);
  const [isLoadingAverage, setIsLoadingAverage] = useState(false);

  // Calcule la note moyenne de TOUS les utilisateurs pour cette ville
  const calculateGlobalAverageRating = async () => {
    if (!city || !country) return null;
    
    try {
      setIsLoadingAverage(true);
      console.log('[CityDetail] Calculating global average for:', city, country);
      
      // Récupère tous les utilisateurs
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      
      const allRatings: number[] = [];
      
      console.log('[CityDetail] Total users found:', usersSnapshot.size);
      
      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        const visitedCities = userData.visitedCities || [];
        
        console.log(`[CityDetail] User ${userDoc.id} has ${visitedCities.length} visited cities`);
        
        // Cherche toutes les notes pour cette ville de cet utilisateur
        visitedCities.forEach((cityData: any) => {
          console.log(`[CityDetail] Checking city: ${cityData.name} in ${cityData.country}, rating: ${cityData.rating}`);
          
          if (cityData.name === city && 
              cityData.country === country && 
              cityData.rating !== undefined && 
              cityData.rating > 0) {
            allRatings.push(cityData.rating);
            console.log('[CityDetail] ✅ Found matching rating:', cityData.rating, 'from user:', userDoc.id);
          }
        });
      });
      
      console.log('[CityDetail] All ratings found:', allRatings);
      
      if (allRatings.length === 0) {
        console.log('[CityDetail] No ratings found, setting globalAverageRating to null');
        setGlobalAverageRating(null);
        return null;
      }
      
      const average = allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length;
      console.log('[CityDetail] Global average calculated:', average);
      setGlobalAverageRating(average);
      return average;
      
    } catch (error) {
      console.error('[CityDetail] Error calculating global average:', error);
      setGlobalAverageRating(null);
      return null;
    } finally {
      setIsLoadingAverage(false);
    }
  };

  // Charge la note moyenne au montage du composant
  useEffect(() => {
    calculateGlobalAverageRating();
  }, [city, country]);

  // Récupère la note et le statut pour cette ville
  const manualEntry = visitedCities.find(
    c => c.name === city && c.country === country && c.source === 'note'
  );
  const postEntry = visitedCities.find(
    c => c.name === city && c.country === country && c.source === 'post'
  );
  const initialRating = manualEntry?.rating ?? postEntry?.rating ?? 0;
  const initialBeenThere = Boolean(manualEntry?.beenThere || postEntry?.beenThere);

  const [userRating, setUserRating] = useState(initialRating);
  const [hasBeenThere, setHasBeenThere] = useState(initialBeenThere);
  const [prevHasBeenThere, setPrevHasBeenThere] = useState(initialBeenThere);
  const curtainAnimation = useState(new Animated.Value(initialBeenThere ? 1 : 0))[0];

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
    // Vérifie beenThere pour toutes les entrées de cette ville
    const currentBeenThere = Boolean(manualEntry?.beenThere || postEntry?.beenThere);
    
    console.log('[CityDetail] Setting userRating to:', currentRating);
    console.log('[CityDetail] Setting hasBeenThere to:', currentBeenThere);
    
    setUserRating(currentRating);
    setHasBeenThere(currentBeenThere);
    setPrevHasBeenThere(currentBeenThere); // Évite l'animation lors de la sync
  }, [visitedCities, city, country]);

  // Animation du rideau - évite l'animation inutile quand on est déjà dans le bon état
  useEffect(() => {
    // Ne lance l'animation que si l'état a vraiment changé
    if (prevHasBeenThere !== hasBeenThere) {
      Animated.timing(curtainAnimation, {
        toValue: hasBeenThere ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setPrevHasBeenThere(hasBeenThere);
    }
  }, [hasBeenThere, prevHasBeenThere, curtainAnimation]);

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
      setPrevHasBeenThere(false); // Évite l'animation
      return;
    }
    
    console.log('[CityDetail] Adding/updating city with rating:', userRating);
    
    // Vérifie si la ville était déjà marquée comme visitée
    const wasAlreadyVisited = hasBeenThere;
    
    // Ajoute/met à jour la ville avec la note
    addOrUpdateCity({
      name: city as string,
      country: country as string,
      flag: (flag as string) || '', // Évite undefined
      rating: userRating,
      beenThere: true, // TOUJOURS true quand on donne une note
      source: 'note',
    });
    
    if (wasAlreadyVisited) {
      // Ville déjà visitée → retour immédiat sans animation
      router.back();
    } else {
      // Ville vierge → animation puis retour après un délai
      setHasBeenThere(true);
      // Retour automatique après l'animation
      setTimeout(() => {
        router.back();
      }, 500); // 500ms pour laisser le temps à l'animation de se jouer
    }
  };

  const toggleHasBeenThere = () => {
    if (!city || !country) return;
    
    console.log('[CityDetail] toggleHasBeenThere called, current hasBeenThere:', hasBeenThere);
    
    // Vérifie s'il y a une note manuelle (comme dans l'ancienne version)
    const manualNote = visitedCities.find(
      c => (c.name === city || c.city === city) && c.country === country && c.source === 'note' && typeof c.rating === 'number'
    );
    
    console.log('[CityDetail] Found manualNote:', manualNote);
    
    const newValue = !hasBeenThere;
    console.log('[CityDetail] newValue will be:', newValue);
    
    if (!newValue && manualNote) {
      // Si on essaie de retirer "beenThere" mais qu'il y a une note, on ne fait rien
      // (dans l'ancienne version ça affichait une erreur)
      console.log('[CityDetail] Cannot remove beenThere because there is a manual note');
      return;
    }
    
    setHasBeenThere(newValue);
    setPrevHasBeenThere(newValue); // Met à jour immédiatement pour éviter l'animation
    
    if (newValue) {
      console.log('[CityDetail] Adding city as visited without rating');
      // Ajoute la ville comme visitée (comme dans l'ancienne version)
      addOrUpdateCity({
        name: city as string,
        country: country as string,
        flag: (flag as string) || '', // Évite undefined
        rating: userRating > 0 ? userRating : undefined, // Seulement si rating > 0
        beenThere: true,
        source: 'note',
      });
    } else {
      console.log('[CityDetail] Removing city completely');
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
    setPrevHasBeenThere(false); // Évite l'animation
  };

  // Fonction pour soumettre un commentaire/review
  const handleSubmitComment = async () => {
    if (!commentText.trim() || !user?.uid || !city || !country) return;
    
    try {
      setIsSubmittingComment(true);
      
      console.log('[CityDetail] Submitting review for:', city, country);
      
      // Créer l'objet review
      const reviewData = {
    yauserId: user.uid,
        city: city as string,
        country: country as string,
        comment: commentText.trim(),
        createdAt: new Date(),
        userDisplayName: user.displayName || user.email || 'Anonymous'
      };
      
      // Sauvegarder dans Firestore
      await addDoc(collection(db, 'cityReviews'), reviewData);
      
      // Ajouter à visitedCities avec la review
      await addOrUpdateCity({
        name: city as string,
        country: country as string,
        flag: (flag as string) || '',
        beenThere: true,
        source: 'review',
        hasReview: true,
        reviewText: commentText.trim()
      });
      
      // Fermer le modal et reset
      setShowCommentModal(false);
      setCommentText('');
      
      console.log('[CityDetail] Review submitted successfully');
      
    } catch (error) {
      console.error('[CityDetail] Error submitting review:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Flag haute résolution (320px)
  const flagUrl = `https://flagcdn.com/w320/${
    countryCode
      ? (Array.isArray(countryCode) ? countryCode[0] : countryCode).toLowerCase()
      : country
        ? (Array.isArray(country) ? country[0] : country).toLowerCase()
        : ''
  }.png`;

  // Loader global pour toute la page
  const [showLoader, setShowLoader] = useState(true);
  // On attend que l'image, la carte ET la note moyenne soient chargées
  useEffect(() => {
    if (isLoadingImage || isLoadingAverage || isLoadingMap) {
      setShowLoader(true);
    } else {
      setShowLoader(false);
    }
  }, [isLoadingImage, isLoadingAverage, isLoadingMap]);

  // Optimise le chargement : lance image, carte et moyenne en parallèle
  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      setShowLoader(true);
      setIsLoadingImage(true);
      setIsLoadingAverage(true);
      setIsLoadingMap(true);
      const imgPromise = city && country ? fetchCityImage(city as string, country as string) : Promise.resolve();
      const avgPromise = calculateGlobalAverageRating();
      const mapPromise = city && country ? fetchCityMap(city as string, country as string) : Promise.resolve();
      await Promise.all([imgPromise, avgPromise, mapPromise]);
      if (!cancelled) setShowLoader(false);
    }
    loadAll();
    return () => { cancelled = true; };
  }, [city, country]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {showLoader ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: headerColor }}>
          <ActivityIndicator size="large" color="#2051A4" />
        </View>
      ) : (
        <View style={[styles.container, { backgroundColor: headerColor }]}> 
          {/* Header avec bouton retour */}
          <View style={[styles.header, { backgroundColor: headerColor }]}> 
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={whiteColor} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => setShowMenu(true)}
            >
              <Text style={[styles.menuButtonText, { color: whiteColor }]}>⋯</Text>
            </TouchableOpacity>
          </View>

          {/* Menu popup */}
          <Modal
            visible={showMenu}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowMenu(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              onPress={() => setShowMenu(false)}
            >
              <View style={[styles.menuContainer, { backgroundColor }]}> 
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => setShowMenu(false)}
                >
                  <Text style={[styles.menuItemText, { color: textColor }]}>Add to wishlist</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={() => setShowMenu(false)}
                >
                  <Text style={[styles.menuItemText, { color: textColor }]}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={() => setShowMenu(false)}
                >
                  <Text style={[styles.menuItemText, { color: textColor }]}>Back</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Carte de localisation avec pin rouge */}
          <View style={styles.mapContainer}>
            {cityMapUrl ? (
              <>
                <Image
                  source={{ uri: cityMapUrl }}
                  style={styles.cityMap}
                  resizeMode="contain"
                  onLoadStart={() => console.log('[FetchMap] Image loading started:', cityMapUrl)}
                  onLoad={() => console.log('[FetchMap] Image loaded successfully')}
                  onError={(error) => {
                    console.log('[FetchMap] Image load error:', error);
                    console.log('[FetchMap] Failed URL was:', cityMapUrl);
                  }}
                  onLoadEnd={() => console.log('[FetchMap] Image load ended')}
                />
                {/* Pin rouge au centre de la carte */}
                <View style={styles.mapPinOverlay}>
                  <View style={styles.redPin} />
                </View>
              </>
            ) : (
              <Text style={{ color: '#fff', textAlign: 'center', padding: 20 }}>Pas d'URL de carte</Text>
            )}
          </View>
          
          {/* Debug: Toujours afficher l'état de chargement - À SUPPRIMER PLUS TARD */}
          <View style={{ padding: 10, backgroundColor: '#333' }}>
            <Text style={{ color: '#fff', fontSize: 10 }}>
              Loading Map: {isLoadingMap ? 'YES' : 'NO'}
            </Text>
            <Text style={{ color: '#fff', fontSize: 10 }}>
              Map URL: {cityMapUrl || 'NONE'}
            </Text>
            <Text style={{ color: '#fff', fontSize: 10 }}>
              City: {city} | Country: {country}
            </Text>
          </View>

          {/* Image de la ville ou layout pour villes non-capitales */}
          <View style={{ position: 'relative', width: '100%', marginTop: 0, marginBottom: 5 }}>
            {cityImageUrl && cityImageUrl !== require('../assets/images/placeholder.png') && (
              <>
                {/* Layout spécial pour les villes non-capitales : drapeau à gauche + infos à droite */}
                {!isCapital(city as string, country as string) ? (
                  <View style={styles.flagLayout}>
                    <Image
                      source={{ uri: flagUrl }}
                      style={styles.smallFlag}
                    />
                    <View style={styles.cityInfoContainer}>
                      <Text style={[styles.cityNameInFlag, { color: textColor }]}>{city}</Text>
                      <Text style={[styles.countryNameInFlag, { color: textColor }]}>
                        {country && (country as string).length <= 3
                          ? getCountryName(country as string)
                          : country}
                      </Text>
                      
                      {/* Note moyenne avec étoiles */}
                      <View style={styles.averageRatingInFlag}>
                        {(globalAverageRating !== null && globalAverageRating > 0) ? (
                          <>
                            <StarRating 
                              rating={globalAverageRating} 
                              readonly={true} 
                              size="medium"
                              showRating={false}
                              color="#f5c518"
                            />
                            <Text style={styles.averageRatingTextInFlag}>
                              {globalAverageRating.toFixed(1)}
                            </Text>
                          </>
                        ) : userRating > 0 ? (
                          <>
                            <StarRating 
                              rating={userRating} 
                              readonly={true} 
                              size="medium"
                              showRating={false}
                              color="#f5c518"
                            />
                            <Text style={styles.averageRatingTextInFlag}>
                              {userRating.toFixed(1)}
                            </Text>
                          </>
                        ) : (
                          <>
                            <StarRating 
                              rating={0} 
                              readonly={true} 
                              size="medium"
                              showRating={false}
                              color="#666"
                            />
                            <Text style={[styles.averageRatingTextInFlag, { color: '#666' }]}>
                              ...
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                ) : (
                  // Layout normal pour les images de capitales
                  <>
                    <Image
                      source={{ uri: cityImageUrl }}
                      style={{ width: '100%', height: 200, borderRadius: 0, resizeMode: 'cover' }}
                      onLoadEnd={() => setIsLoadingImage(false)}
                    />
                  </>
                )}
              </>
            )}
          </View>

          {/* Sections pour les villes capitales */}
          {isCapital(city as string, country as string) && cityImageUrl && cityImageUrl !== flagUrl && (
            <View style={[styles.nonCapitalSections, { backgroundColor }]}>
              {/* Nom de la ville et du pays */}
              <View style={styles.capitalCityInfo}>
                <Text style={[styles.capitalCityName, { color: textColor }]}>{city}</Text>
                <Text style={[styles.capitalCountryName, { color: textColor }]}>
                  {country && (country as string).length <= 3
                    ? getCountryName(country as string)
                    : country}
                </Text>
                
                {/* Note moyenne avec étoiles */}
                <View style={styles.averageRatingInFlag}>
                  {(globalAverageRating !== null && globalAverageRating > 0) ? (
                    <>
                      <StarRating 
                        rating={globalAverageRating} 
                        readonly={true} 
                        size="medium"
                        showRating={false}
                        color="#f5c518"
                      />
                      <Text style={styles.averageRatingTextInFlag}>
                        {globalAverageRating.toFixed(1)}
                      </Text>
                    </>
                  ) : userRating > 0 ? (
                    <>
                      <StarRating 
                        rating={userRating} 
                        readonly={true} 
                        size="medium"
                        showRating={false}
                        color="#f5c518"
                      />
                      <Text style={styles.averageRatingTextInFlag}>
                        {userRating.toFixed(1)}
                      </Text>
                    </>
                  ) : (
                    <>
                      <StarRating 
                        rating={0} 
                        readonly={true} 
                        size="medium"
                        showRating={false}
                        color="#666"
                      />
                      <Text style={[styles.averageRatingTextInFlag, { color: '#666' }]}>
                        ...
                      </Text>
                    </>
                  )}
                </View>
              </View>
              
              {/* Ligne de séparation */}
              <View style={styles.separatorLine} />
              
              {/* Description de la ville */}
              {cityDescription && (
                <View style={styles.descriptionSection}>
                  <Text style={[styles.descriptionText, { color: textColor }]}>
                    {cityDescription}
                  </Text>
                </View>
              )}
              
              {/* Ligne de séparation après description */}
              {cityDescription && <View style={styles.separatorLine} />}
              
              {/* Boutons Comment et Rate */}
              <View style={styles.actionButtonsSection}>
                <TouchableOpacity
                  style={[styles.actionButtonStyle, styles.commentActionButton]}
                  onPress={openCommentModal}
                >
                  <Text style={styles.actionButtonText}>Comment</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButtonStyle, styles.rateActionButton]}
                  onPress={() => setShowRateModal(true)}
                >
                  <Text style={styles.actionButtonText}>Rate</Text>
                </TouchableOpacity>
              </View>
              
              {/* Ligne de séparation après boutons */}
              <View style={styles.separatorLine} />
            </View>
          )}

          {/* Sections pour les villes non-capitales */}
          {!isCapital(city as string, country as string) && (
            <View style={[styles.nonCapitalSections, { backgroundColor }]}>
              {/* Ligne de séparation */}
              <View style={styles.separatorLine} />
              
              {/* Description de la ville */}
              {cityDescription && (
                <View style={styles.descriptionSection}>
                  <Text style={[styles.descriptionText, { color: textColor }]}>
                    {cityDescription}
                  </Text>
                </View>
              )}
              
              {/* Ligne de séparation après description */}
              {cityDescription && <View style={styles.separatorLine} />}
              
              {/* Boutons Comment et Rate */}
              <View style={styles.actionButtonsSection}>
                <TouchableOpacity
                  style={[styles.actionButtonStyle, styles.commentActionButton]}
                  onPress={openCommentModal}
                >
                  <Text style={styles.actionButtonText}>Comment</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButtonStyle, styles.rateActionButton]}
                  onPress={() => setShowRateModal(true)}
                >
                  <Text style={styles.actionButtonText}>Rate</Text>
                </TouchableOpacity>
              </View>
              
              {/* Ligne de séparation après boutons */}
              <View style={styles.separatorLine} />
            </View>
          )}

          <ScrollView style={[styles.content, { backgroundColor }]} showsVerticalScrollIndicator={false}>
            {/* Le contenu spécifique aux villes est maintenant géré par les sections au-dessus */}
      
      {/* Modal 40% pour le système de rating avec animation slide */}
      <Modal
        visible={showRateModal}
        animationType="slide"
        presentationStyle="overFullScreen"
        transparent={true}
        onRequestClose={() => setShowRateModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowRateModal(false)} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: textColor }]}>×</Text>
              </TouchableOpacity>
            </View>
          <ScrollView style={styles.postModalScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Your rating</Text>
            <View style={styles.userRatingContainer}>
              <View style={styles.starsWrapper}>
                <StarRating 
                  rating={userRating} 
                  onRatingChange={handleRatingChange}
                  size="large"
                  color="#f5c518"
                  showRating={false}
                />
              </View>
            </View>
            <View style={styles.spacingAfterStars} />
            {userRating > 0 && (
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={[styles.clearButton, { borderColor }]}
                  onPress={handleDelete}
                >
                  <Text style={[styles.clearButtonText, { color: textColor }]}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: mainBlue }]}
                  onPress={handleSubmitRating}
                >
                  <Text style={styles.rateButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
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
          </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal 80% pour les commentaires/reviews */}
      <Modal
        visible={showCommentModal}
        animationType="slide"
        presentationStyle="overFullScreen"
        transparent={true}
        onRequestClose={() => setShowCommentModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.commentModalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.commentModalContent, { backgroundColor }]}>
            <View style={styles.commentModalHeader}>
              <TouchableOpacity onPress={() => setShowCommentModal(false)} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: textColor }]}>×</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSubmitComment}
                style={[styles.postReviewButton, { opacity: commentText.trim() ? 1 : 0.5 }]}
                disabled={!commentText.trim() || isSubmittingComment}
              >
                {isSubmittingComment ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.postReviewButtonText}>Post Review</Text>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.commentInputContainer}>
              <Text style={[styles.commentTitle, { color: textColor }]}>
                Share your experience in {city}
              </Text>
              <TextInput
                style={[styles.commentInput, { 
                  color: textColor, 
                  borderColor: textColor + '30'
                }]}
                placeholder="Write your review here..."
                placeholderTextColor={textColor + '70'}
                value={commentText}
                onChangeText={setCommentText}
                multiline={true}
                autoFocus={true}
                textAlignVertical="top"
                scrollEnabled={true}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
          </ScrollView>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // Styles modal 50% 
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0)', // Supprime l'ombre noire
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '50%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 15,
    paddingTop: 20, // Réduit l'espace pour la status bar
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
  postModalScroll: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  rateModalContent: {
    width: '100%',
    height: '75%',
    backgroundColor: '#181C24',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  closeModalButton: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#333',
  },
  closeModalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  rateButtonModal: {
    backgroundColor: '#2051A4',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentButton: {
    backgroundColor: '#666',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  commentButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
  rateButtonModalText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
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
    borderBottomColor: 'rgba(255,255,255,0.1)',
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
  content: {
    flex: 1,
    padding: 20,
    marginTop: -10,
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
    textAlign: 'center',
  },
  userRatingContainer: {
    alignItems: 'center',
    gap: 15,
  },
  starsWrapper: {
    transform: [{ scale: 1.3 }], // Agrandit les étoiles de 30%
  },
  spacingAfterStars: {
    height: 15, // Même espace qu'au dessus (gap: 15)
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
    borderWidth: 1,
    borderColor: '#2051A4',
    backgroundColor: 'transparent',
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
  averageRatingSection: {
    paddingHorizontal: 20,
    marginTop: 30,
    paddingBottom: 20,
  },
  averageRatingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  averageRatingContainer: {
    alignItems: 'center',
    gap: 12,
  },
  averageStarsWrapper: {
    transform: [{ scale: 1.1 }],
  },
  averageRatingText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#888',
    marginLeft: 6,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  // Styles pour le modal de commentaire
  commentModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    justifyContent: 'flex-end',
  },
  commentModalContent: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
  },
  commentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingTop: 20,
  },
  postReviewButton: {
    backgroundColor: '#2051A4',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  postReviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  commentInputContainer: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  commentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'top',
    minHeight: 200,
  },
  // Styles pour le layout drapeau
  flagLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    gap: 24,
  },
  smallFlag: {
    width: 100,
    height: 67,
    borderRadius: 10,
  },
  cityInfoContainer: {
    flex: 1,
    gap: 8,
  },
  cityNameInFlag: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  countryNameInFlag: {
    fontSize: 16,
    fontWeight: '500',
  },
  cityDescriptionInFlag: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    opacity: 0.8,
  },
  cityDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 12,
    marginHorizontal: 20,
    opacity: 0.8,
  },
  averageRatingInFlag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  averageRatingTextInFlag: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f5c518',
  },
  buttonRowInFlag: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  commentButtonInFlag: {
    backgroundColor: '#666',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  commentButtonTextInFlag: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rateButtonInFlag: {
    backgroundColor: '#2051A4',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  rateButtonTextInFlag: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Styles pour les sections des villes non-capitales
  nonCapitalSections: {
    paddingHorizontal: 0,
  },
  separatorLine: {
    height: 0.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  descriptionSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
    textAlign: 'center',
  },
  actionButtonsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionButtonStyle: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    minWidth: 100,
    alignItems: 'center',
  },
  commentActionButton: {
    backgroundColor: '#666',
  },
  rateActionButton: {
    backgroundColor: '#2051A4',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Styles pour le menu trois points
  menuButton: {
    padding: 8,
    width: 50,
    height: 40,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 5,
    paddingTop: -5,
  },
  menuButtonText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 16,
    textAlign: 'center',
  },
  // Styles pour les infos des capitales
  capitalCityInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  capitalCityName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  capitalCountryName: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 8,
  },
  // Styles pour la carte de localisation
  mapContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
    marginBottom: 10,
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  cityMap: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  mapPinOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  redPin: {
    width: 20,
    height: 20,
    backgroundColor: '#ff0000',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
