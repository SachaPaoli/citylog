import { EnrichedRealCityData } from '@/services/RealCitiesService';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { StarRating } from './StarRating';

interface CityRatingModalProps {
  city: EnrichedRealCityData | null;
  visible: boolean;
  onClose: () => void;
  onRatingSubmit: (cityId: number, rating: number) => void;
}

export function CityRatingModal({ city, visible, onClose, onRatingSubmit }: CityRatingModalProps) {
  const [userRating, setUserRating] = useState(city?.userRating || 0);

  if (!city) return null;

  const handleSubmitRating = () => {
    if (userRating === 0) {
      Alert.alert('Notation requise', 'Veuillez sélectionner une note avant de valider.');
      return;
    }

    onRatingSubmit(city.id, userRating);
    onClose();
  };

  const handleRatingChange = (rating: number) => {
    setUserRating(rating);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header avec drapeau et fermeture */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          
          <View style={styles.flagContainer}>
            <Image source={{ uri: city.image }} style={styles.flagImage} />
          </View>
        </View>

        {/* Informations de la ville */}
        <View style={styles.cityInfo}>
          <Text style={styles.cityName}>{city.name}</Text>
          <Text style={styles.countryName}>{city.country}</Text>
          
          {/* Note moyenne actuelle */}
          <View style={styles.currentRatingContainer}>
            <Text style={styles.currentRatingLabel}>Note moyenne :</Text>
            <StarRating 
              rating={city.averageRating} 
              readonly={true} 
              size="medium"
              color="#FFD700"
            />
            <Text style={styles.totalRatings}>({city.totalRatings} notes)</Text>
          </View>
        </View>

        {/* Section de notation utilisateur */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>Votre note pour {city.name}</Text>
          <Text style={styles.ratingSubtitle}>Cliquez sur les étoiles pour noter</Text>
          
          <View style={styles.userRatingContainer}>
            <StarRating 
              rating={userRating} 
              onRatingChange={handleRatingChange}
              readonly={false} 
              size="large"
              color="#FFD700"
              showRating={true}
            />
          </View>

          {userRating > 0 && (
            <Text style={styles.ratingFeedback}>
              {getRatingText(userRating)}
            </Text>
          )}
        </View>

        {/* Bouton de validation */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.submitButton, userRating === 0 && styles.submitButtonDisabled]}
            onPress={handleSubmitRating}
            disabled={userRating === 0}
          >
            <Text style={styles.submitButtonText}>
              {city.userRating ? 'Modifier ma note' : 'Valider ma note'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function getRatingText(rating: number): string {
  if (rating <= 1) return "😞 Décevant";
  if (rating <= 2) return "😐 Moyen";
  if (rating <= 3) return "🙂 Correct";
  if (rating <= 4) return "😊 Bien";
  return "🤩 Excellent !";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  flagContainer: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -25 }],
  },
  flagImage: {
    width: 50,
    height: 35,
    borderRadius: 4,
  },
  cityInfo: {
    alignItems: 'center',
    padding: 30,
  },
  cityName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  countryName: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  currentRatingContainer: {
    alignItems: 'center',
    gap: 8,
  },
  currentRatingLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  totalRatings: {
    fontSize: 14,
    color: '#888',
  },
  ratingSection: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 30,
  },
  ratingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  ratingSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  userRatingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingFeedback: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF8C00',
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 30,
    gap: 15,
  },
  submitButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
