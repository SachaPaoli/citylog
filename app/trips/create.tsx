import { StarRating } from '@/components/StarRating';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
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

// WavyArrow component (flèche ondulée avec inputs)
const WavyArrow = () => {
  const [duration, setDuration] = useState('');
  const [timeUnit, setTimeUnit] = useState('minutes');
  const [selectedTransport, setSelectedTransport] = useState('⬜');
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);
  
  const timeUnits = [
    { label: 'minutes', value: 'minutes' },
    { label: 'hours', value: 'hours' },
    { label: 'days', value: 'days' }
  ];
  
  const transportModes = [
    { label: '🚗', value: 'car', name: 'Voiture', icon: '⬜' },
    { label: '🚲', value: 'bike', name: 'Vélo', icon: '○' },
    { label: '🚂', value: 'train', name: 'Train', icon: '▬' },
    { label: '🚌', value: 'bus', name: 'Bus', icon: '▭' },
    { label: '🚇', value: 'metro', name: 'Métro', icon: 'Ⓜ' },
    { label: '🏍️', value: 'moto', name: 'Moto', icon: '◦' },
    { label: '✈️', value: 'plane', name: 'Avion', icon: '✈' }
  ];

  const selectTimeUnit = (unit: string) => {
    setTimeUnit(unit);
    setShowTimeModal(false);
  };

  const selectTransport = (transport: string) => {
    setSelectedTransport(transport);
    setShowTransportModal(false);
  };

  return (
    <View style={styles.wavyArrowContainer}>
      {/* Première partie de la flèche (un segment retiré) */}
      <View style={styles.wavyPath}>
        <View style={[styles.arrowSegment, { transform: [{ rotate: '10deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-15deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '20deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-10deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '15deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-25deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '12deg' }] }]} />
        {/* Un segment retiré */}
      </View>

      {/* Container pour les 3 inputs */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.durationInput}
          placeholder="Durée"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
        />
        
        <TouchableOpacity 
          style={styles.selectButton}
          onPress={() => setShowTimeModal(true)}
        >
          <Text style={styles.selectText}>{timeUnit}</Text>
          <Text style={styles.selectArrow}>▼</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.selectButton}
          onPress={() => setShowTransportModal(true)}
        >
          <Text style={styles.selectText}>
            {transportModes.find(mode => mode.icon === selectedTransport)?.icon || '⬜'}
          </Text>
          <Text style={styles.selectArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Deuxième partie de la flèche (un autre segment retiré) */}
      <View style={styles.wavyPath}>
        <View style={[styles.arrowSegment, { transform: [{ rotate: '18deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-12deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '22deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-16deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '14deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-20deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '10deg' }] }]} />
        {/* Un autre segment retiré */}
      </View>

      {/* Pointe de la flèche */}
      <View style={styles.arrowHead}>
        <Text style={styles.arrowHeadText}>▼</Text>
      </View>

      {/* Modal pour sélection de l'unité de temps */}
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
            <Text style={styles.modalTitle}>Unité de temps</Text>
            {timeUnits.map((unit) => (
              <TouchableOpacity
                key={unit.value}
                style={[
                  styles.modalOption,
                  timeUnit === unit.value && styles.modalOptionSelected
                ]}
                onPress={() => selectTimeUnit(unit.value)}
              >
                <Text style={styles.modalOptionText}>{unit.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal pour sélection du transport */}
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
            <Text style={styles.modalTitle}>Moyen de transport</Text>
            {transportModes.map((mode) => (
              <TouchableOpacity
                key={mode.value}
                style={[
                  styles.modalOption,
                  selectedTransport === mode.icon && styles.modalOptionSelected
                ]}
                onPress={() => selectTransport(mode.icon)}
              >
                <Text style={styles.modalOptionText}>
                  {mode.icon} {mode.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

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
  const [localTrips, setLocalTrips] = useState<LocalTrip[]>([]);
  const beigeColor = '#E5C9A6';

  // Get params from router
  const { useLocalSearchParams } = require('expo-router');
  const params = useLocalSearchParams();

  // Charger les trips locaux depuis AsyncStorage
  const loadLocalTrips = useCallback(async () => {
    try {
      const storedTrips = await AsyncStorage.getItem('local_trips');
      let trips = storedTrips ? JSON.parse(storedTrips) : [];

      // If params from visited city, add as new trip if not already present
      if (params.cityName && params.countryName && params.rating) {
        const alreadyExists = trips.some(
          (t: LocalTrip) => t.city === params.cityName && t.country === params.countryName
        );
        if (!alreadyExists) {
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
        }
      }
      setLocalTrips(trips);
    } catch (error) {
      console.error('❌ Erreur chargement trips:', error);
      setLocalTrips([]);
    }
  }, [params.cityName, params.countryName, params.rating]);

  // Supprimer un trip local
  const deleteTrip = useCallback(async (tripId: string) => {
    try {
      const updatedTrips = localTrips.filter(trip => trip.id !== tripId);
      await AsyncStorage.setItem('local_trips', JSON.stringify(updatedTrips));
      setLocalTrips(updatedTrips);
      console.log('🗑️ Trip supprimé:', tripId);
    } catch (error) {
      console.error('❌ Erreur suppression trip:', error);
    }
  }, [localTrips]);

  // Recharger les trips chaque fois qu'on revient sur cette page
  useFocusEffect(
    useCallback(() => {
      loadLocalTrips();
    }, [loadLocalTrips])
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
          
          <Text style={[styles.headerTitle, { color: '#fff' }]}>
            Nouveau Trip
          </Text>
          
          <View style={styles.headerRight}>
            {/* Espace pour équilibrer le header */}
          </View>
        </View>

        {/* Liste des trips existants */}
        {localTrips.length > 0 && (
          <ScrollView 
            style={[styles.tripsContainer, { marginBottom: 0 }]} 
            contentContainerStyle={{ paddingBottom: 0 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.tripsTitle, { color: '#fff' }]}>Mes trips :</Text>
            {localTrips.map((trip, index) => {
              // If trip has no coverImage and no items, display as a simple visited city card
              const isSimpleVisited = !trip.coverImage && trip.stayingItems.length === 0 && trip.restaurantItems.length === 0 && trip.activitiesItems.length === 0 && trip.otherItems.length === 0;
              // Try to get country code from country name (for flag)
              let countryCode = '';
              if (trip.country && trip.country.length === 2) {
                countryCode = trip.country.toLowerCase();
              } else {
                // Try to map country name to code using ISO table
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
                      {/* Flag */}
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
                  {/* Flèche ondulée après chaque trip */}
                  <WavyArrow />
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Bouton Add a city (toujours affiché, mais sans flèche si aucun trip) */}
        <View style={localTrips.length > 0 ? styles.addCityContainerWithTrips : styles.addCityContainer}>
          <TouchableOpacity 
            style={styles.addCityButton}
            onPress={() => router.push('/trips/add-city' as any)}
          >
            <Text style={styles.addCityIcon}>+</Text>
            <Text style={styles.addCityText}>Add a city</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#fff',
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
    color: '#333',
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionSelected: {
    backgroundColor: '#f0f0f0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
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