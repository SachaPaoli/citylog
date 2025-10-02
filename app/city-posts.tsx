import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TravelPostCard } from '../components/TravelPostCard';
import { db } from '../config/firebase';
import { useThemeColor } from '../hooks/useThemeColor';

export default function CityPostsScreen() {
  const router = useRouter();
  const { city, country, countryCode } = useLocalSearchParams();
  
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const headerColor = '#181C24';
  const whiteColor = '#FFFFFF';

  useEffect(() => {
    fetchCityPosts();
  }, [city, country]);

  const fetchCityPosts = async () => {
    if (!city || !country) return;
    
    try {
      setIsLoading(true);
      
      // Récupère tous les posts
      const postsQuery = query(collection(db, 'posts'));
      const postsSnapshot = await getDocs(postsQuery);
      
      const cityPosts: any[] = [];
      
      postsSnapshot.forEach((postDoc) => {
        const postData = postDoc.data();
        
        // Vérifie si le post contient cette ville
        if (postData.city === city && postData.country === country) {
          cityPosts.push({
            id: postDoc.id,
            ...postData
          });
        } else if (postData.cities && Array.isArray(postData.cities)) {
          const hasCity = postData.cities.some((c: any) => 
            c.name === city && c.country === country
          );
          if (hasCity) {
            cityPosts.push({
              id: postDoc.id,
              ...postData
            });
          }
        }
      });
      
      // Trie par date (plus récent en premier)
      cityPosts.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setPosts(cityPosts);
      
    } catch (error) {
      console.error('[CityPosts] Error fetching posts:', error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: headerColor }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: headerColor }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={whiteColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: whiteColor }]}>
            Posts in {city}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2051A4" />
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={64} color={textColor} style={{ opacity: 0.3 }} />
            <Text style={[styles.emptyTitle, { color: textColor }]}>No posts yet</Text>
            <Text style={[styles.emptySubtitle, { color: textColor }]}>
              Be the first to share a post from {city}!
            </Text>
          </View>
        ) : (
          <ScrollView 
            style={[styles.content, { backgroundColor }]}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.countText, { color: textColor }]}>
              {posts.length} {posts.length === 1 ? 'post' : 'posts'} found
            </Text>
            
            {posts.map((post) => (
              <TravelPostCard
                key={post.id}
                post={post}
                onPress={() => router.push({
                  pathname: '/trip-detail',
                  params: { postId: post.id }
                })}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingTop: 50,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
  countText: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 16,
  },
});
