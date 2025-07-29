import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { StarRating } from './StarRating';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SimpleCity {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  averageRating?: number;
  totalRatings?: number;
  userRating?: number;
}

interface SimpleCityRatingModalProps {
  visible: boolean;
  city: SimpleCity | null;
  onClose: () => void;
  onRate: (cityId: number, rating: number) => void;
}

export function SimpleCityRatingModal({ visible, city, onClose, onRate }: SimpleCityRatingModalProps) {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'borderColor');
  
  const [userRating, setUserRating] = useState(city?.userRating || 0);

  const handleRatingChange = (rating: number) => {
    setUserRating(rating);
  };

  const handleSubmitRating = () => {
    if (city) {
      onRate(city.id, userRating);
      onClose();
    }
  };

  if (!city) return null;

  const flagUrl = `https://flagcdn.com/w80/${city.countryCode.toLowerCase()}.png`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor }]}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header avec drapeau */}
          <View style={styles.header}>
            <Image source={{ uri: flagUrl }} style={styles.flagImage} />
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={[styles.closeButtonText, { color: textColor }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Nom de la ville */}
          <View style={styles.cityHeader}>
            <Text style={[styles.cityName, { color: textColor }]}>{city.name}</Text>
            <Text style={[styles.countryName, { color: textColor }]}>{city.country}</Text>
          </View>

          {/* Note moyenne existante */}
          {city.averageRating && city.totalRatings && (
            <View style={styles.averageSection}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Note moyenne</Text>
              <View style={styles.averageRating}>
                <StarRating 
                  rating={city.averageRating} 
                  readonly={true} 
                  size="large"
                  color="#FFD700"
                />
                <Text style={[styles.ratingsCount, { color: textColor }]}>
                  ({city.totalRatings} note{city.totalRatings > 1 ? 's' : ''})
                </Text>
              </View>
            </View>
          )}

          {/* Votre note */}
          <View style={styles.userRatingSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Votre note</Text>
            <View style={styles.userRatingContainer}>
              <StarRating 
                rating={userRating} 
                onRatingChange={handleRatingChange}
                size="large"
                color="#FF8C00"
                showRating={false}
              />
              <Text style={[styles.currentRating, { color: '#FF8C00' }]}>
                {userRating > 0 ? `${userRating.toFixed(1)}/5` : 'Pas encore noté'}
              </Text>
            </View>
          </View>

          {/* Boutons d'action */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rateButton]}
              onPress={handleSubmitRating}
              disabled={userRating === 0}
            >
              <Text style={styles.rateButtonText}>
                {city.userRating ? 'Modifier ma note' : 'Noter cette ville'}
              </Text>
            </TouchableOpacity>

            {userRating > 0 && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.clearButton, { borderColor }]}
                onPress={() => setUserRating(0)}
              >
                <Text style={[styles.clearButtonText, { color: textColor }]}>
                  Supprimer ma note
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  flagImage: {
    width: 60,
    height: 40,
    borderRadius: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
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
  averageSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  averageRating: {
    alignItems: 'center',
    gap: 10,
  },
  ratingsCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  userRatingSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  userRatingContainer: {
    alignItems: 'center',
    gap: 15,
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
  actionButton: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  rateButton: {
    backgroundColor: '#FF8C00',
  },
  rateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
