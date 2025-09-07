import { StarRating } from '@/components/StarRating';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack, useFocusEffect } from 'expo-router';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image, InteractionManager, Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';

// WavyArrow refactor: controlled inputs via props
const WavyArrow = ({
  segment,
  onChange,
}: {
  segment: SegmentInput;
  onChange: (newSegment: SegmentInput) => void;
}) => {
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);

  const timeUnits = [
    { label: 'minutes', value: 'minutes' },
    { label: 'hours', value: 'hours' },
    { label: 'days', value: 'days' }
  ];

  const transportModes = [
    { label: '🚗', value: 'car', name: 'car', icon: 'car-outline' },
    { label: '🚲', value: 'bike', name: 'Bycicle', icon: 'bicycle-outline' },
    { label: '🚂', value: 'train', name: 'Train', icon: 'train-outline' },
    { label: '🚌', value: 'bus', name: 'Bus', icon: 'bus-outline' },
    { label: '🚇', value: 'metro', name: 'Metro', icon: 'subway-outline' },
    { label: '🏍️', value: 'moto', name: 'Bike', icon: 'speedometer-outline' },
    { label: '✈️', value: 'plane', name: 'Plane', icon: 'airplane-outline' }
  ];

  return (
    <View style={styles.wavyArrowContainer}>
      <View style={styles.wavyPath}>
        <View style={[styles.arrowSegment, { transform: [{ rotate: '10deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-15deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '20deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-10deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '15deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-25deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '12deg' }] }]} />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.durationInput}
          placeholder="Durée"
          value={segment.duration}
          onChangeText={val => onChange({ ...segment, duration: val })}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowTimeModal(true)}
        >
          <Text style={styles.selectText}>{segment.timeUnit}</Text>
          <Text style={styles.selectArrow}>▼</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowTransportModal(true)}
        >
          <Ionicons 
            name={transportModes.find(mode => mode.icon === segment.transport)?.icon as any || 'car-outline'} 
            size={20} 
            color="#fff" 
          />
          <Text style={styles.selectArrow}>▼</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.wavyPath}>
        <View style={[styles.arrowSegment, { transform: [{ rotate: '18deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-12deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '22deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-16deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '14deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-20deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '10deg' }] }]} />
      </View>
      <View style={styles.arrowHead}>
        <Text style={styles.arrowHeadText}>▼</Text>
      </View>
      {/* Modals */}
      <Modal
        visible={showTimeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowTimeModal(false)}
        >
          <View style={styles.modalContent}>
            {timeUnits.map((unit) => (
              <TouchableOpacity
                key={unit.value}
                style={[
                  styles.modalOption,
                  segment.timeUnit === unit.value && styles.modalOptionSelected
                ]}
                onPress={() => {
                  onChange({ ...segment, timeUnit: unit.value });
                  setShowTimeModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{unit.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal
        visible={showTransportModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTransportModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowTransportModal(false)}
        >
          <View style={styles.modalContent}>
            {transportModes.map((mode) => (
              <TouchableOpacity
                key={mode.value}
                style={[
                  styles.modalOption,
                  segment.transport === mode.icon && styles.modalOptionSelected
                ]}
                onPress={() => {
                  onChange({ ...segment, transport: mode.icon });
                  setShowTransportModal(false);
                }}
              >
                <View style={styles.modalOptionContent}>
                  <Ionicons name={mode.icon as any} size={20} color="#fff" />
                  <Text style={styles.modalOptionText}>{mode.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

interface SegmentInput {
  duration: string;
  timeUnit: string;
  transport: string;
}

interface LocalTrip {
  id: string;
  city: string;
  country: string;
  coverImage: string;
  rating: number;
  description: string;
  stayingItems: any[];
  restaurantItems: any[];
  activitiesItems: any[];
  otherItems: any[];
  isPublic: boolean;
  createdAt: number;
}

export default function CreateTripScreen() {
  const [doneTripName, setDoneTripName] = useState('');
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [localTrips, setLocalTrips] = useState<LocalTrip[]>([]);
  const [segments, setSegments] = useState<SegmentInput[]>([]);
  // Save segments to AsyncStorage whenever they or localTrips change
  React.useEffect(() => {
    AsyncStorage.setItem('local_segments', JSON.stringify(segments));
  }, [segments, localTrips]);

  // Always keep segments in sync with localTrips.length - 1
  React.useEffect(() => {
    const needed = Math.max(0, localTrips.length - 1);
    if (segments.length !== needed) {
      // Fill with previous values or defaults
      const fixed = Array.from({ length: needed }, (_, i) =>
        segments[i] || { duration: '', timeUnit: 'minutes', transport: 'car-outline' }
      );
      setSegments(fixed);
    }
  }, [localTrips, segments]);
  const prevTripCountRef = React.useRef<number>(0);
  const [posting, setPosting] = useState(false);
  // Log à chaque render pour debug
  console.log('[render] segments:', segments, 'localTrips:', localTrips);

  // Fonction pour poster le trip dans Firestore
  const postTripToFirestore = async (trip: LocalTrip) => {
    try {
      setPosting(true);
      const user = auth.currentUser;
      if (!user) throw new Error('Utilisateur non connecté');
      // Crée le trip principal
      const tripDoc = await addDoc(collection(db, 'trips'), {
        ...trip,
        tripName: doneTripName,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
        userPhoto: user.photoURL || '',
        createdAt: Timestamp.now(),
      });

      // Ajoute les villes visitées (avec rating, inputs de trajet) dans une sous-collection 'cities'
      if (localTrips.length > 0) {
        for (let i = 0; i < localTrips.length; i++) {
          const t = localTrips[i];
          // Segment info: for segment i-1 (between city i-1 and i)
          let duration = '';
          let timeUnit = '';
          let transport = '';
          if (i > 0 && segments[i - 1]) {
            duration = segments[i - 1].duration;
            timeUnit = segments[i - 1].timeUnit;
            transport = segments[i - 1].transport;
          }
          await addDoc(collection(db, 'trips', tripDoc.id, 'cities'), {
            city: t.city,
            country: t.country,
            rating: t.rating,
            coverImage: t.coverImage || '',
            description: t.description || '',
            createdAt: t.createdAt || Date.now(),
            duration,
            timeUnit,
            transport,
            order: i,
          });
        }
      }

      // Ajoute les posts liés au trip dans une sous-collection 'posts'
      if (trip.activitiesItems && Array.isArray(trip.activitiesItems)) {
        for (const post of trip.activitiesItems) {
          await addDoc(collection(db, 'trips', tripDoc.id, 'posts'), {
            ...post,
            createdAt: Date.now(),
          });
        }
      }

      setPosting(false);
    } catch (e) {
      setPosting(false);
      console.error('Erreur Firestore trip:', e);
    }
  };
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [doneCoverImage, setDoneCoverImage] = useState<string | null>(null);
  const [doneDescription, setDoneDescription] = useState('');
  const [doneIsPublic, setDoneIsPublic] = useState(true);
  const beigeColor = '#E5C9A6';
  const tripsScrollRef = React.useRef<ScrollView>(null);

  // Scroll to last trip when localTrips changes
  React.useEffect(() => {
    if (localTrips.length > 0 && tripsScrollRef.current) {
      InteractionManager.runAfterInteractions(() => {
        tripsScrollRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, [localTrips]);

  React.useEffect(() => {
    if (localTrips.length > 0 && tripsScrollRef.current) {
      setTimeout(() => {
        tripsScrollRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [localTrips]);

  // Get params from router
  const { useLocalSearchParams } = require('expo-router');
  const params = useLocalSearchParams();

  // Charger les trips locaux depuis AsyncStorage
  const loadLocalTrips = useCallback(async () => {
    try {
      const storedTrips = await AsyncStorage.getItem('local_trips');
      let trips = storedTrips ? JSON.parse(storedTrips) : [];

      let added = false;

      // If params from visited city, add as new trip if not already present
      if (params.cityName && params.countryName && params.rating) {
        const newTrip: LocalTrip = {
          id: `trip-${Date.now()}`,
          city: params.cityName,
          country: params.countryName,
          coverImage: '',
          rating: Number(params.rating),
          description: `Voyage à ${params.cityName}, ${params.countryName}`,
          stayingItems: [],
          restaurantItems: [],
          activitiesItems: [],
          otherItems: [],
          isPublic: true,
          createdAt: Date.now(),
        };
        trips = [...trips, newTrip];
        await AsyncStorage.setItem('local_trips', JSON.stringify(trips));
        added = true;
      }

      // If params.post is present, add a trip from the TravelPostCard
      if (params.post) {
        let postObj = null;
        try {
          postObj = typeof params.post === 'string' ? JSON.parse(params.post) : params.post;
        } catch (e) {
          postObj = null;
        }
        if (postObj && postObj.city && postObj.country) {
          const newTrip: LocalTrip = {
            id: `trip-${Date.now()}`,
            city: postObj.city,
            country: postObj.country,
            coverImage: postObj.photo || '',
            rating: typeof postObj.rating === 'number' ? postObj.rating : 0,
            description: postObj.description || `Voyage à ${postObj.city}, ${postObj.country}`,
            stayingItems: [],
            restaurantItems: [],
            activitiesItems: [],
            otherItems: [],
            isPublic: true,
            createdAt: Date.now(),
          };
          trips = [...trips, newTrip];
          await AsyncStorage.setItem('local_trips', JSON.stringify(trips));
          added = true;
        }
      }


      setLocalTrips(trips);

        // Always ensure segments array matches trips.length - 1
        const needed = Math.max(0, trips.length - 1);
        let loadedSegments: SegmentInput[] = [];
        try {
          const storedSegments = await AsyncStorage.getItem('local_segments');
          loadedSegments = storedSegments ? JSON.parse(storedSegments) : [];
        } catch (e) {
          loadedSegments = [];
        }
        // Fill missing segments with defaults
        const segmentsFixed = Array.from({ length: needed }, (_, i) =>
          loadedSegments[i] || { duration: '', timeUnit: 'minutes', transport: 'car-outline' }
        );
        setSegments(segmentsFixed);
        prevTripCountRef.current = trips.length;

      if (added && tripsScrollRef.current) {
        setTimeout(() => {
          tripsScrollRef.current?.scrollToEnd({ animated: true });
        }, 300);
      }
    } catch (error) {
      console.error('❌ Erreur chargement trips:', error);
      setLocalTrips([]);
      setSegments([]);
    }
  }, [params.cityName, params.countryName, params.rating, params.post]);

  // Supprimer un trip local
  const deleteTrip = useCallback(async (tripId: string) => {
    try {
      const idx = localTrips.findIndex(trip => trip.id === tripId);
      const updatedTrips = localTrips.filter(trip => trip.id !== tripId);
      await AsyncStorage.setItem('local_trips', JSON.stringify(updatedTrips));
      setLocalTrips(updatedTrips);
      // Recalculate segments to match new trips length
      const needed = Math.max(0, updatedTrips.length - 1);
      setSegments(prev => {
        const fixed = Array.from({ length: needed }, (_, i) =>
          prev[i] || { duration: '', timeUnit: 'minutes', transport: 'car-outline' }
        );
        return fixed;
      });
      console.log('🗑️ Trip supprimé:', tripId);
    } catch (error) {
      console.error('❌ Erreur suppression trip:', error);
    }
  }, [localTrips]);

  useFocusEffect(
    useCallback(() => {
      loadLocalTrips();
    }, [loadLocalTrips])
  );

  // Calculate average rating of all trips
  const averageRating = localTrips.length > 0
    ? Math.round((localTrips.reduce((sum, trip) => sum + (typeof trip.rating === 'number' ? trip.rating : 0), 0) / localTrips.length) * 10) / 10
    : 0;

  // Pick cover image for Done modal
  const pickDoneCoverImage = async () => {
    const ImagePicker = require('expo-image-picker');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8, // Optimisation pour le stockage
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      setDoneCoverImage(result.assets[0].uri);
    }
  };

  // Upload image to Firebase Storage
  const uploadCoverImageToFirebase = async (localUri: string): Promise<string> => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Utilisateur non connecté');

      // Import Firebase Storage
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('@/config/firebase');

      // Créer un nom unique pour l'image
      const imageName = `trips/${user.uid}/${Date.now()}_cover.jpg`;
      const imageRef = ref(storage, imageName);

      // Convertir l'URI locale en blob
      const response = await fetch(localUri);
      const blob = await response.blob();

      // Upload vers Firebase Storage
      console.log('📤 Upload de l\'image de couverture...');
      await uploadBytes(imageRef, blob);
      
      // Récupérer l'URL de téléchargement
      const downloadURL = await getDownloadURL(imageRef);
      console.log('✅ Image uploadée avec succès:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('❌ Erreur upload image:', error);
      throw error;
    }
  };

  // Ajoute l'appel Firestore sur le bouton Post/Done
  const handlePostTrip = async () => {
    if (!doneTripName) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour votre voyage');
      return;
    }
    
    if (!doneCoverImage) {
      Alert.alert('Image requise', 'Veuillez sélectionner une image de couverture pour votre voyage');
      return;
    }

    try {
      setPosting(true);
      
      // Upload de l'image de couverture vers Firebase Storage
      const firebaseImageURL = await uploadCoverImageToFirebase(doneCoverImage);
      
      const trip: LocalTrip = {
        id: `trip-${Date.now()}`,
        city: '',
        country: '',
        coverImage: firebaseImageURL, // URL Firebase au lieu de l'URI locale
        rating: averageRating,
        description: doneDescription,
        stayingItems: [],
        restaurantItems: [],
        activitiesItems: [],
        otherItems: [],
        isPublic: doneIsPublic,
        createdAt: Date.now(),
      };
      
      await postTripToFirestore(trip);
      
      // Nettoyer le state et fermer le modal
      setDoneTripName('');
      setDoneCoverImage(null);
      setDoneDescription('');
      setShowDoneModal(false);
      
      // Nettoyer les trips locaux
      await AsyncStorage.removeItem('local_trips');
      await AsyncStorage.removeItem('local_segments');
      setLocalTrips([]);
      setSegments([]);
      
      Alert.alert('Succès', 'Votre voyage a été publié avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur lors de la publication:', error);
      Alert.alert('Erreur', 'Impossible de publier le voyage. Vérifiez votre connexion.');
    } finally {
      setPosting(false);
    }
  };

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
            Nouveau Trip
          </Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => setShowHeaderMenu(true)} style={styles.headerMenuButton}>
              <Text style={styles.headerMenuDots}>⋯</Text>
            </TouchableOpacity>
          </View>
          {/* Header menu modal */}
          <Modal
            visible={showHeaderMenu}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowHeaderMenu(false)}
          >
            <TouchableOpacity style={styles.menuOverlayCentered} activeOpacity={1} onPress={() => setShowHeaderMenu(false)}>
              <View style={styles.menuContentCentered}>
                <TouchableOpacity style={styles.menuItemCentered} onPress={() => { setShowHeaderMenu(false); router.back(); }}>
                  <Text style={styles.menuItemTextCentered}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.menuItemCentered, { backgroundColor: '#ff4444' }]} onPress={async () => {
                  setShowHeaderMenu(false);
                  await AsyncStorage.removeItem('local_trips');
                  setLocalTrips([]);
                  setSegments([]);
                }}>
                  <Text style={[styles.menuItemTextCentered, { color: '#fff', fontWeight: 'bold' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* Liste des trips existants */}
        {localTrips.length > 0 && (
          <ScrollView
            ref={tripsScrollRef}
            style={[styles.tripsContainer, { marginBottom: 0 }]}
            contentContainerStyle={{ paddingBottom: 0 }}
            showsVerticalScrollIndicator={false}
          >
            {localTrips.map((trip, index) => {
              // If trip has no coverImage and no items, display as a simple visited city card
              const isSimpleVisited = !trip.coverImage && trip.stayingItems.length === 0 && trip.restaurantItems.length === 0 && trip.activitiesItems.length === 0 && trip.otherItems.length === 0;
              // Try to get country code from country name (for flag)
              let countryCode = '';
              if (trip.country && trip.country.length === 2) {
                countryCode = trip.country.toLowerCase();
              } else {
                const countryNamesEn = {
                  AF: 'Afghanistan', AL: 'Albania', DZ: 'Algeria', AS: 'American Samoa', AD: 'Andorra', AO: 'Angola', AI: 'Anguilla', AQ: 'Antarctica', AG: 'Antigua and Barbuda', AR: 'Argentina', AM: 'Armenia', AW: 'Aruba', AU: 'Australia', AT: 'Austria', AZ: 'Azerbaijan', BS: 'Bahamas', BH: 'Bahrain', BD: 'Bangladesh', BB: 'Barbados', BY: 'Belarus', BE: 'Belgium', BZ: 'Belize', BJ: 'Benin', BM: 'Bermuda', BT: 'Bhutan', BO: 'Bolivia', BA: 'Bosnia and Herzegovina', BW: 'Botswana', BV: 'Bouvet Island', BR: 'Brazil', IO: 'British Indian Ocean Territory', BN: 'Brunei Darussalam', BG: 'Bulgaria', BF: 'Burkina Faso', BI: 'Burundi', KH: 'Cambodia', CM: 'Cameroon', CA: 'Canada', CV: 'Cape Verde', KY: 'Cayman Islands', CF: 'Central African Republic', TD: 'Chad', CL: 'Chile', CN: 'China', CX: 'Christmas Island', CC: 'Cocos (Keeling) Islands', CO: 'Colombia', KM: 'Comoros', CG: 'Congo', CD: 'Congo, the Democratic Republic of the', CK: 'Cook Islands', CR: 'Costa Rica', CI: "Cote d'Ivoire", HR: 'Croatia', CU: 'Cuba', CY: 'Cyprus', CZ: 'Czech Republic', DK: 'Denmark', DJ: 'Djibouti', DM: 'Dominica', DO: 'Dominican Republic', EC: 'Ecuador', EG: 'Egypt', SV: 'El Salvador', GQ: 'Equatorial Guinea', ER: 'Eritrea', EE: 'Estonia', ET: 'Ethiopia', FK: 'Falkland Islands (Malvinas)', FO: 'Faroe Islands', FJ: 'Fiji', FI: 'Finland', FR: 'France', GF: 'French Guiana', PF: 'French Polynesia', TF: 'French Southern Territories', GA: 'Gabon', GM: 'Gambia', GE: 'Georgia', DE: 'Germany', GH: 'Ghana', GI: 'Gibraltar', GR: 'Greece', GL: 'Greenland', GD: 'Grenada', GP: 'Guadeloupe', GU: 'Guam', GT: 'Guatemala', GG: 'Guernsey', GN: 'Guinea', GW: 'Guinea-Bissau', GY: 'Guyana', HT: 'Haiti', HM: 'Heard Island and McDonald Islands', VA: 'Holy See (Vatican City State)', HN: 'Honduras', HK: 'Hong Kong', HU: 'Hungary', IS: 'Iceland', IN: 'India', ID: 'Indonesia', IR: 'Iran, Islamic Republic of', IQ: 'Iraq', IE: 'Ireland', IM: 'Isle of Man', IL: 'Israel', IT: 'Italy', JM: 'Jamaica', JP: 'Japan', JE: 'Jersey', JO: 'Jordan', KZ: 'Kazakhstan', KE: 'Kenya', KI: 'Kiribati', KP: 'Korea, Democratic People\'s Republic of', KR: 'Korea, Republic of', KW: 'Kuwait', KG: 'Kyrgyzstan', LA: 'Lao People\'s Democratic Republic', LV: 'Latvia', LB: 'Lebanon', LS: 'Lesotho', LR: 'Liberia', LY: 'Libyan Arab Jamahiriya', LI: 'Liechtenstein', LT: 'Lithuania', LU: 'Luxembourg', MO: 'Macao', MK: 'Macedonia, the Former Yugoslav Republic of', MG: 'Madagascar', MW: 'Malawi', MY: 'Malaysia', MV: 'Maldives', ML: 'Mali', MT: 'Malta', MH: 'Marshall Islands', MQ: 'Martinique', MR: 'Mauritania', MU: 'Mauritius', YT: 'Mayotte', MX: 'Mexico', FM: 'Micronesia, Federated States of', MD: 'Moldova, Republic of', MC: 'Monaco', MN: 'Mongolia', ME: 'Montenegro', MS: 'Montserrat', MA: 'Morocco', MZ: 'Mozambique', MM: 'Myanmar', NA: 'Namibia', NR: 'Nauru', NP: 'Nepal', NL: 'Netherlands', AN: 'Netherlands Antilles', NC: 'New Caledonia', NZ: 'New Zealand', NI: 'Nicaragua', NE: 'Niger', NG: 'Nigeria', NU: 'Niue', NF: 'Norfolk Island', MP: 'Northern Mariana Islands', NO: 'Norway', OM: 'Oman', PK: 'Pakistan', PW: 'Palau', PS: 'Palestinian Territory, Occupied', PA: 'Panama', PG: 'Papua New Guinea', PY: 'Paraguay', PE: 'Peru', PH: 'Philippines', PN: 'Pitcairn', PL: 'Poland', PT: 'Portugal', PR: 'Puerto Rico', QA: 'Qatar', RE: 'Reunion', RO: 'Romania', RU: 'Russian Federation', RW: 'Rwanda', BL: 'Saint Barthelemy', SH: 'Saint Helena', KN: 'Saint Kitts and Nevis', LC: 'Saint Lucia', MF: 'Saint Martin', PM: 'Saint Pierre and Miquelon', VC: 'Saint Vincent and the Grenadines', WS: 'Samoa', SM: 'San Marino', ST: 'Sao Tome and Principe', SA: 'Saudi Arabia', SN: 'Senegal', RS: 'Serbia', SC: 'Seychelles', SL: 'Sierra Leone', SG: 'Singapore', SK: 'Slovakia', SI: 'Slovenia', SB: 'Solomon Islands', SO: 'Somalia', ZA: 'South Africa', GS: 'South Georgia and the South Sandwich Islands', ES: 'Spain', LK: 'Sri Lanka', SD: 'Sudan', SR: 'Suriname', SJ: 'Svalbard and Jan Mayen', SZ: 'Swaziland', SE: 'Sweden', CH: 'Switzerland', SY: 'Syrian Arab Republic', TW: 'Taiwan, Province of China', TJ: 'Tajikistan', TZ: 'Tanzania, United Republic of', TH: 'Thailand', TL: 'Timor-Leste', TG: 'Togo', TK: 'Tokelau', TO: 'Tonga', TT: 'Trinidad and Tobago', TN: 'Tunisia', TR: 'Turkey', TM: 'Turkmenistan', TC: 'Turks and Caicos Islands', TV: 'Tuvalu', UG: 'Uganda', UA: 'Ukraine', AE: 'United Arab Emirates', GB: 'United Kingdom', US: 'United States', UM: 'United States Minor Outlying Islands', UY: 'Uruguay', UZ: 'Uzbekistan', VU: 'Vanuatu', VE: 'Venezuela', VN: 'Viet Nam', VG: 'Virgin Islands, British', VI: 'Virgin Islands, U.S.', WF: 'Wallis and Futuna', EH: 'Western Sahara', YE: 'Yemen', ZM: 'Zambia', ZW: 'Zimbabwe', };
                const nameToCode = Object.fromEntries(Object.entries(countryNamesEn).map(([code, name]) => [name, code]));
                if (trip.country && nameToCode[trip.country]) {
                  countryCode = nameToCode[trip.country].toLowerCase();
                }
              }
              return (
                <View key={trip.id}>
                  {isSimpleVisited ? (
                    <View style={styles.cityCard}>
                      {countryCode ? (
                        <Image
                          source={{ uri: `https://flagcdn.com/w80/${countryCode}.png` }}
                          style={styles.flag}
                          resizeMode="cover"
                        />
                      ) : null}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cityName}>{trip.city}, {trip.country}</Text>
                        <Text style={styles.cityRating}>★ {trip.rating}</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.tripCard}>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteTrip(trip.id)}
                      >
                        <Text style={styles.deleteButtonText}>×</Text>
                      </TouchableOpacity>
                      <Image source={{ uri: trip.coverImage }} style={styles.tripCoverImage} />
                      <View style={styles.tripInfo}>
                        <Text style={[styles.tripCity, { color: '#fff' }]}>{trip.city}</Text>
                        <Text style={[styles.tripCountry, { color: '#888' }]}>{trip.country}</Text>
                        <View style={styles.tripRating}>
                          <StarRating
                            rating={trip.rating}
                            readonly
                            size="small"
                            color="#f5c518"
                            showRating={true}
                          />
                        </View>
                        <Text style={[styles.tripDescription, { color: '#ccc' }]} numberOfLines={2}>
                          {trip.description}
                        </Text>
                      </View>
                    </View>
                  )}
                  {/* Flèche ondulée après chaque trip sauf le dernier */}
                  {index < localTrips.length - 1 && Array.isArray(segments) && segments[index] && typeof segments[index].duration === 'string' && typeof segments[index].timeUnit === 'string' && typeof segments[index].transport === 'string' ? (
                    <WavyArrow
                      segment={segments[index]}
                      onChange={seg => {
                        setSegments(prev => {
                          const newArr = [...prev];
                          newArr[index] = seg;
                          return newArr;
                        });
                      }}
                    />
                  ) : null}
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Bouton Add a city + Done button */}
        <View style={localTrips.length > 0 ? styles.addCityContainerWithTrips : styles.addCityContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity
              style={styles.addCityButton}
              onPress={() => router.push('/trips/add-city' as any)}
            >
              <Text style={styles.addCityIcon}>+</Text>
              <Text style={styles.addCityText}>Add a city</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowDoneModal(true)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Done Modal */}
        <Modal
          visible={showDoneModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDoneModal(false)}
        >
          <View style={styles.doneModalOverlay}>
            <View style={styles.doneModalContent}>
              <View style={styles.doneModalHeader}>
                <TouchableOpacity onPress={() => setShowDoneModal(false)}>
                  <Text style={styles.doneModalClose}>×</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.doneModalScroll} contentContainerStyle={{ paddingBottom: 40 }}>
                <Text style={styles.doneModalTitle}>Trip Summary</Text>
                {/* Trip Name Input */}
                <View style={styles.tripNameSection}>
                  <Text style={styles.tripNameLabel}>Name of the trip</Text>
                  <TextInput
                    style={styles.tripNameInput}
                    placeholder="Enter trip name..."
                    value={doneTripName}
                    onChangeText={setDoneTripName}
                  />
                </View>
                {/* Cover Image Section */}
                <View style={styles.coverImageSection}>
                  <Text style={styles.coverImageLabel}>Image de couverture *</Text>
                  {doneCoverImage ? (
                    <View style={styles.coverImageContainer}>
                      <Image source={{ uri: doneCoverImage }} style={styles.coverImage} />
                      <TouchableOpacity
                        style={styles.removeCoverImageButton}
                        onPress={() => setDoneCoverImage(null)}
                      >
                        <Text style={styles.removeCoverImageText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addCoverImageButton}
                      onPress={pickDoneCoverImage}
                    >
                      <Text style={styles.addCoverImageText}>Add cover image</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {/* Description Section */}
                <View style={styles.descriptionSection}>
                  <Text style={styles.descriptionLabel}>Description</Text>
                  <TextInput
                    style={styles.descriptionTextArea}
                    placeholder="Describe your trip..."
                    value={doneDescription}
                    onChangeText={setDoneDescription}
                    multiline
                  />
                </View>
                {/* Rating Section */}
                <View style={styles.averageRatingContainer}>
                  <Text style={styles.averageRatingLabel}>Average rating</Text>
                  <Text style={styles.averageRating}>{averageRating} ★</Text>
                </View>
                {/* Public/Private Toggle */}
                <View style={styles.privacySection}>
                  <Text style={styles.privacyLabel}>Privacy</Text>
                  <TouchableOpacity
                    style={styles.privacyButton}
                    onPress={() => setDoneIsPublic((prev) => !prev)}
                  >
                    <View style={styles.privacyButtonContainer}>
                      <View style={[styles.privacyCurtainEffect, { width: doneIsPublic ? 0 : '100%' }]} />
                      <View style={styles.privacyButtonContent}>
                        <Text style={[styles.privacyButtonText, doneIsPublic && styles.privacyButtonTextActive]}>
                          {doneIsPublic ? 'Public' : 'Private'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
                {/* Post Button */}
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={styles.modalPostButton}
                    onPress={async () => {
                      await handlePostTrip();
                      setShowDoneModal(false);
                      setDoneTripName('');
                      setDoneCoverImage(null);
                      setDoneDescription('');
                      setDoneIsPublic(true);
                    }}
                  >
                    <Text style={styles.modalPostButtonText}>Post trip</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

// ...styles unchanged...

const styles = StyleSheet.create({
  tripNameSection: {
    marginBottom: 12,
    alignItems: 'center',
  },
  tripNameLabel: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
  },
  tripNameInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.05)',
    width: '100%',
    maxWidth: 320,
    textAlign: 'center',
  },
  menuOverlayCentered: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContentCentered: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 18,
    minWidth: 220,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  menuItemCentered: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
    alignItems: 'center',
    minWidth: 160,
  },
  menuItemTextCentered: {
    fontSize: 16,
    textAlign: 'center',
    color: '#222',
  },
  headerMenuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMenuDots: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: -2,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  menuContent: {
    backgroundColor: '#222',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    width: 220,
    marginRight: 12,
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  menuButton: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 12,
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  doneModalScroll: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
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
    color: '#fff',
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
    color: '#fff',
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
    color: '#fff',
  },
  descriptionSection: {
    marginBottom: 12,
  },
  descriptionLabel: {
    fontSize: 16,
    marginBottom: 6,
    textAlign: 'center',
    color: '#fff',
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
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  averageRatingContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  averageRatingLabel: {
    fontSize: 18,
    marginBottom: 5,
    color: '#fff',
  },
  averageRating: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  doneButton: {
    backgroundColor: '#2ECC40',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  doneModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  doneModalContent: {
    height: '83.3333%', // 5/6 of the screen
    backgroundColor: '#181C24',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  doneModalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  doneModalClose: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    padding: 4,
  },
  doneModalBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  doneModalRatingContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  doneModalRatingLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 6,
  },
  doneModalRatingValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
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
    marginBottom: 12,
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
  tripsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tripsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tripCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  deleteButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  tripCoverImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  tripInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  tripCity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  tripCountry: {
    fontSize: 14,
    marginBottom: 4,
  },
  tripRating: {
    marginBottom: 4,
  },
  tripDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  addCityContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  addCityContainerWithTrips: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  addCityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  addCityIcon: {
    fontSize: 20,
    color: '#fff',
    marginRight: 8,
    fontWeight: 'bold',
  },
  addCityText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  // Styles pour WavyArrow
  wavyArrowContainer: {
    alignItems: 'center',
    paddingVertical: 0,
    marginTop: -5,
    marginBottom: -5,
    maxHeight: 400,
  },
  wavyPath: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  arrowSegment: {
    width: 3,
    height: 15,
    backgroundColor: '#888',
    marginVertical: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginVertical: 10,
    width: '90%',
  },
  durationInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  selectButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 5,
    minWidth: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  transportIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  selectArrow: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#181C24',
    borderRadius: 12,
    padding: 20,
    minWidth: 200,
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#fff',
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'left',
    marginLeft: 8,
  },
  modalOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  modalTransportIcon: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'rgba(51, 51, 51, 0.6)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginRight: 8,
  },
  arrowHead: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 10, // Shorter arrow head after inputs
  },
  arrowHeadText: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'bold',
  },
});