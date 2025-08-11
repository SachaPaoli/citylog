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
    (uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('file://'));

  console.log('ProfileImage - URI:', uri);
  console.log('ProfileImage - shouldShowImage:', shouldShowImage);
  console.log('ProfileImage - imageError:', imageError);

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
        transition={200}
        onError={(error) => {
          console.log('ProfileImage - Erreur de chargement, switch vers icône:', error);
          setImageError(true);
        }}
        onLoad={() => {
          console.log('ProfileImage - Image chargée avec succès');
          setImageError(false);
        }}
      />
    );
  }

  // Fallback : icône par défaut
  console.log('ProfileImage - Affichage icône par défaut');
  return (
    <View 
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'rgba(255,255,255,0.04)', // Même couleur que les cartes de villes
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.18)', // Bordure subtile comme les cartes
        },
        style
      ]}
    >
      <Ionicons 
        name="person-outline" // Version outline pour avoir juste le contour
        size={Math.max(size * 0.5, 20)} 
        color="#bbb" // Gris comme les textes secondaires
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // Styles si nécessaire
});
