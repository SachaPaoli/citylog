import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Post } from '@/types/Post';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TravelPostCardProps {
  post: Post;
  onPress?: () => void;
  onLike?: () => void;
}

export function TravelPostCard({ post, onPress, onLike }: TravelPostCardProps) {
  const textColor = useThemeColor({}, 'text');
  const textActiveColor = useThemeColor({}, 'textActive');
  const ratingColor = useThemeColor({}, 'rating');
  const backgroundColor = useThemeColor({}, 'background');
  const { user } = useAuth();

  const isLiked = user ? post.likes.includes(user.uid) : false;
  const likesCount = post.likes.length;

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
            defaultSource={require('@/assets/images/placeholder.png')}
          />
        </View>
        
        {/* Informations à droite */}
        <View style={styles.infoContainer}>
          {/* Photo de profil et nom */}
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: post.userPhoto || 'https://images.unsplash.com/photo-1494790108755-2616b5739775?w=100&h=100&fit=crop&crop=face' }} 
              style={styles.userPhoto}
              defaultSource={require('@/assets/images/placeholder.png')}
            />
            <Text style={[styles.userName, { color: textColor }]}>
              {post.userName}
            </Text>
          </View>
          
          {/* Ville et pays */}
          <Text style={[styles.location, { color: textColor }]}>
            {post.city}, {post.country}
          </Text>
          
          {/* Note */}
          <View style={styles.ratingContainer}>
            <Text style={[styles.rating, { color: ratingColor }]}>
              ⭐ {post.rating}/10
            </Text>
          </View>
          
          {/* Description courte */}
          <Text style={[styles.description, { color: textColor }]} numberOfLines={2}>
            {post.description}
          </Text>
          
          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.likeButton}
              onPress={onLike}
            >
              <Text style={[styles.likeIcon, { color: isLiked ? textActiveColor : textColor }]}>
                {isLiked ? '❤️' : '🤍'}
              </Text>
              <Text style={[styles.likeCount, { color: textColor }]}>
                {likesCount}
              </Text>
            </TouchableOpacity>
            
            <Text style={[styles.dateText, { color: textColor }]}>
              {post.createdAt.toLocaleDateString('fr-FR')}
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
  },
  userPhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#333',
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
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  likeCount: {
    fontSize: 12,
    opacity: 0.7,
  },
  dateText: {
    fontSize: 10,
    opacity: 0.5,
  },
});
