import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface StarRatingProps {
  rating: number; // 0 to 5 in 0.5 increments
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'small' | 'medium' | 'large';
  showRating?: boolean;
  color?: string;
}

export function StarRating({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = 'medium',
  showRating = true,
  color = '#f5c518' // Couleur Letterboxd par défaut
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const sizes = {
    small: 20,
    medium: 28,
    large: 36
  };

  const iconSize = sizes[size];
  const displayRating = hoveredRating !== null ? hoveredRating : rating;

  const handleStarPress = (starIndex: number, isHalf: boolean = false) => {
    if (readonly || !onRatingChange) return;
    
    const newRating = isHalf ? starIndex + 0.5 : starIndex + 1;
    
    // Si on clique sur la même étoile, on peut la réduire d'une demi-étoile
    if (newRating === rating && !isHalf) {
      onRatingChange(starIndex + 0.5);
    } else {
      onRatingChange(newRating);
    }
  };

  const handleStarPressIn = (starIndex: number, isHalf: boolean = false) => {
    if (readonly) return;
    const newRating = isHalf ? starIndex + 0.5 : starIndex + 1;
    setHoveredRating(newRating);
  };

  const handleStarPressOut = () => {
    if (readonly) return;
    setHoveredRating(null);
  };

  const renderStar = (index: number) => {
    const starValue = index + 1;
    const halfStarValue = index + 0.5;

    let iconName = 'star-outline';
    if (displayRating >= starValue) {
      iconName = 'star';
    } else if (displayRating >= halfStarValue) {
      iconName = 'star-half-full';
    }

    const starColor = iconName === 'star-outline' ? '#666' : color;

    if (readonly) {
      // Mode lecture seule - simple affichage
      return (
        <Icon
          key={index}
          name={iconName}
          size={iconSize}
          color={starColor}
          style={styles.starIcon}
        />
      );
    }

    // Mode interactif - étoile cliquable entière
    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleStarPress(index, false)}
        onPressIn={() => handleStarPressIn(index, false)}
        onPressOut={handleStarPressOut}
        activeOpacity={0.7}
        style={styles.starTouchable}
      >
        <Icon
          name={iconName}
          size={iconSize}
          color={starColor}
          style={styles.starIcon}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {[0, 1, 2, 3, 4].map(renderStar)}
      </View>
      {showRating && (
        <Text style={[styles.ratingText, { color, fontSize: size === 'small' ? 12 : size === 'large' ? 18 : 14 }]}>
          {displayRating.toFixed(1)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginHorizontal: 1,
  },
  starTouchable: {
    padding: 2,
  },
  ratingText: {
    fontWeight: '600',
    marginLeft: 4,
  },
});
