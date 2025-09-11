import { EnrichedRealCityData } from '@/services/RealCitiesService';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
      Alert.alert('Rating required', 'Please select a rating before submitting.');
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
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={50} style={styles.blurContainer}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <SafeAreaView style={styles.safeAreaContainer}>
            {/* Handle bar */}
            <View style={styles.handleBar} />
            
            {/* Title */}
            <Text style={styles.title}>Rate {city.name}</Text>
            
            {/* Separator line */}
            <View style={styles.separator} />
            
            {/* Content */}
            <ScrollView 
              style={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* Flag */}
              <View style={styles.flagContainer}>
                <Image source={{ uri: city.image }} style={styles.flagImage} />
              </View>

              {/* City info */}
              <View style={styles.cityInfo}>
                <Text style={styles.cityName}>{city.name}</Text>
                <Text style={styles.countryName}>{city.country}</Text>
                
                {/* Average rating */}
                <View style={styles.currentRatingContainer}>
                  <Text style={styles.currentRatingLabel}>Average rating:</Text>
                  <StarRating 
                    rating={city.averageRating} 
                    readonly={true} 
                    size="medium"
                    color="#FFD700"
                  />
                  <Text style={styles.totalRatings}>({city.totalRatings} ratings)</Text>
                </View>
              </View>

              {/* User rating section */}
              <View style={styles.ratingSection}>
                <Text style={styles.ratingTitle}>Your rating for {city.name}</Text>
                <Text style={styles.ratingSubtitle}>Tap the stars to rate</Text>
                
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

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.submitButton, userRating === 0 && styles.submitButtonDisabled]}
                  onPress={handleSubmitRating}
                  disabled={userRating === 0}
                >
                  <Text style={styles.submitButtonText}>
                    {city.userRating ? 'Update my rating' : 'Validate my rating'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
}

function getRatingText(rating: number): string {
  if (rating <= 1) return "😞 Disappointing";
  if (rating <= 2) return "😐 Average";
  if (rating <= 3) return "🙂 Correct";
  if (rating <= 4) return "😊 Good";
  return "🤩 Excellent!";
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
  },
  modalContent: {
    height: '75%',
    backgroundColor: '#181C24',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  safeAreaContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
  },
  flagContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  flagImage: {
    width: 50,
    height: 35,
    borderRadius: 4,
  },
  cityInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cityName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  countryName: {
    fontSize: 18,
    color: '#999',
    marginBottom: 20,
  },
  currentRatingContainer: {
    alignItems: 'center',
    gap: 8,
  },
  currentRatingLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  totalRatings: {
    fontSize: 14,
    color: '#888',
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  ratingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  ratingSubtitle: {
    fontSize: 16,
    color: '#999',
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
    gap: 15,
    paddingBottom: 20,
  },
  submitButton: {
    backgroundColor: '#2051A4',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#444',
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
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
});
