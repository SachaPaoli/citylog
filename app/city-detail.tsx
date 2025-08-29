import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StarRating } from '../components/StarRating';
import { db } from '../config/firebase';
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


  // Récupère une image de la ville via Wikimedia, avec cache et gestion des doublons
  // Nouvelle logique : Wikidata P18
  async function fetchCityImage(cityName: string, countryName: string) {
    setIsLoadingImage(true);
    const baseName = getBaseCityName(cityName);
    const cacheKey = `${baseName.toLowerCase()}_${countryName.toLowerCase()}`;
    if (cityImageCache.current[cacheKey] !== undefined) {
      setCityImageUrl(cityImageCache.current[cacheKey]);
      setIsLoadingImage(false);
      return;
    }
    let imgUrl: string | null = null;
    let wikidataId: string | null = null;
    // 1. Cherche la page Wikipedia pour la ville
    try {
      const searchRes = await axios.get('https://en.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          list: 'search',
          srsearch: `${baseName}, ${countryName}`,
          format: 'json',
          origin: '*',
        },
      });
      const page = searchRes.data?.query?.search?.[0];
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
        });
        const pageData = pageInfoRes.data?.query?.pages?.[page.pageid];
        wikidataId = pageData?.pageprops?.wikibase_item || null;
      }
    } catch (e) {
      // ignore
    }
    // 3. Si Wikidata trouvé, récupère l'image officielle (P18)
    if (wikidataId) {
      try {
        const wikidataRes = await axios.get(`https://www.wikidata.org/w/api.php`, {
          params: {
            action: 'wbgetclaims',
            entity: wikidataId,
            property: 'P18',
            format: 'json',
            origin: '*',
          },
        });
        const claims = wikidataRes.data?.claims?.P18;
        if (claims && claims.length > 0) {
          // P18 = nom du fichier image sur Wikimedia Commons
          const fileName = claims[0].mainsnak.datavalue.value;
          // Transforme le nom en URL
          // https://commons.wikimedia.org/wiki/Special:FilePath/{fileName}
          imgUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
        }
      } catch (e) {
        // ignore
      }
    }
    // 4. Fallback : drapeau si aucune image
    if (!imgUrl) {
      imgUrl = flagUrl;
    }
    cityImageCache.current[cacheKey] = imgUrl;
    setCityImageUrl(imgUrl);
    setIsLoadingImage(false);
  }

  // Charge l'image au montage ou quand la ville change
  useEffect(() => {
    if (city && country) {
      fetchCityImage(city as string, country as string);
    }
  }, [city, country]);
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
      
      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        const visitedCities = userData.visitedCities || [];
        
        // Cherche toutes les notes pour cette ville de cet utilisateur
        visitedCities.forEach((cityData: any) => {
          if (cityData.name === city && 
              cityData.country === country && 
              cityData.rating !== undefined && 
              cityData.rating > 0) {
            allRatings.push(cityData.rating);
            console.log('[CityDetail] Found rating:', cityData.rating, 'from user:', userDoc.id);
          }
        });
      });
      
      console.log('[CityDetail] All ratings found:', allRatings);
      
      if (allRatings.length === 0) {
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
  // On attend que l'image ET la note moyenne soient chargées
  useEffect(() => {
    if (isLoadingImage || isLoadingAverage) {
      setShowLoader(true);
    } else {
      setShowLoader(false);
    }
  }, [isLoadingImage, isLoadingAverage]);

  // Optimise le chargement : lance image et moyenne en parallèle
  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      setShowLoader(true);
      setIsLoadingImage(true);
      setIsLoadingAverage(true);
      const imgPromise = city && country ? fetchCityImage(city as string, country as string) : Promise.resolve();
      const avgPromise = calculateGlobalAverageRating();
      await Promise.all([imgPromise, avgPromise]);
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
          {/* Header avec bouton retour et drapeau */}
          <View style={[styles.header, { backgroundColor: headerColor }]}> 
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={whiteColor} />
            </TouchableOpacity>
            <Image source={{ uri: flagUrl }} style={[styles.headerFlag, { width: 40, height: 28 }]} />
          </View>

          {/* Image de la ville ou drapeau */}
          <View style={{ position: 'relative', width: '100%', marginTop: 0, marginBottom: 20 }}>
            {cityImageUrl && cityImageUrl !== require('../assets/images/placeholder.png') && (
              <>
                <Image
                  source={{ uri: cityImageUrl }}
                  style={{ width: '100%', height: 200, borderRadius: 0, resizeMode: 'cover' }}
                  onLoadEnd={() => setIsLoadingImage(false)}
                />
                {/* Affiche le gradient seulement quand l'image est chargée */}
                {!isLoadingImage && (
                  <LinearGradient
                    colors={
                      cityImageUrl === flagUrl
                        ? ["rgba(0,0,0,0)", "rgba(24,28,36,0.12)"]
                        : ["rgba(0,0,0,0)", "#181C24"]
                    }
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: cityImageUrl === flagUrl ? 22 : 50,
                    }}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                  />
                )}
              </>
            )}
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
              {/* Note moyenne sous le pays, design comme trip-detail */}
              <TouchableOpacity
                style={styles.rateButtonModal}
                onPress={() => setShowRateModal(true)}
              >
                <Text style={styles.rateButtonModalText}>Rate</Text>
              </TouchableOpacity>
              {globalAverageRating !== null && (
                <View style={[styles.averageRatingContainer, { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }]}> 
                  <View style={styles.averageStarsWrapper}>
                    <StarRating 
                      rating={globalAverageRating} 
                      readonly={true} 
                      size="medium"
                      showRating={false}
                      color="#f5c518"
                    />
                  </View>
                  <Text style={styles.averageRatingText}>
                    {globalAverageRating.toFixed(1)}/5
                  </Text>
                </View>
              )}
              {population && (
                <Text style={[styles.population, { color: textColor }]}> 
                  Population: {population}
                </Text>
              )}
            </View>
            {/* ...existing code... */}
      {/* Bottom sheet 3/4 pour le système de rating */}
      {showRateModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowRateModal(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.postModalScroll}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Votre note</Text>
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
                <Text style={[styles.currentRating, { color: textColor }]}> 
                  {userRating > 0 ? `${userRating.toFixed(1)}/5` : 'Pas encore noté'}
                </Text>
              </View>
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
      )}
          </ScrollView>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // Styles modal 3/4 inspirés de add-city.tsx
  modalContent: {
  height: '90%',
  minHeight: '90%',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingHorizontal: 20,
  backgroundColor: '#181C24',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 15,
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
    color: '#fff',
  },
  postModalScroll: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
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
    marginTop: 18,
    backgroundColor: '#2051A4',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignSelf: 'center',
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
    borderBottomColor: 'transparent',
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
});
