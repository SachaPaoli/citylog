import { StarRating } from '@/components/StarRating';
import { TravelPostCard } from '@/components/TravelPostCard';
import { getCountryName } from '@/constants/CountryNames';
import { useThemeColor } from '@/hooks/useThemeColor';
import { RealCitiesService } from '@/services/RealCitiesService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
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

interface SelectedImage {
  id: string;
  uri: string;
}

interface TripItem {
  id: string;
  name: string;
  rating: number;
  description: string;
  images: SelectedImage[];
}

type PostTabType = 'staying' | 'restaurant' | 'activities' | 'other';

export default function AddCityScreen() {
  // Import posts from your source (adjust path if needed)
  const { posts: allPosts = [] } = require('../../hooks/usePosts').usePosts?.() || {};
  // ...existing code...
  // Helper: get posts for a city (replace with your real data source)
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

  // Modal state for viewing posts and rating
  const [showCityModal, setShowCityModal] = useState(false);
  const [modalCity, setModalCity] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'new' | 'visited'>('new');
  
  // Post functionality state
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const modalScrollRef = React.useRef<ScrollView>(null);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const DRAFT_KEY = 'post_draft';
  const [isSaving, setIsSaving] = useState(false);
  
  const textColor = useThemeColor({}, 'text');
  const textActiveColor = useThemeColor({}, 'textActive');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'borderColor');
  
  const [postActiveTab, setPostActiveTab] = useState<PostTabType>('staying');
  const [stayingItems, setStayingItems] = useState<TripItem[]>([]);
  const [restaurantItems, setRestaurantItems] = useState<TripItem[]>([]);
  const [activitiesItems, setActivitiesItems] = useState<TripItem[]>([]);
  const [otherItems, setOtherItems] = useState<TripItem[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  
  // Nouveaux champs pour le post
  const [cityName, setCityName] = useState('');
  const [countryName, setCountryName] = useState('');
  const [tripDescription, setTripDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const publicPrivateAnimation = useState(new Animated.Value(1))[0];
  
  // Modals pour ajouter/modifier des items
  const [showItemModal, setShowItemModal] = useState(false);
  const [currentItemType, setCurrentItemType] = useState<PostTabType>('staying');
  const [editingItem, setEditingItem] = useState<TripItem | null>(null);
  
  // État temporaire pour le formulaire de l'item
  const [tempItem, setTempItem] = useState<TripItem>({
    id: '',
    name: '',
    rating: 0,
    description: '',
    images: []
  });

  // Fonction pour normaliser les chaînes
  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  };

  // Recherche de villes instantanée
  const searchCities = async (query: string) => {
    if (query.length <= 1) {
      setCitySuggestions([]);
      return;
    }

    try {
      const results = await RealCitiesService.searchCities(query, 10);
      
      const uniqueCities = [];
      const seen = new Set();
      for (const city of results) {
        const key = `${normalizeString(city.name)}-${normalizeString(city.country)}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueCities.push(city);
        }
      }
      
      const normalizedQuery = normalizeString(query);
      const sortedCities = uniqueCities.sort((a, b) => {
        const aExact = normalizeString(a.name) === normalizedQuery;
        const bExact = normalizeString(b.name) === normalizedQuery;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        const popA = typeof a.population === 'number' ? a.population : 0;
        const popB = typeof b.population === 'number' ? b.population : 0;
        return popB - popA;
      });
      
      setCitySuggestions(sortedCities);
    } catch {
      setCitySuggestions([]);
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setStayingItems([]);
    setRestaurantItems([]);
    setActivitiesItems([]);
    setOtherItems([]);
    setCoverImage(null);
    setCityName('');
    setCountryName('');
    setTripDescription('');
    setIsPublic(true);
    publicPrivateAnimation.setValue(1);
    setPostActiveTab('staying');
    AsyncStorage.removeItem(DRAFT_KEY);
  };

  // useEffects
  useEffect(() => {
    searchCities(cityName);
  }, [cityName]);

  useEffect(() => {
    Animated.timing(publicPrivateAnimation, {
      toValue: isPublic ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isPublic, publicPrivateAnimation]);

  // Toggle public/private
  const togglePublicPrivate = () => {
    setIsPublic(!isPublic);
  };

  // Item management functions
  const openAddItemModal = (tabType: PostTabType) => {
    setCurrentItemType(tabType);
    setTempItem({ id: Date.now().toString(), name: '', rating: 0, description: '', images: [] });
    setEditingItem(null);
    setShowItemModal(true);
  };

  const openEditItemModal = (item: TripItem, tabType: PostTabType) => {
    setCurrentItemType(tabType);
    setEditingItem(item);
    setTempItem({ ...item });
    setShowItemModal(true);
  };

  const saveItem = () => {
    if (!tempItem.name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour cet élément.');
      return;
    }

    const itemToSave = { ...tempItem };

    if (editingItem) {
      updateItemInList(currentItemType, itemToSave);
    } else {
      addItemToList(currentItemType, itemToSave);
    }

    setShowItemModal(false);
    setTempItem({ id: '', name: '', rating: 0, description: '', images: [] });
    setEditingItem(null);
  };

  const addItemToList = (tabType: PostTabType, item: TripItem) => {
    if (tabType === 'staying') {
      setStayingItems([...stayingItems, item]);
    } else if (tabType === 'restaurant') {
      setRestaurantItems([...restaurantItems, item]);
    } else if (tabType === 'activities') {
      setActivitiesItems([...activitiesItems, item]);
    } else {
      setOtherItems([...otherItems, item]);
    }
  };

  const updateItemInList = (tabType: PostTabType, updatedItem: TripItem) => {
    const updateItems = (items: TripItem[]) =>
      items.map(item => item.id === updatedItem.id ? updatedItem : item);

    if (tabType === 'staying') {
      setStayingItems(updateItems(stayingItems));
    } else if (tabType === 'restaurant') {
      setRestaurantItems(updateItems(restaurantItems));
    } else if (tabType === 'activities') {
      setActivitiesItems(updateItems(activitiesItems));
    } else {
      setOtherItems(updateItems(otherItems));
    }
  };

  const removeItem = (tabType: PostTabType, itemId: string) => {
    if (tabType === 'staying') {
      setStayingItems(stayingItems.filter(item => item.id !== itemId));
    } else if (tabType === 'restaurant') {
      setRestaurantItems(restaurantItems.filter(item => item.id !== itemId));
    } else if (tabType === 'activities') {
      setActivitiesItems(activitiesItems.filter(item => item.id !== itemId));
    } else {
      setOtherItems(otherItems.filter(item => item.id !== itemId));
    }
  };

  // Image functions
  const pickImageForTempItem = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const newImage: SelectedImage = {
        id: Date.now().toString(),
        uri: result.assets[0].uri
      };

      setTempItem(prev => ({
        ...prev,
        images: [...prev.images, newImage]
      }));
    }
  };

  const removeImageFromTempItem = (imageId: string) => {
    setTempItem(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const pickCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setCoverImage(result.assets[0].uri);
    }
  };

  // Calculer la note moyenne
  const calculateAverageRating = () => {
    const allItems = [...stayingItems, ...restaurantItems, ...activitiesItems, ...otherItems];
    if (allItems.length === 0) return 0;
    
    const totalRating = allItems.reduce((sum, item) => sum + item.rating, 0);
    return Math.round((totalRating / allItems.length) * 10) / 10;
  };

  // Ajouter au trip local
  const handlePost = async () => {
    if (!coverImage || !cityName.trim() || !countryName.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir au moins la ville, le pays et ajouter une photo de couverture.');
      return;
    }

    const averageRating = calculateAverageRating();
    const fullCountryName = getCountryName(countryName.trim());

    setShowPostModal(false);

    // Créer un objet trip local à sauvegarder
    const tripData = {
      id: `trip-${Date.now()}`,
      city: cityName.trim(),
      country: fullCountryName,
      coverImage: coverImage,
      rating: averageRating,
      description: tripDescription.trim() || `Voyage à ${cityName}, ${fullCountryName}`,
      stayingItems,
      restaurantItems,
      activitiesItems,
      otherItems,
      isPublic,
      createdAt: Date.now()
    };

    try {
      // Sauvegarder dans AsyncStorage pour affichage dans create.tsx
      const existingTrips = await AsyncStorage.getItem('local_trips');
      const trips = existingTrips ? JSON.parse(existingTrips) : [];
      trips.push(tripData);
      await AsyncStorage.setItem('local_trips', JSON.stringify(trips));

      console.log('✅ Trip ajouté localement:', tripData);
      
      // Supprimer le brouillon
      await AsyncStorage.removeItem(DRAFT_KEY);
      
      // Retourner à la page create
      router.push('/trips/create');
    } catch (error) {
      console.error('❌ Erreur sauvegarde locale:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le trip.');
    }

    resetForm();
  };

  // Contenu de chaque onglet post
  const renderPostTabContent = () => {
    const currentItems = postActiveTab === 'staying' ? stayingItems : 
                        postActiveTab === 'restaurant' ? restaurantItems : 
                        postActiveTab === 'activities' ? activitiesItems : otherItems;

    return (
      <View style={styles.tabContent}>
        {currentItems.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.itemCard, { borderColor: borderColor }]}
            onPress={() => openEditItemModal(item, postActiveTab)}
          >
            <TouchableOpacity 
              style={[styles.deleteItemButton, { backgroundColor: '#5784BA' }]}
              onPress={(e) => {
                e.stopPropagation();
                removeItem(postActiveTab, item.id);
              }}
            >
              <Text style={styles.deleteItemText}>×</Text>
            </TouchableOpacity>

            <View style={styles.cardImageContainer}>
              {item.images.length > 0 ? (
                <Image source={{ uri: item.images[0].uri }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardImagePlaceholder, { borderColor: borderColor }]}>
                  <Text style={[styles.cardImagePlaceholderText, { color: textColor }]}>📷</Text>
                </View>
              )}
            </View>

            <View style={styles.cardInfo}>
              <Text style={[styles.cardName, { color: textColor }]} numberOfLines={1}>
                {item.name || `${postActiveTab === 'staying' ? 'Logement' : 
                               postActiveTab === 'restaurant' ? 'Restaurant' : 
                               postActiveTab === 'activities' ? 'Activité' : 'Autre'} sans nom`}
              </Text>
              <View style={[styles.cardRating, { alignItems: 'flex-start' }]}>
                <StarRating rating={item.rating} readonly size="small" showRating={false} color="#f5c518" />
              </View>
              {item.images.length > 1 && (
                <Text style={[styles.cardImageCount, { color: textColor }]}>
                  +{item.images.length - 1} photo{item.images.length > 2 ? 's' : ''}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#2051A4' }]}
          onPress={() => openAddItemModal(postActiveTab)}
        >
          <Text style={[styles.addButtonText, { color: '#fff' }]}> 
            + Ajouter {postActiveTab === 'staying' ? 'un logement' : 
                      postActiveTab === 'restaurant' ? 'un restaurant' : 
                      postActiveTab === 'activities' ? 'une activité' : 'autre chose'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </View>
    );
  };

  const renderNewCityTab = () => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.newCityTab}>
        <View>
          <View style={[styles.postHeader, { backgroundColor: 'transparent' }]}> 
            <View style={styles.postHeaderTop}>
              {isSaving && (
                <View style={styles.savingIndicator}>
                  <Text style={styles.savingText}>💾 Sauvegarde...</Text>
                </View>
              )}
            </View>
            <View style={styles.postTabsContainer}>
              {(['staying', 'restaurant', 'activities', 'other'] as PostTabType[]).map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.postTab, postActiveTab === tab && { borderBottomColor: borderColor }]}
                  onPress={() => setPostActiveTab(tab)}
                >
                  <Text style={[styles.postTabText, { color: postActiveTab === tab ? textActiveColor : textColor }]}> 
                    {tab === 'staying' ? 'Staying' : 
                     tab === 'restaurant' ? 'Restaurant' : 
                     tab === 'activities' ? 'Activities' : 'Other'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.2)', width: '100%' }} />
        </View>

        <ScrollView style={[styles.postContent, { backgroundColor }]} showsVerticalScrollIndicator={false}>
          {renderPostTabContent()}
        </ScrollView>

        <TouchableOpacity 
          style={[styles.floatingButton, { backgroundColor: '#2051A4' }]}
          onPress={() => setShowPostModal(true)}
        >
          <Text style={styles.floatingButtonText}>Add to trip</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );

  // Visited cities tab logic (copied from my-cities.tsx)
  const { cities: visitedCities } = require('../../contexts/VisitedCitiesContext').useVisitedCities();
  // Mapping from country name to ISO code for flag display
  const countryCodeToName = countryNamesEn;
  const countryNameToCode = Object.fromEntries(Object.entries(countryNamesEn).map(([code, name]) => [name, code]));

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
  };
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

  const renderVisitedCityTab = () => (
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
            const handlePress = () => {
              if (isSimpleRating) {
                require('expo-router').router.push({
                  pathname: '/trips/create',
                  params: {
                    cityName: city.name,
                    countryName: countryCodeToName[city.countryCode] || city.countryCode,
                    rating: city.averageRating,
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
                  activeOpacity={isSimpleRating || hasPosts ? 0.7 : 1}
                  onPress={handlePress}
                  disabled={!(isSimpleRating || hasPosts)}
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
                {/* Debug logs for modalCity and posts */}
                {(() => {
                  console.log('MODAL DEBUG: modalCity:', modalCity);
                  console.log('MODAL DEBUG: allPosts:', allPosts);
                  const postsForCity = getPostsForCity(modalCity);
                  console.log('MODAL DEBUG: getPostsForCity(modalCity):', postsForCity);
                  return null;
                })()}
                {/* Show manual rating card in modal only if manualCount > 0 and there is at least one post for the city */}
                {modalCity.manualCount > 0 && modalCity.postCount > 0 && Array.isArray(modalCity.ratings) && modalCity.ratings.length > 0 && (
                  <TouchableOpacity
                    style={styles.cityCard}
                    activeOpacity={0.7}
                    onPress={() => {
                      setShowCityModal(false);
                      require('expo-router').router.push({
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
                    <TravelPostCard post={post as any} />
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );

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
          
          <View style={styles.headerRight}>
            {/* Espace pour équilibrer le header */}
          </View>
          
          <View style={styles.headerRight}>
            {/* Espace pour équilibrer le header */}
          </View>
        </View>

        {/* Onglets */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'new' && styles.activeTab]}
            onPress={() => setActiveTab('new')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'new' ? '#fff' : '#888' }]}>
              New city
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'visited' && styles.activeTab]}
            onPress={() => setActiveTab('visited')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'visited' ? '#fff' : '#888' }]}>
              Visited city
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenu */}
        <View style={styles.content}>
          {activeTab === 'new' ? renderNewCityTab() : renderVisitedCityTab()}
        </View>

        {/* Modals */}
        {/* Modal de post */}
        <Modal
          visible={showPostModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowPostModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => {
            Keyboard.dismiss();
            setShowPostModal(false);
          }}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => {
                e.stopPropagation();
                Keyboard.dismiss();
              }}>
                <View style={[styles.modalContent, { backgroundColor }]}>
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowPostModal(false)}
                >
                  <Text style={[styles.closeButtonText, { color: textColor }]}>×</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                ref={modalScrollRef}
                style={styles.postModalScroll} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={[styles.postTitle, { color: textColor }]}>
                  Add your city to the trip!
                </Text>
                
                {/* Photo de couverture */}
                <View style={styles.coverImageSection}>
                  <Text style={[styles.coverImageLabel, { color: textColor }]}>
                    Cover picture:
                  </Text>
                  {coverImage ? (
                    <View style={styles.coverImageContainer}>
                      <Image source={{ uri: coverImage }} style={styles.coverImage} />
                      <TouchableOpacity 
                        style={styles.removeCoverImageButton}
                        onPress={() => setCoverImage(null)}
                      >
                        <Text style={styles.removeCoverImageText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.addCoverImageButton, { borderColor: borderColor }]}
                      onPress={pickCoverImage}
                    >
                      <Text style={[styles.addCoverImageText, { color: textActiveColor }]}>+ Add a picture</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {/* Ville et Pays */}
                <View style={styles.locationSection}>
                  <Text style={[styles.locationLabel, { color: textColor }]}> 
                    Choose a city :
                  </Text>
                  <View style={{ height: 8 }} />
                  <View style={styles.locationInputs}>
                    <View style={{ flex: 1 }}>
                      <View style={{ position: 'relative', justifyContent: 'center' }}>
                        <TextInput
                          style={[styles.locationInput, { color: textColor, borderColor: borderColor, paddingRight: 44 }]}
                          placeholder="City"
                          placeholderTextColor="#666"
                          value={cityName}
                          onChangeText={setCityName}
                        />
                        {cityName.length > 0 && (
                          <TouchableOpacity
                            style={{ position: 'absolute', right: 12, top: '50%', transform: [{ translateY: -12 }], width: 24, height: 24, alignItems: 'center', justifyContent: 'center', zIndex: 20 }}
                            onPress={() => {
                              setCityName('');
                              setCitySuggestions([]);
                            }}
                          >
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>×</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                  {citySuggestions && citySuggestions.length > 0 && cityName.length > 1 && (
                    <View style={styles.suggestionsContainer}>
                      <ScrollView style={{ maxHeight: 180 }}>
                        {citySuggestions.map((city, idx) => {
                          let countryDisplay = city.countryFull || city.country;
                          if (city.countryCode && countryNamesEn[city.countryCode.toUpperCase()]) {
                            countryDisplay = countryNamesEn[city.countryCode.toUpperCase()];
                          }
                          return (
                            <TouchableOpacity
                              key={`${city.name}-${countryDisplay}-${idx}`}
                              style={styles.suggestionItem}
                              onPress={() => {
                                setCityName(city.name);
                                setCountryName(countryDisplay);
                                setCitySuggestions([]);
                                Keyboard.dismiss();
                              }}
                            >
                              <Image
                                source={{ uri: `https://flagcdn.com/w40/${city.countryCode?.toLowerCase() || city.country?.toLowerCase() || ''}.png` }}
                                style={styles.suggestionFlag}
                                resizeMode="cover"
                              />
                              <View style={{ flexDirection: 'column' }}>
                                <Text style={{ color: textActiveColor, fontWeight: 'bold', fontSize: 15 }}>{city.name}</Text>
                                <Text style={{ color: textColor, fontSize: 14 }}>{countryDisplay}</Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Description optionnelle */}
                <View style={styles.descriptionSection}>
                  <Text style={[styles.descriptionLabel, { color: textColor }]}>
                    Description (optional):
                  </Text>
                  <TouchableOpacity
                    style={[styles.descriptionTextArea, { borderColor: borderColor, justifyContent: 'center' }]}
                    onPress={() => setIsDescriptionFocused(true)}
                  >
                    <Text style={[{ color: tripDescription ? textColor : '#666', fontSize: 16 }]}>
                      {tripDescription || "Describe your journey..."}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.averageRatingContainer}>
                  <Text style={[styles.averageRatingLabel, { color: textColor }]}>
                    Final rate:
                  </Text>
                  <View style={styles.averageRatingContainer}>
                    <StarRating 
                      rating={calculateAverageRating()} 
                      readonly 
                      size="large" 
                      color="#f5c518"
                      showRating={true}
                    />
                  </View>
                  
                  <View style={styles.privacySection}>
                    <Text style={[styles.privacyLabel, { color: textColor }]}>
                      Visibility:
                    </Text>
                    <TouchableOpacity 
                      style={styles.privacyButton}
                      onPress={togglePublicPrivate}
                    >
                      <View style={styles.privacyButtonContainer}>
                        <Animated.View style={[
                          styles.privacyCurtainEffect,
                          {
                            width: publicPrivateAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['100%', '0%'],
                            }),
                          }
                        ]} />
                        <View style={styles.privacyButtonContent}>
                          <Text style={[
                            styles.privacyButtonText, 
                            !isPublic && styles.privacyButtonTextActive
                          ]}>
                            {isPublic ? 'Public' : 'Private'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
              
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity style={[styles.modalPostButton, { backgroundColor: '#2051A4' }]} onPress={handlePost}>
                  <Text style={styles.modalPostButtonText}>Ajouter au voyage</Text>
                </TouchableOpacity>
              </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
          
          {isDescriptionFocused && (
            <BlurView intensity={50} style={styles.floatingDescriptionFullScreen}>
              <TouchableWithoutFeedback onPress={() => {
                Keyboard.dismiss();
                setIsDescriptionFocused(false);
              }}>
                <View style={{ flex: 1 }} />
              </TouchableWithoutFeedback>
              <View style={styles.floatingDescriptionContainer}>
                <Text style={[styles.floatingDescriptionLabel, { color: textColor }]}>
                  Description (optional):
                </Text>
                <TextInput
                  style={[styles.floatingDescriptionInput, { color: textColor, borderColor: borderColor }]}
                  placeholder="Describe your journey..."
                  placeholderTextColor="#666"
                  value={tripDescription}
                  onChangeText={setTripDescription}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  scrollEnabled={true}
                  autoFocus={true}
                />
                <TouchableOpacity 
                  style={styles.floatingDescriptionDone}
                  onPress={() => {
                    Keyboard.dismiss();
                    setIsDescriptionFocused(false);
                  }}
                >
                  <Text style={styles.floatingDescriptionDoneText}>Terminé</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          )}
        </Modal>

        {/* Modal d'ajout/modification d'item */}
        <Modal
          visible={showItemModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowItemModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => {
            Keyboard.dismiss();
            setShowItemModal(false);
          }}>
            <View style={styles.itemModalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => {
                e.stopPropagation();
                Keyboard.dismiss();
              }}>
                <View style={[styles.itemModalContent, { backgroundColor }]}>
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowItemModal(false)}
                >
                  <Text style={[styles.closeButtonText, { color: textColor }]}>×</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.itemModalScroll} showsVerticalScrollIndicator={false}>
                <Text style={[styles.itemModalTitle, { color: textColor }]}>
                  {editingItem ? 'Modifier' : 'Ajouter'} {
                    currentItemType === 'staying' ? 'un logement' :
                    currentItemType === 'restaurant' ? 'un restaurant' :
                    currentItemType === 'activities' ? 'une activité' : 'autre chose'
                  }
                </Text>

                {/* Photos */}
                <View style={styles.itemPhotosSection}>
                  <Text style={[styles.itemSectionLabel, { color: textColor }]}>Photos:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
                    {tempItem.images.map(image => (
                      <View key={image.id} style={styles.imageContainer}>
                        <Image source={{ uri: image.uri }} style={styles.itemImage} />
                        <TouchableOpacity 
                          style={styles.removeImageButton}
                          onPress={() => removeImageFromTempItem(image.id)}
                        >
                          <Text style={styles.removeImageText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity 
                      style={[styles.addImageButton, { borderColor: borderColor }]}
                      onPress={pickImageForTempItem}
                    >
                      <Text style={[styles.addImageText, { color: '#2051A4' }]}>+</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>

                {/* Nom */}
                <View style={styles.itemFieldSection}>
                  <Text style={[styles.itemSectionLabel, { color: textColor }]}>Nom:</Text>
                  <TextInput
                    style={[styles.itemInput, { color: textColor, borderColor: borderColor }]}
                    placeholder={`Nom ${currentItemType === 'staying' ? 'du logement' : 
                                   currentItemType === 'restaurant' ? 'du restaurant' : 
                                   currentItemType === 'activities' ? 'de l\'activité' : 'de l\'autre'}`}
                    placeholderTextColor="#999"
                    value={tempItem.name}
                    onChangeText={(text) => setTempItem(prev => ({ ...prev, name: text }))}
                  />
                </View>

                {/* Note */}
                <View style={styles.itemFieldSection}>
                  <Text style={[styles.itemSectionLabel, { color: textColor }]}>Note sur 5:</Text>
                  <View style={styles.ratingContainer}>
                    <StarRating 
                      rating={tempItem.rating} 
                      onRatingChange={(rating) => setTempItem(prev => ({ ...prev, rating }))}
                      size="large"
                      color="#f5c518"
                      showRating={true}
                    />
                  </View>
                </View>

                {/* Description */}
                <View style={styles.itemFieldSection}>
                  <Text style={[styles.itemSectionLabel, { color: textColor }]}>Description (optionnelle):</Text>
                  <TextInput
                    style={[styles.itemTextArea, { color: textColor, borderColor: borderColor }]}
                    placeholder="Description..."
                    placeholderTextColor="#999"
                    value={tempItem.description}
                    onChangeText={(text) => setTempItem(prev => ({ ...prev, description: text }))}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </ScrollView>
              
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity 
                  style={[styles.itemSaveButton, { backgroundColor: '#2051A4' }]} 
                  onPress={saveItem}
                >
                  <Text style={styles.itemSaveButtonText}>
                    {editingItem ? 'Modifier' : 'Ajouter'}
                  </Text>
                </TouchableOpacity>
              </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
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
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#181C24',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#fff',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  newCityTab: {
    flex: 1,
    backgroundColor: '#181C24',
  },
  visitedCityTab: {
    flex: 1,
    backgroundColor: '#181C24',
    padding: 16,
  },
  // Post styles
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
  postHeader: {
    paddingHorizontal: 0,
    paddingVertical: 6,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  postHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  savingIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  savingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  postTabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingBottom: 20,
  },
  postTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginHorizontal: -6,
  },
  postTabText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  postContent: {
    flex: 1,
    padding: 16,
    paddingTop: 31,
  },
  tabContent: {
    flex: 1,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  deleteItemButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  deleteItemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardImageContainer: {
    width: 60,
    height: 45,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cardImagePlaceholderText: {
    fontSize: 20,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardRating: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  cardImageCount: {
    fontSize: 12,
    opacity: 0.7,
  },
  addButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#2051A4',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 120,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    left: '50%',
    transform: [{ translateX: -75 }],
    backgroundColor: '#E5C9A6',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
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
  postTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    paddingTop: 10,
    backgroundColor: 'transparent',
  },
  modalPostButton: {
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: '#2051A4',
  },
  modalPostButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  coverImageSection: {
    marginBottom: 12,
    alignItems: 'center',
  },
  coverImageLabel: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  coverImageContainer: {
    position: 'relative',
  },
  coverImage: {
    width: 160,
    height: 90,
    borderRadius: 12,
  },
  removeCoverImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeCoverImageText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addCoverImageButton: {
    width: 160,
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  addCoverImageText: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationSection: {
    marginBottom: 12,
  },
  locationLabel: {
    fontSize: 16,
    marginBottom: 6,
    textAlign: 'center',
  },
  locationInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  locationInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 20,
    fontSize: 16,
    minHeight: 56,
    minWidth: 0,
    height: 64,
  },
  suggestionsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    marginTop: 8,
    backgroundColor: '#181C24',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 100,
    maxHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionFlag: {
    width: 22,
    height: 16,
    borderRadius: 3,
    marginRight: 8,
  },
  descriptionSection: {
    marginBottom: 12,
  },
  descriptionLabel: {
    fontSize: 16,
    marginBottom: 6,
    textAlign: 'center',
  },
  descriptionTextArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    height: 60,
    textAlignVertical: 'center',
    maxHeight: 60,
  },
  averageRatingContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  averageRatingLabel: {
    fontSize: 18,
    marginBottom: 5,
  },
  privacySection: {
    alignItems: 'center',
    marginTop: -5,
    marginBottom: 0,
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  privacyButton: {
    width: 140,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#5784BA',
    overflow: 'hidden',
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  privacyButtonContainer: {
    flex: 1,
    position: 'relative',
  },
  privacyCurtainEffect: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#333333',
    zIndex: 1,
  },
  privacyButtonContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  privacyButtonText: {
    color: '#333333',
    fontSize: 17,
    fontWeight: 'bold',
  },
  privacyButtonTextActive: {
    color: '#FFFFFF',
  },
  floatingDescriptionFullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 2000,
    justifyContent: 'flex-start',
  },
  floatingDescriptionContainer: {
    position: 'absolute',
    top: 120,
    left: 10,
    right: 10,
    backgroundColor: '#181C24',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  floatingDescriptionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  floatingDescriptionInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  floatingDescriptionDone: {
    backgroundColor: '#2051A4',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  floatingDescriptionDoneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Item modal styles
  itemModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  itemModalContent: {
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
  },
  itemModalScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  itemModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  itemPhotosSection: {
    marginBottom: 20,
  },
  itemFieldSection: {
    marginBottom: 20,
  },
  itemSectionLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  imagesContainer: {
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 8,
  },
  itemImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 80,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  itemInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  itemTextArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top',
  },
  ratingContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  itemSaveButton: {
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: '#2051A4',
  },
  itemSaveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
