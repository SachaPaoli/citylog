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
      {/* Première partie de la flèche */}
      <View style={styles.wavyPath}>
        <View style={[styles.arrowSegment, { transform: [{ rotate: '10deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-15deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '20deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-10deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '15deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-25deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '12deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-8deg' }] }]} />
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

      {/* Deuxième partie de la flèche */}
      <View style={styles.wavyPath}>
        <View style={[styles.arrowSegment, { transform: [{ rotate: '18deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-12deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '22deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-16deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '14deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-20deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '10deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '-14deg' }] }]} />
        <View style={[styles.arrowSegment, { transform: [{ rotate: '16deg' }] }]} />
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

  // Charger les trips locaux depuis AsyncStorage
  const loadLocalTrips = useCallback(async () => {
    try {
      const storedTrips = await AsyncStorage.getItem('local_trips');
      if (storedTrips) {
        const trips = JSON.parse(storedTrips);
        console.log('📚 Trips chargés:', trips);
        setLocalTrips(trips);
      } else {
        setLocalTrips([]);
      }
    } catch (error) {
      console.error('❌ Erreur chargement trips:', error);
      setLocalTrips([]);
    }
  }, []);

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
            {localTrips.map((trip, index) => (
              <View key={trip.id}>
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
                
                {/* Flèche ondulée après chaque trip */}
                <WavyArrow />
              </View>
            ))}
          </ScrollView>
        )}

        {/* Flèche ondulée pour le premier trip (quand pas de trips) */}
        {localTrips.length === 0 && <WavyArrow />}

        {/* Bouton Add a city */}
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
    marginBottom: 30,
  },
  arrowHeadText: {
    fontSize: 20,
    color: '#888',
    fontWeight: 'bold',
  },
});