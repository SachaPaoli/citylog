import { getCountryName } from '@/constants/CountryNames';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Post } from '@/types/Post';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProfileImage } from './ProfileImage';
import { StarRating } from './StarRating';

interface TravelPostCardProps {
  post: Post;
  onPress?: () => void;
}

export function TravelPostCard({ post, onPress }: TravelPostCardProps) {
  const textColor = useThemeColor({}, 'text');
  const textActiveColor = useThemeColor({}, 'textActive');
  const ratingColor = useThemeColor({}, 'rating');
  const backgroundColor = useThemeColor({}, 'background');
  const { user } = useAuth();

  // Utiliser la photo de profil actuelle de l'utilisateur si c'est son post
  const userPhoto = (user && post.userId === user.uid && user.photoURL) 
    ? user.photoURL 
    : post.userPhoto || 'https://images.unsplash.com/photo-1494790108755-2616b5739775?w=100&h=100&fit=crop&crop=face';

  // Précharger les images pour l'affichage instantané avec expo-image
  React.useEffect(() => {
    Image.prefetch(post.photo);
    if (userPhoto) {
      Image.prefetch(userPhoto);
    }
  }, [post.photo, userPhoto]);

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor }]} 
      onPress={() => router.push(`/trip-detail?postId=${post.id}`)}
    >
      <View style={styles.content}>
        {/* Photo principale de la ville */}
        <View style={styles.photoContainer}>
          <Image 
            source={{ uri: post.photo }} 
            style={styles.cityPhoto}
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
              uri={userPhoto}
              size={32}
            />
            <Text style={[styles.userName, { color: textColor }]}>
              {post.userName}
            </Text>
          </View>
          
          {/* Ville et pays */}
          <Text style={[styles.location, { color: textColor }]}> 
            {post.city}, {getCountryName(post.country)}
          </Text>
          
          {/* Note avec étoiles jaunes + nombre, comme sur la page post */}
          <View style={styles.ratingContainer}>
            <StarRating 
              rating={post.rating}
              readonly
              size="small"
              showRating={true}
              color="#f5c518"
            />
          </View>
          
          {/* Date */}
          <View style={styles.dateContainer}>
            <Text style={[styles.dateText, { color: textColor }]}> 
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString('fr-FR') : ''}
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
  cityPhoto: {
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
  location: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingBadge: {
    backgroundColor: '#2563eb', // bleu plus foncé et électrique
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  dateContainer: {
    marginTop: 8,
  },
  dateText: {
    fontSize: 10,
    opacity: 0.5,
  },
});
