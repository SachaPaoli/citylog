import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CachedImage } from '../components/CachedImage';
import { db } from '../config/firebase';
import { useThemeColor } from '../hooks/useThemeColor';

interface CityReview {
  id: string;
  userId: string;
  city: string;
  country: string;
  comment: string;
  createdAt: any;
  userDisplayName: string;
  userPhotoURL?: string;
}

export default function CityReviewsScreen() {
  const router = useRouter();
  const { city, country, countryCode } = useLocalSearchParams();
  
  const [reviews, setReviews] = useState<CityReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const headerColor = '#181C24';
  const whiteColor = '#FFFFFF';

  useEffect(() => {
    fetchCityReviews();
  }, [city, country]);

  const fetchCityReviews = async () => {
    if (!city || !country) return;
    
    try {
      setIsLoading(true);
      
      // Récupère toutes les reviews pour cette ville
      const reviewsQuery = query(collection(db, 'cityReviews'));
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      const cityReviews: CityReview[] = [];
      
      // Pour chaque review, récupère les infos utilisateur
      for (const reviewDoc of reviewsSnapshot.docs) {
        const reviewData = reviewDoc.data();
        
        if (reviewData.city === city && reviewData.country === country) {
          // Récupère la photo de profil de l'utilisateur
          let userPhotoURL = undefined;
          if (reviewData.userId) {
            try {
              const userDoc = await getDoc(doc(db, 'users', reviewData.userId));
              if (userDoc.exists()) {
                userPhotoURL = userDoc.data().photoURL;
              }
            } catch (error) {
              console.error('[CityReviews] Error fetching user photo:', error);
            }
          }
          
          cityReviews.push({
            id: reviewDoc.id,
            userId: reviewData.userId,
            city: reviewData.city,
            country: reviewData.country,
            comment: reviewData.comment,
            createdAt: reviewData.createdAt,
            userDisplayName: reviewData.userDisplayName || 'Anonymous',
            userPhotoURL
          });
        }
      }
      
      // Trie par date (plus récent en premier)
      cityReviews.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setReviews(cityReviews);
      
    } catch (error) {
      console.error('[CityReviews] Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
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
            Reviews of {city}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2051A4" />
          </View>
        ) : reviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={textColor} style={{ opacity: 0.3 }} />
            <Text style={[styles.emptyTitle, { color: textColor }]}>No reviews yet</Text>
            <Text style={[styles.emptySubtitle, { color: textColor }]}>
              Be the first to share your experience in {city}!
            </Text>
          </View>
        ) : (
          <ScrollView 
            style={[styles.content, { backgroundColor }]}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.countText, { color: textColor }]}>
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} found
            </Text>
            
            {reviews.map((review) => (
              <View key={review.id} style={[styles.reviewCard, { borderColor: textColor + '20' }]}>
                <View style={styles.reviewHeader}>
                  <CachedImage
                    uri={review.userPhotoURL || ''}
                    style={styles.userPhoto}
                  />
                  <View style={styles.reviewHeaderText}>
                    <Text style={[styles.userName, { color: textColor }]}>
                      {review.userDisplayName}
                    </Text>
                    <Text style={[styles.reviewDate, { color: textColor }]}>
                      {formatDate(review.createdAt)}
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.reviewText, { color: textColor }]}>
                  {review.comment}
                </Text>
              </View>
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
  reviewCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    marginRight: 12,
  },
  reviewHeaderText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  reviewText: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },
});
