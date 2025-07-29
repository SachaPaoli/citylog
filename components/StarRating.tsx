import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StarRatingProps {
  rating: number;
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
  color = '#FFD700' 
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const sizes = {
    small: 16,
    medium: 20,
    large: 28
  };

  const starSize = sizes[size];
  const displayRating = hoveredRating !== null ? hoveredRating : rating;

  const handleStarPress = (starIndex: number, isHalf: boolean) => {
    if (readonly) return;
    
    const newRating = isHalf ? starIndex + 0.5 : starIndex + 1;
    onRatingChange?.(newRating);
  };

  const handleStarPressIn = (starIndex: number, isHalf: boolean) => {
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
    
    const isFullFilled = displayRating >= starValue;
    const isHalfFilled = displayRating >= halfStarValue && displayRating < starValue;
    
    return (
      <View key={index} style={styles.starContainer}>
        {/* Zone cliquable pour demi-étoile (gauche) */}
        <TouchableOpacity
          style={[styles.halfStar, styles.leftHalf]}
          onPress={() => handleStarPress(index, true)}
          onPressIn={() => handleStarPressIn(index, true)}
          onPressOut={handleStarPressOut}
          disabled={readonly}
          activeOpacity={0.7}
        >
          <View style={styles.halfStarOverlay}>
            <Text style={[styles.star, { fontSize: starSize, color: isHalfFilled || isFullFilled ? color : '#E0E0E0' }]}>
              ★
            </Text>
            {!isFullFilled && (
              <View style={[styles.rightHalfCover, { backgroundColor: readonly ? 'transparent' : '#E0E0E0' }]} />
            )}
          </View>
        </TouchableOpacity>

        {/* Zone cliquable pour étoile complète (droite) */}
        <TouchableOpacity
          style={[styles.halfStar, styles.rightHalf]}
          onPress={() => handleStarPress(index, false)}
          onPressIn={() => handleStarPressIn(index, false)}
          onPressOut={handleStarPressOut}
          disabled={readonly}
          activeOpacity={0.7}
        >
          <Text style={[styles.star, { fontSize: starSize, color: isFullFilled ? color : '#E0E0E0' }]}>
            ★
          </Text>
        </TouchableOpacity>
      </View>
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
  starContainer: {
    flexDirection: 'row',
    position: 'relative',
  },
  halfStar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftHalf: {
    position: 'absolute',
    left: 0,
    right: '50%',
    zIndex: 2,
  },
  rightHalf: {
    width: '100%',
  },
  halfStarOverlay: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightHalfCover: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
  star: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  ratingText: {
    fontWeight: '600',
    marginLeft: 4,
  },
});
