import { useThemeColor } from '@/hooks/useThemeColor';
import { Post } from '@/types/Post';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StarRating } from './StarRating';

interface MyTravelPostCardProps {
  post: Post;
  onPress?: () => void;
}

export function MyTravelPostCard({ post, onPress }: MyTravelPostCardProps) {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor }]} 
      onPress={onPress}
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
          {/* Ville et pays */}
          <Text style={[styles.location, { color: textColor }]}> 
            {post.city}, {post.country}
          </Text>
          {/* Public/Private status */}
          <Text style={{ fontSize: 12, color: post.isPublic ? '#4caf50' : '#f44336', marginBottom: 4 }}>
            {post.isPublic ? 'public' : 'private'}
          </Text>
          {/* Note avec étoiles jaunes + nombre */}
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
  dateContainer: {
    marginTop: 8,
  },
  dateText: {
    fontSize: 10,
    opacity: 0.5,
  },
});
