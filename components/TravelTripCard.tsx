import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useUserPhotoCache } from '@/hooks/useUserPhotoCache';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProfileImage } from './ProfileImage';
import { StarRating } from './StarRating';

interface TravelTripCardProps {
  tripId: string;
  coverImage: string;
  tripName: string;
  averageRating: number;
  countriesCount: number;
  citiesCount: number;
  userId: string;
  userName: string;
  userPhoto?: string;
  createdAt: number;
  onPress?: () => void;
}

export function TravelTripCard({ 
  tripId,
  coverImage, 
  tripName, 
  averageRating, 
  countriesCount, 
  citiesCount,
  userId,
  userName,
  userPhoto,
  createdAt,
  onPress
}: TravelTripCardProps) {
  const textColor = useThemeColor({}, 'text');
  const textActiveColor = useThemeColor({}, 'textActive');
  const ratingColor = useThemeColor({}, 'rating');
  const backgroundColor = useThemeColor({}, 'background');  
  const { user } = useAuth();

  // Récupérer la photo de profil de l'utilisateur du trip si elle n'est pas présente
  const { userPhoto: fetchedUserPhoto } = useUserPhotoCache(userId);

  // Utiliser la photo de profil actuelle de l'utilisateur si c'est son trip
  const displayUserPhoto = (user && userId === user.uid && user.photoURL) 
    ? user.photoURL 
    : userPhoto || fetchedUserPhoto;

  // Précharger les images pour l'affichage instantané avec expo-image
  React.useEffect(() => {
    Image.prefetch(coverImage);
    if (displayUserPhoto) {
      Image.prefetch(displayUserPhoto);
    }
  }, [coverImage, displayUserPhoto]);

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor }]} 
      onPress={onPress ? onPress : () => {
        console.log('🔗 Navigation vers detail avec tripId:', tripId);
        router.push(`/trips/detail?tripId=${tripId}`);
      }}
    >
      <View style={styles.content}>
        {/* Photo principale du trip */}
        <View style={styles.photoContainer}>
          <Image 
            source={{ uri: coverImage }} 
            style={styles.tripPhoto}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
            placeholder={require('@/assets/images/placeholder.png')}
          />
        </View>
        
        {/* Informations à droite */}
        <View style={styles.infoContainer}>
          {/* Photo de profil et nom */}
          <View style={styles.userInfo}>
            <ProfileImage 
              uri={displayUserPhoto}
              size={32}
            />
            <Text style={[styles.userName, { color: textColor }]}>
              {userName}
            </Text>
          </View>
          
          {/* Nom du trip */}
          <Text style={[styles.tripName, { color: textColor }]} numberOfLines={2}>
            {tripName}
          </Text>
          
          {/* Note avec étoiles jaunes + nombre, comme sur la page post */}
          <View style={styles.ratingContainer}>
            <StarRating 
              rating={averageRating}
              readonly
              size="small"
              showRating={true}
              color="#f5c518"
            />
          </View>

          {/* Statistiques du trip */}
          <View style={styles.statsRow}>
            <Text style={[styles.statsText, { color: textColor }]}>
              {countriesCount} pays • {citiesCount} villes
            </Text>
          </View>
          
          {/* Date */}
          <View style={styles.dateContainer}>
            <Text style={[styles.dateText, { color: textColor }]}> 
              {createdAt ? new Date(createdAt).toLocaleDateString('fr-FR') : ''}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    padding: 16,
  },
  photoContainer: {
    flex: 1,
    marginRight: 16,
  },
  tripPhoto: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  tripName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsRow: {
    marginBottom: 8,
  },
  statsText: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '500',
  },
  dateContainer: {
    marginTop: 8,
  },
  dateText: {
    fontSize: 10,
    opacity: 0.5,
  },
});
