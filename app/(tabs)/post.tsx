import { StarRating } from '@/components/StarRating';
import { getCountryName } from '@/constants/CountryNames';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { useThemeColor } from '@/hooks/useThemeColor';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
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
import { useVisitedCities } from '../../contexts/VisitedCitiesContext';
import { RealCitiesService } from '@/services/RealCitiesService';
// Table exhaustive ISO 3166-1 alpha-2 code -> nom anglais (same as explore/search)
const countryNamesEn: Record<string, string> = {
  AF: 'Afghanistan',
  AL: 'Albania',
  DZ: 'Algeria',
  AS: 'American Samoa',
  AD: 'Andorra',
  AO: 'Angola',
  AI: 'Anguilla',
  AQ: 'Antarctica',
  AG: 'Antigua and Barbuda',
  AR: 'Argentina',
  AM: 'Armenia',
  AW: 'Aruba',
  AU: 'Australia',
  AT: 'Austria',
  AZ: 'Azerbaijan',
  BS: 'Bahamas',
  BH: 'Bahrain',
  BD: 'Bangladesh',
  BB: 'Barbados',
  BY: 'Belarus',
  BE: 'Belgium',
  BZ: 'Belize',
  BJ: 'Benin',
  BM: 'Bermuda',
  BT: 'Bhutan',
  BO: 'Bolivia',
  BA: 'Bosnia and Herzegovina',
  BW: 'Botswana',
  BV: 'Bouvet Island',
  BR: 'Brazil',
  IO: 'British Indian Ocean Territory',
  BN: 'Brunei Darussalam',
  BG: 'Bulgaria',
  BF: 'Burkina Faso',
  BI: 'Burundi',
  KH: 'Cambodia',
  CM: 'Cameroon',
  CA: 'Canada',
  CV: 'Cape Verde',
  KY: 'Cayman Islands',
  CF: 'Central African Republic',
  TD: 'Chad',
  CL: 'Chile',
  CN: 'China',
  CX: 'Christmas Island',
  CC: 'Cocos (Keeling) Islands',
  CO: 'Colombia',
  KM: 'Comoros',
  CG: 'Congo',
  CD: 'Congo, the Democratic Republic of the',
  CK: 'Cook Islands',
  CR: 'Costa Rica',
  CI: "Cote d'Ivoire",
  HR: 'Croatia',
  CU: 'Cuba',
  CY: 'Cyprus',
  CZ: 'Czech Republic',
  DK: 'Denmark',
  DJ: 'Djibouti',
  DM: 'Dominica',
  DO: 'Dominican Republic',
  EC: 'Ecuador',
  EG: 'Egypt',
  SV: 'El Salvador',
  GQ: 'Equatorial Guinea',
  ER: 'Eritrea',
  EE: 'Estonia',
  ET: 'Ethiopia',
  FK: 'Falkland Islands (Malvinas)',
  FO: 'Faroe Islands',
  FJ: 'Fiji',
  FI: 'Finland',
  FR: 'France',
  GF: 'French Guiana',
  PF: 'French Polynesia',
  TF: 'French Southern Territories',
  GA: 'Gabon',
  GM: 'Gambia',
  GE: 'Georgia',
  DE: 'Germany',
  GH: 'Ghana',
  GI: 'Gibraltar',
  GR: 'Greece',
  GL: 'Greenland',
  GD: 'Grenada',
  GP: 'Guadeloupe',
  GU: 'Guam',
  GT: 'Guatemala',
  GG: 'Guernsey',
  GN: 'Guinea',
  GW: 'Guinea-Bissau',
  GY: 'Guyana',
  HT: 'Haiti',
  HM: 'Heard Island and McDonald Islands',
  VA: 'Holy See (Vatican City State)',
  HN: 'Honduras',
  HK: 'Hong Kong',
  HU: 'Hungary',
  IS: 'Iceland',
  IN: 'India',
  ID: 'Indonesia',
  IR: 'Iran, Islamic Republic of',
  IQ: 'Iraq',
  IE: 'Ireland',
  IM: 'Isle of Man',
  IL: 'Israel',
  IT: 'Italy',
  JM: 'Jamaica',
  JP: 'Japan',
  JE: 'Jersey',
  JO: 'Jordan',
  KZ: 'Kazakhstan',
  KE: 'Kenya',
  KI: 'Kiribati',
  KP: 'Korea, Democratic People’s Republic of',
  KR: 'Korea, Republic of',
  KW: 'Kuwait',
  KG: 'Kyrgyzstan',
  LA: 'Lao People’s Democratic Republic',
  LV: 'Latvia',
  LB: 'Lebanon',
  LS: 'Lesotho',
  LR: 'Liberia',
  LY: 'Libyan Arab Jamahiriya',
  LI: 'Liechtenstein',
  LT: 'Lithuania',
  LU: 'Luxembourg',
  MO: 'Macao',
  MK: 'Macedonia, the Former Yugoslav Republic of',
  MG: 'Madagascar',
  MW: 'Malawi',
  MY: 'Malaysia',
  MV: 'Maldives',
  ML: 'Mali',
  MT: 'Malta',
  MH: 'Marshall Islands',
  MQ: 'Martinique',
  MR: 'Mauritania',
  MU: 'Mauritius',
  YT: 'Mayotte',
  MX: 'Mexico',
  FM: 'Micronesia, Federated States of',
  MD: 'Moldova, Republic of',
  MC: 'Monaco',
  MN: 'Mongolia',
  ME: 'Montenegro',
  MS: 'Montserrat',
  MA: 'Morocco',
  MZ: 'Mozambique',
  MM: 'Myanmar',
  NA: 'Namibia',
  NR: 'Nauru',
  NP: 'Nepal',
  NL: 'Netherlands',
  AN: 'Netherlands Antilles',
  NC: 'New Caledonia',
  NZ: 'New Zealand',
  NI: 'Nicaragua',
  NE: 'Niger',
  NG: 'Nigeria',
  NU: 'Niue',
  NF: 'Norfolk Island',
  MP: 'Northern Mariana Islands',
  NO: 'Norway',
  OM: 'Oman',
  PK: 'Pakistan',
  PW: 'Palau',
  PS: 'Palestinian Territory, Occupied',
  PA: 'Panama',
  PG: 'Papua New Guinea',
  PY: 'Paraguay',
  PE: 'Peru',
  PH: 'Philippines',
  PN: 'Pitcairn',
  PL: 'Poland',
  PT: 'Portugal',
  PR: 'Puerto Rico',
  QA: 'Qatar',
  RE: 'Reunion',
  RO: 'Romania',
  RU: 'Russian Federation',
  RW: 'Rwanda',
  BL: 'Saint Barthelemy',
  SH: 'Saint Helena',
  KN: 'Saint Kitts and Nevis',
  LC: 'Saint Lucia',
  MF: 'Saint Martin',
  PM: 'Saint Pierre and Miquelon',
  VC: 'Saint Vincent and the Grenadines',
  WS: 'Samoa',
  SM: 'San Marino',
  ST: 'Sao Tome and Principe',
  SA: 'Saudi Arabia',
  SN: 'Senegal',
  RS: 'Serbia',
  SC: 'Seychelles',
  SL: 'Sierra Leone',
  SG: 'Singapore',
  SK: 'Slovakia',
  SI: 'Slovenia',
  SB: 'Solomon Islands',
  SO: 'Somalia',
  ZA: 'South Africa',
  GS: 'South Georgia and the South Sandwich Islands',
  ES: 'Spain',
  LK: 'Sri Lanka',
  SD: 'Sudan',
  SR: 'Suriname',
  SJ: 'Svalbard and Jan Mayen',
  SZ: 'Swaziland',
  SE: 'Sweden',
  CH: 'Switzerland',
  SY: 'Syrian Arab Republic',
  TW: 'Taiwan, Province of China',
  TJ: 'Tajikistan',
  TZ: 'Tanzania, United Republic of',
  TH: 'Thailand',
  TL: 'Timor-Leste',
  TG: 'Togo',
  TK: 'Tokelau',
  TO: 'Tonga',
  TT: 'Trinidad and Tobago',
  TN: 'Tunisia',
  TR: 'Turkey',
  TM: 'Turkmenistan',
  TC: 'Turks and Caicos Islands',
  TV: 'Tuvalu',
  UG: 'Uganda',
  UA: 'Ukraine',
  AE: 'United Arab Emirates',
  GB: 'United Kingdom',
  US: 'United States',
  UM: 'United States Minor Outlying Islands',
  UY: 'Uruguay',
  UZ: 'Uzbekistan',
  VU: 'Vanuatu',
  VE: 'Venezuela',
  VN: 'Viet Nam',
  VG: 'Virgin Islands, British',
  VI: 'Virgin Islands, U.S.',
  WF: 'Wallis and Futuna',
  EH: 'Western Sahara',
  YE: 'Yemen',
  ZM: 'Zambia',
  ZW: 'Zimbabwe',
};

interface SelectedImage {
  id: string;
  uri: string;
}

interface TripItem {
  id: string;
  name: string;
  rating: number; // Note sur 5 (avec demi-étoiles: 0, 0.5, 1, 1.5, ..., 5)
  description: string;
  images: SelectedImage[];
}

type TabType = 'staying' | 'restaurant' | 'activities' | 'other';

export default function PostScreen() {
  const { addOrUpdateCity } = useVisitedCities();
  // State for city autocomplete suggestions
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  
  // Référence pour le ScrollView du modal
  const modalScrollRef = React.useRef<ScrollView>(null);
  
  // État pour l'input de description flottant
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  
  // Key pour AsyncStorage
  const DRAFT_KEY = 'post_draft';
  
  // State pour indiquer si on sauvegarde
  const [isSaving, setIsSaving] = useState(false);
  
  const textColor = useThemeColor({}, 'text');
  const textActiveColor = useThemeColor({}, 'textActive');
  const backgroundColor = useThemeColor({}, 'background');
  const buttonBackgroundColor = useThemeColor({}, 'buttonBackground');
  const borderColor = useThemeColor({}, 'borderColor');
  const headerBackgroundColor = '#808080';
  const scrollBackgroundColor = '#D3D3D3';
  
  // Hooks pour Firebase
  const { createPost, refreshPosts } = usePosts();
  const { userProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('staying');
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
  const [isPublic, setIsPublic] = useState(true); // true = public, false = private
  const publicPrivateAnimation = useState(new Animated.Value(1))[0]; // Commence en mode public
  
  // Modals pour ajouter/modifier des items
  const [showItemModal, setShowItemModal] = useState(false);
  const [currentItemType, setCurrentItemType] = useState<TabType>('staying');
  const [editingItem, setEditingItem] = useState<TripItem | null>(null);
  
  // État temporaire pour le formulaire de l'item
  const [tempItem, setTempItem] = useState<TripItem>({
    id: '',
    name: '',
    rating: 0, // Toutes les étoiles vides par défaut
    description: '',
    images: []
  });

  // Fonction pour normaliser les chaînes (insensible à la casse et aux accents)
  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-z0-9\s]/g, '') // Garde seulement lettres, chiffres et espaces
      .trim();
  };

  // Recherche de villes instantanée (comme dans explore.tsx)
  const searchCities = async (query: string) => {
    if (query.length <= 1) {
      setCitySuggestions([]);
      return;
    }

    try {
      const results = await RealCitiesService.searchCities(query, 10);
      
      // Filtrer les doublons (même nom, même pays)
      const uniqueCities = [];
      const seen = new Set();
      for (const city of results) {
        const key = `${normalizeString(city.name)}-${normalizeString(city.country)}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueCities.push(city);
        }
      }
      
      // Tri : d'abord les villes dont le nom correspond exactement à la recherche, puis les autres, le tout trié par population
      const normalizedQuery = normalizeString(query);
      const sortedCities = uniqueCities.sort((a, b) => {
        const aExact = normalizeString(a.name) === normalizedQuery;
        const bExact = normalizeString(b.name) === normalizedQuery;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        // Si les deux sont exacts ou les deux ne le sont pas, trie par population décroissante
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
    setActiveTab('staying');
    // Supprimer le brouillon sauvegardé
    AsyncStorage.removeItem(DRAFT_KEY);
  };

  // Sauvegarder automatiquement le brouillon
  const saveDraft = async () => {
    try {
      setIsSaving(true);
      const draft = {
        stayingItems,
        restaurantItems,
        activitiesItems,
        otherItems,
        cityName,
        countryName,
        tripDescription,
        isPublic,
        activeTab,
        coverImage,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      console.log('✅ Brouillon sauvegardé automatiquement');
    } catch (error) {
      console.error('❌ Erreur sauvegarde brouillon:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Restaurer le brouillon au chargement
  const loadDraft = async () => {
    try {
      const draftJson = await AsyncStorage.getItem(DRAFT_KEY);
      if (draftJson) {
        const draft = JSON.parse(draftJson);
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        // Si le brouillon a moins d'1 heure, on propose de le restaurer
        if (now - draft.timestamp < oneHour) {
          Alert.alert(
            'Brouillon trouvé',
            'Un brouillon de post a été trouvé. Voulez-vous le restaurer ?',
            [
              {
                text: 'Non',
                onPress: () => AsyncStorage.removeItem(DRAFT_KEY),
                style: 'cancel',
              },
              {
                text: 'Oui',
                onPress: () => {
                  setStayingItems(draft.stayingItems || []);
                  setRestaurantItems(draft.restaurantItems || []);
                  setActivitiesItems(draft.activitiesItems || []);
                  setOtherItems(draft.otherItems || []);
                  setCityName(draft.cityName || '');
                  setCountryName(draft.countryName || '');
                  setTripDescription(draft.tripDescription || '');
                  setIsPublic(draft.isPublic !== undefined ? draft.isPublic : true);
                  setActiveTab(draft.activeTab || 'staying');
                  setCoverImage(draft.coverImage || null);
                  Alert.alert('Brouillon restauré !', 'Votre travail a été récupéré.');
                },
              },
            ],
          );
        } else {
          // Brouillon trop ancien, on le supprime
          AsyncStorage.removeItem(DRAFT_KEY);
        }
      }
    } catch (error) {
      console.error('❌ Erreur chargement brouillon:', error);
    }
  };

  // Charger le brouillon au montage du composant
  useEffect(() => {
    loadDraft();
  }, []);

  // Recherche automatique de villes (comme dans explore.tsx)
  useEffect(() => {
    searchCities(cityName);
  }, [cityName]);

  // Sauvegarder automatiquement toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      // Sauvegarder seulement s'il y a du contenu
      if (cityName || tripDescription || coverImage || 
          stayingItems.length > 0 || restaurantItems.length > 0 || 
          activitiesItems.length > 0 || otherItems.length > 0) {
        saveDraft();
      }
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [cityName, tripDescription, coverImage, stayingItems, restaurantItems, activitiesItems, otherItems, isPublic, activeTab]);

  // Réinitialiser le formulaire
  const resetItemForm = () => {
    setTempItem({
      id: '',
      name: '',
      rating: 0, // Toutes les étoiles vides par défaut
      description: '',
      images: []
    });
    setEditingItem(null);
  };

  // Animation pour le bouton public/private
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

  // Ouvrir le modal d'ajout d'item
  const openAddItemModal = (tabType: TabType) => {
    setCurrentItemType(tabType);
    resetItemForm();
    setTempItem(prev => ({ ...prev, id: Date.now().toString() }));
    setShowItemModal(true);
  };

  // Ouvrir le modal de modification d'item
  const openEditItemModal = (item: TripItem, tabType: TabType) => {
    setCurrentItemType(tabType);
    setEditingItem(item);
    setTempItem({ ...item });
    setShowItemModal(true);
  };

  // Sauvegarder l'item
  const saveItem = () => {
    if (!tempItem.name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour cet élément.');
      return;
    }

    const itemToSave = { ...tempItem };

    if (editingItem) {
      // Modification d'un item existant
      updateItemInList(currentItemType, itemToSave);
    } else {
      // Ajout d'un nouvel item
      addItemToList(currentItemType, itemToSave);
    }

    setShowItemModal(false);
    resetItemForm();
  };

  // Ajouter un item à la liste appropriée
  const addItemToList = (tabType: TabType, item: TripItem) => {
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

  // Mettre à jour un item dans la liste appropriée
  const updateItemInList = (tabType: TabType, updatedItem: TripItem) => {
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

  // Ajouter une photo à l'item temporaire
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

  // Supprimer une photo de l'item temporaire
  const removeImageFromTempItem = (imageId: string) => {
    setTempItem(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  // Supprimer un item
  const removeItem = (tabType: 'staying' | 'restaurant' | 'activities' | 'other', itemId: string) => {
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

  // Calculer la note moyenne
  const calculateAverageRating = () => {
    const allItems = [...stayingItems, ...restaurantItems, ...activitiesItems, ...otherItems];
    if (allItems.length === 0) return 0;
    
    const totalRating = allItems.reduce((sum, item) => sum + item.rating, 0);
    return Math.round((totalRating / allItems.length) * 10) / 10; // Note moyenne sur 5
  };

  // Sélectionner la photo de couverture
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

  // Poster le voyage
  const handlePost = async () => {
    // Validation silencieuse - on ne poste que si tout est OK
    if (!coverImage || !cityName.trim() || !countryName.trim() || !userProfile) {
      return;
    }

    const averageRating = calculateAverageRating();
    const fullCountryName = getCountryName(countryName.trim());

    // Fermer le modal IMMÉDIATEMENT pour une UX rapide
    setShowPostModal(false);

    // Ajouter la ville IMMÉDIATEMENT dans le contexte local (optimiste)
    addOrUpdateCity({
      name: cityName.trim(),
      country: fullCountryName,
      flag: '',
      rating: averageRating,
      beenThere: true,
      source: 'post',
      postId: `temp-${Date.now()}` // ID temporaire
    });

    // Sauvegarder et publier en arrière-plan
    const publishInBackground = async () => {
      try {
        // Sauvegarde une dernière fois
        await saveDraft();
        
        console.log('🚀 Publication en arrière-plan...');
        
        const post = await createPost({
          city: cityName.trim(),
          country: fullCountryName,
          photo: coverImage,
          rating: averageRating,
          description: tripDescription.trim() || `Voyage à ${cityName}, ${fullCountryName}`,
          stayingItems,
          restaurantItems,
          activitiesItems,
          otherItems,
          isPublic,
        });
        
        console.log('✅ Post créé avec succès:', post);
        
        // Mettre à jour avec le vrai ID du post
        addOrUpdateCity({
          name: cityName.trim(),
          country: fullCountryName,
          flag: '',
          rating: averageRating,
          beenThere: true,
          source: 'post',
          postId: post
        });
        
        // Rafraîchir les posts
        if (typeof refreshPosts === 'function') {
          await refreshPosts();
        }

        // Supprimer le brouillon
        await AsyncStorage.removeItem(DRAFT_KEY);
        
        console.log('🎉 Publication terminée !');
      } catch (error) {
        console.error('❌ Erreur publication arrière-plan:', error);
        // En cas d'erreur, on garde le brouillon
      }
    };

    // Lancer la publication en arrière-plan
    publishInBackground();

    // Réinitialiser le formulaire immédiatement
    resetForm();
  };

  // Contenu de chaque onglet
  const renderTabContent = () => {
    const currentItems = activeTab === 'staying' ? stayingItems : 
                        activeTab === 'restaurant' ? restaurantItems : 
                        activeTab === 'activities' ? activitiesItems : otherItems;

    return (
      <View style={styles.tabContent}>
        {currentItems.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.itemCard, { borderColor: borderColor }]}
            onPress={() => openEditItemModal(item, activeTab)}
          >
            {/* Bouton supprimer */}
            <TouchableOpacity 
              style={[styles.deleteItemButton, { backgroundColor: '#5784BA' }]}
              onPress={(e) => {
                e.stopPropagation();
                removeItem(activeTab as 'staying' | 'restaurant' | 'activities' | 'other', item.id);
              }}
            >
              <Text style={styles.deleteItemText}>×</Text>
            </TouchableOpacity>

            {/* Première image ou placeholder */}
            <View style={styles.cardImageContainer}>
              {item.images.length > 0 ? (
                <Image source={{ uri: item.images[0].uri }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardImagePlaceholder, { borderColor: borderColor }]}>
                  <Text style={[styles.cardImagePlaceholderText, { color: textColor }]}>📷</Text>
                </View>
              )}
            </View>

            {/* Informations */}
            <View style={styles.cardInfo}>
              <Text style={[styles.cardName, { color: textColor }]} numberOfLines={1}>
                {item.name || `${activeTab === 'staying' ? 'Logement' : 
                               activeTab === 'restaurant' ? 'Restaurant' : 
                               activeTab === 'activities' ? 'Activité' : 'Autre'} sans nom`}
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

        {/* Bouton ajouter */}
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#2051A4' }]}
          onPress={() => openAddItemModal(activeTab)}
        >
          <Text style={[styles.addButtonText, { color: '#fff' }]}> 
            + Ajouter {activeTab === 'staying' ? 'un logement' : 
                      activeTab === 'restaurant' ? 'un restaurant' : 
                      activeTab === 'activities' ? 'une activité' : 'autre chose'}
          </Text>
        </TouchableOpacity>

        {/* Espacement pour le bouton flottant */}
        <View style={styles.bottomSpacing} />
      </View>
    );
  };

return (
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <SafeAreaView style={[styles.container, { backgroundColor: '#181C24' }]}> 
    {/* Onglets + tabs + separator all on dark background */}
    <View>
      <View style={[styles.header, { backgroundColor: 'transparent' }]}> 
        <View style={styles.headerTop}>
          {isSaving && (
            <View style={styles.savingIndicator}>
              <Text style={styles.savingText}>💾 Sauvegarde...</Text>
            </View>
          )}
        </View>
        <View style={styles.tabsContainer}>
          {(['staying', 'restaurant', 'activities', 'other'] as TabType[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && { borderBottomColor: borderColor }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? textActiveColor : textColor }]}> 
                {tab === 'staying' ? 'Staying' : 
                 tab === 'restaurant' ? 'Restaurant' : 
                 tab === 'activities' ? 'Activities' : 'Other'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* Ligne de séparation grise */}
      <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.2)', width: '100%' }} />
    </View>

    {/* Contenu */}
    <ScrollView style={[styles.content, { backgroundColor }]} showsVerticalScrollIndicator={false}>
      {renderTabContent()}
    </ScrollView>

    {/* Bouton flottant */}
    <TouchableOpacity 
      style={[styles.floatingButton, { backgroundColor: '#2051A4' }]}
      onPress={() => setShowPostModal(true)}
    >
      <Text style={styles.floatingButtonText}>Log your city</Text>
    </TouchableOpacity>

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
                Post when you finished your visit!
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
                        onChangeText={(text) => {
                          setCityName(text);
                          // La recherche se fera automatiquement via useEffect
                        }}
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
                {/* Overlay autocomplete suggestions */}
                {citySuggestions && citySuggestions.length > 0 && cityName.length > 1 && (
                  <View style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '100%',
                    marginTop: 8,
                    backgroundColor: '#181C24',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: borderColor,
                    zIndex: 100,
                    maxHeight: 180,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                  }}>
                    <ScrollView style={{ maxHeight: 180 }}>
                      {citySuggestions.map((city, idx) => {
                        // Always use full country name for display and selection
                        let countryDisplay = city.countryFull || city.country;
                        if (city.countryCode && countryNamesEn[city.countryCode.toUpperCase()]) {
                          countryDisplay = countryNamesEn[city.countryCode.toUpperCase()];
                        }
                        return (
                          <TouchableOpacity
                            key={`${city.name}-${countryDisplay}-${idx}`}
                            style={{ padding: 10, borderBottomWidth: idx < citySuggestions.length - 1 ? 1 : 0, borderBottomColor: '#eee', flexDirection: 'row', alignItems: 'center' }}
                            onPress={() => {
                              setCityName(city.name);
                              setCountryName(countryDisplay); // Always set full country name
                              setCitySuggestions([]);
                              Keyboard.dismiss(); // Fermer le clavier automatiquement
                            }}
                          >
                            <Image
                              source={{ uri: `https://flagcdn.com/w40/${city.countryCode?.toLowerCase() || city.country?.toLowerCase() || ''}.png` }}
                              style={{ width: 22, height: 16, borderRadius: 3, marginRight: 8 }}
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
                
                {/* Bouton Public/Private directement collé aux étoiles */}
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
                            outputRange: ['100%', '0%'], // Inverse: private = 100%, public = 0%
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
            
            {/* Bouton flottant dans le modal */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalPostButton, { backgroundColor: '#2051A4' }]} onPress={handlePost}>
                <Text style={styles.modalPostButtonText}>Poster le voyage</Text>
              </TouchableOpacity>
            </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
        
        {/* Input de description flottant - DEHORS du modal pour couvrir tout l'écran */}
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
            
            {/* Bouton Ajouter/Modifier */}
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
  </TouchableWithoutFeedback>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 0,
    paddingVertical: 6, // More compact
    paddingBottom: 2, // Even less space
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    // backgroundColor moved to JSX for dynamic override
  },
  headerTitle: {
    fontSize: 18, // Smaller title
    fontWeight: 'bold',
    marginBottom: 8, // Less space
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginHorizontal: -6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 31, // Ajouter de l'espace après la ligne (16 + 15 = 31)
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
  nameInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    height: 80,
    textAlignVertical: 'top',
  },
  ratingContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  ratingLabel: {
    fontSize: 16,
    marginBottom: 8,
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
  postTabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  postTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  averageRatingContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  averageRatingLabel: {
    fontSize: 18,
    marginBottom: 5,
  },
  averageRating: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  postButton: {
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
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
  postModalContent: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  postModalScroll: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
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
  bottomSpacing: {
    height: 120,
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
  separatorContainer: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  separatorLine: {
    height: 0.5,
    width: '100%',
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
    // Make input visually larger and modern
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
  // Nouveaux styles pour les cartes d'items
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
  // Styles pour le modal d'item
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
    right: 0, // Commence de la droite pour "private"
    top: 0,
    bottom: 0,
    backgroundColor: '#333333', // Couleur sombre pour "private"
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
  headerTop: {
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
  // Styles pour l'input de description flottant
  floatingDescriptionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'flex-start',
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
});
