import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface ProfileImageProps {
  uri?: string | null;
  size?: number;
  style?: any;
}

export const ProfileImage: React.FC<ProfileImageProps> = ({ 
  uri, 
  size = 100, 
  style 
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Vérifier si on a une URI valide ET pas d'erreur de chargement
  const shouldShowImage = uri && 
    uri.trim() !== '' && 
    !imageError &&
    (uri.startsWith('http://') || uri.startsWith('https://'));

  if (shouldShowImage) {
    return (
      <Image 
        source={{ uri }} 
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#2a2a2a',
          },
          style
        ]}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={0} // Suppression de la transition pour un affichage instantané
        onError={() => {
          setImageError(true);
        }}
        onLoad={() => {
          setImageError(false);
        }}
      />
    );
  }

  // Fallback : icône par défaut - affichage instantané
  return (
    <View 
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'rgba(255,255,255,0.04)',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.18)',
        },
        style
      ]}
    >
      <Ionicons 
        name="person-outline"
        size={Math.max(size * 0.5, 20)} 
        color="#bbb"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // Styles si nécessaire
});
