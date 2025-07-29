import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useEffect, useState } from 'react';
import { Animated, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StarRating } from './StarRating';

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
  
  const [userRating, setUserRating] = useState(0);
  const [hasBeenThere, setHasBeenThere] = useState(false);
  const curtainAnimation = useState(new Animated.Value(0))[0];

  // Réinitialiser les états quand la ville change
  useEffect(() => {
    if (city) {
      setUserRating(city.userRating || 0);
      setHasBeenThere(false); // ou récupérer depuis une base de données
      // Réinitialiser l'animation
      curtainAnimation.setValue(0);
    }
  }, [city]);

  // Animation du rideau
  useEffect(() => {
    Animated.timing(curtainAnimation, {
      toValue: hasBeenThere ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [hasBeenThere, curtainAnimation]);

  const handleRatingChange = (rating: number) => {
    setUserRating(rating);
  };

  const handleSubmitRating = () => {
    if (city && userRating > 0) {
      // Activer automatiquement "I have been there" si pas déjà fait
      if (!hasBeenThere) {
        setHasBeenThere(true);
        // Attendre un peu pour voir l'animation puis fermer
        setTimeout(() => {
          onRate(city.id, userRating);
          onClose();
        }, 800); // 800ms pour voir l'animation complète
      } else {
        // Si déjà activé, fermer directement
        onRate(city.id, userRating);
        onClose();
      }
    }
  };

  const toggleHasBeenThere = () => {
    setHasBeenThere(!hasBeenThere);
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
                color="#f5c518"
                showRating={false}
              />
              <Text style={[styles.currentRating, { color: textColor }]}>
                {userRating > 0 ? `${userRating.toFixed(1)}/5` : 'Pas encore noté'}
              </Text>
            </View>
          </View>

          {/* Boutons d'action */}
          <View style={styles.actions}>
            {/* Ligne des boutons de notation */}
            {userRating > 0 && (
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={[styles.clearButton, { borderColor }]}
                  onPress={() => setUserRating(0)}
                >
                  <Text style={[styles.clearButtonText, { color: textColor }]}>
                    Supprimer ma note
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionButton, styles.rateButton]}
                  onPress={handleSubmitRating}
                >
                  <Text style={styles.rateButtonText}>
                    Valider
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Bouton I have been there en dessous */}
            <TouchableOpacity 
              style={[styles.visitedButtonFullWidth]}
              onPress={toggleHasBeenThere}
            >
              <View style={styles.visitedButtonContainer}>
                <Animated.View style={[
                  styles.curtainEffect,
                  {
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
    backgroundColor: '#5784BA',
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
  actionRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
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
  visitedButtonNew: {
    width: 120,
    height: 60,
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
  visitedButtonTextContainer: {
    alignItems: 'center',
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
  visitedButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  visitedButtonActive: {
    backgroundColor: '#5784BA',
  },
  visitedButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  visitedButtonTextActive: {
    color: '#FFFFFF',
  },
  walkingIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  walkingIconActive: {
    backgroundColor: '#5784BA',
    borderColor: '#5784BA',
  },
  walkingIconText: {
    fontSize: 16,
  },
  walkingIconTextActive: {
    color: '#FFFFFF',
  },
});
