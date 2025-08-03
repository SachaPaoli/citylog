import { StarRating } from '@/components/StarRating';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Post, TripItem } from '@/types/Post';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useWishlist } from '../contexts/WishlistContext';

type TabType = 'staying' | 'restaurant' | 'activities' | 'other';

export default function TripDetailScreen() {
  const { userProfile } = useAuth();
  console.log('✨ NOUVELLE PAGE TRIP DETAIL CHARGEE !');
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { getPostById, deletePost } = usePosts();
  // ...existing code...
  // Suppression du post avec confirmation
  const { removeCity } = require('../contexts/VisitedCitiesContext');
  const handleDeletePost = () => {
    if (!post) return;
    Alert.alert(
      'Supprimer ce post',
      'Es-tu sûr de vouloir supprimer ce voyage ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            let postDeleted = false;
            try {
              await deletePost(post.id);
              postDeleted = true;
            } catch (err) {
              Alert.alert('Erreur', "Impossible de supprimer le post.");
              return;
            }
            // Supprimer uniquement le post précis dans visitedCities de l'utilisateur
            try {
              const { removeVisitedCity } = require('../services/UserService');
              await removeVisitedCity(post.city, post.country, 'post', post.id);
            } catch (err) {
              // On ignore l'erreur de suppression de la source 'post', car le post est bien supprimé
            }
            if (postDeleted) {
              Alert.alert('Supprimé', 'Le voyage a été supprimé.');
              setShowMenu(false);
              router.replace('/(tabs)/explore');
            }
          }
        }
      ]
    );
  };
  
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const whiteColor = '#FFFFFF';
  const headerColor = '#181C24'; // Electric dark gray comme le fond général

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('staying');
  const [showMenu, setShowMenu] = useState(false);
  const { addToWishlist, isInWishlist } = useWishlist();
  const [scrollY, setScrollY] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  useEffect(() => {
    console.log('TripDetailScreen - postId recu:', postId);
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    if (!postId) return;
    
    console.log('Chargement du post avec ID:', postId);
    setLoading(true);
    try {
      const fetchedPost = await getPostById(postId);
      console.log('Post recupere:', fetchedPost);
      setPost(fetchedPost);
    } catch (error) {
      console.error('Erreur lors du chargement du post:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentItems = (): TripItem[] => {
    if (!post) return [];
    
    let items: TripItem[] = [];
    switch (activeTab) {
      case 'staying':
        items = post.stayingItems || [];
        break;
      case 'restaurant':
        items = post.restaurantItems || [];
        break;
      case 'activities':
        items = post.activitiesItems || [];
        break;
      case 'other':
        items = post.otherItems || [];
        break;
      default:
        items = [];
    }
    
    console.log(`Items pour l'onglet ${activeTab}:`, items);
    return items;
  };

  const getTabLabel = (tab: TabType): string => {
    switch (tab) {
      case 'staying':
        return 'Staying';
      case 'restaurant':
        return 'Restaurant';
      case 'activities':
        return 'Activities';
      case 'other':
        return 'Other';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: headerColor }]}>
        <View style={[styles.header, { backgroundColor: headerColor }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: whiteColor }]}>← Retour</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setShowMenu(true)}
          >
            <Text style={[styles.menuButtonText, { color: whiteColor }]}>⋯</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.loadingContainer, { backgroundColor }]}>
          <ActivityIndicator size="large" color={whiteColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Chargement du voyage...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Vérifie si le post appartient à l'utilisateur courant (doit être après la déclaration de post)
  const isMyPost = post && userProfile && (post.userId === userProfile.uid);

  if (!post) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: headerColor }]}>
        <View style={[styles.header, { backgroundColor: headerColor }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: whiteColor }]}>← Retour</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setShowMenu(true)}
          >
            <Text style={[styles.menuButtonText, { color: whiteColor }]}>⋯</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.errorContainer, { backgroundColor }]}>
          <Text style={[styles.errorText, { color: textColor }]}>
            Voyage introuvable
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentItems = getCurrentItems();

  const handleAddToWishlist = () => {
    if (post) {
      addToWishlist(post);
      Alert.alert('Ajouté à la wishlist', 'Ce voyage a bien été ajouté à votre wishlist !');
      setShowMenu(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: headerColor }]}> 
      {/* Header avec bouton retour et menu */}
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: whiteColor }]}>← Retour</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setShowMenu(true)}
        >
          <Text style={[styles.menuButtonText, { color: whiteColor }]}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Menu popup */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowMenu(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor }]}> 
          
            <TouchableOpacity 
              style={[styles.menuItem, isInWishlist(post.id) && { opacity: 0.5 }]}
              onPress={isInWishlist(post.id) ? undefined : handleAddToWishlist}
              disabled={isInWishlist(post.id)}
            >
              <Text style={[styles.menuItemText, { color: textColor }]}> 
                {isInWishlist(post.id) ? 'Déjà dans la wishlist' : 'Add to wishlist'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => setShowMenu(false)}>
              <Text style={[styles.menuItemText, { color: textColor }]}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => setShowMenu(false)}>
              <Text style={[styles.menuItemText, { color: textColor }]}>Back</Text>
            </TouchableOpacity>
            {isMyPost && (
              <TouchableOpacity style={[styles.menuItem, { marginTop: 4 }]} onPress={handleDeletePost}>
                <Text style={[styles.menuItemText, { color: '#ff4444', fontWeight: 'bold' }]}>Supprimer</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Scroll global de toute la page */}
      <ScrollView 
        style={[styles.mainScroll, { backgroundColor }]} 
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          setScrollY(offsetY);
        }}
        onContentSizeChange={(contentWidth, contentHeight) => {
          setContentHeight(contentHeight);
        }}
        onLayout={(event) => {
          const height = event.nativeEvent.layout.height;
          setScrollViewHeight(height);
        }}
        scrollEventThrottle={16}
      >
        {/* Informations du voyage */}
        <View style={[styles.postInfo, !post.description && styles.postInfoCompact]}>
          {/* User header centré au-dessus de la photo principale */}
          <View style={styles.userHeader}>
            <View style={styles.userHeaderRow}>
              <Image 
                source={{ uri: post.userPhoto || 'https://images.unsplash.com/photo-1494790108755-2616b5739775?w=100&h=100&fit=crop&crop=face' }}
                style={styles.userProfilePhotoSmall}
                defaultSource={require('@/assets/images/placeholder.png')}
              />
              <Text style={[styles.userHeaderName, { color: textColor }]}>{post.userName}</Text>
            </View>
          </View>
          <Image source={{ uri: post.photo }} style={styles.coverImage} />
          <View style={styles.postDetails}>
            <Text style={[styles.cityName, { color: textColor }]}> 
              {post.city}, {post.country}
            </Text>
            <View style={styles.ratingContainer}>
              <StarRating 
                rating={post.rating} 
                readonly={true} 
                size="medium"
                showRating={true}
                color="#f5c518"
              />
            </View>
            <Text style={[styles.description, { color: textColor }]}> 
              {post.description}
            </Text>
          </View>
        </View>

        {/* Onglets */}
        <View style={styles.tabsContainer}>
          {(['staying', 'restaurant', 'activities', 'other'] as TabType[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab, 
                activeTab === tab && { borderBottomColor: whiteColor, borderBottomWidth: 2 }
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText, 
                { color: activeTab === tab ? whiteColor : textColor }
              ]}>
                {getTabLabel(tab)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contenu de l'onglet */}
        <View style={styles.content}>
          {currentItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: textColor }]}>
                Aucun element dans cette categorie
              </Text>
            </View>
          ) : (
            <View style={styles.tabContent}>
              {/* Photos horizontales */}
              {currentItems.some(item => item.images && item.images.length > 0) && (
                <View style={styles.photosSection}>
                  <Text style={[styles.sectionTitle, { color: textColor }]}>Photos</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.photosContainer}
                    contentContainerStyle={styles.photosContentContainer}
                  >
                    {currentItems.map(item => 
                      item.images?.map(image => (
                        <Image 
                          key={`${item.id}-${image.id}`}
                          source={{ uri: image.uri }} 
                          style={styles.itemPhoto} 
                        />
                      ))
                    )}
                  </ScrollView>
                </View>
              )}

              {/* Liste verticale des items */}
              <View style={styles.itemsList}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  {getTabLabel(activeTab)}
                </Text>
                {currentItems.map(item => (
                  <View key={item.id} style={[styles.itemCard, { borderColor: whiteColor }]}>
                    <View style={styles.itemHeader}>
                      <Text style={[styles.itemName, { color: textColor }]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.itemRating, { color: '#f5c518' }]}>
                        {item.rating}/5
                      </Text>
                    </View>
                    {item.description && (
                      <Text style={[styles.itemDescription, { color: textColor }]}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Espacement en bas */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      {/* Indicateur de scroll personnalisé */}
      {contentHeight > scrollViewHeight && (
        <View style={styles.scrollIndicatorContainer}>
          <View 
            style={[
              styles.scrollIndicator,
              {
                height: Math.max(15, (scrollViewHeight / contentHeight) * (scrollViewHeight * 0.25)),
                top: (scrollY / (contentHeight - scrollViewHeight)) * (scrollViewHeight * 0.25 - Math.max(15, (scrollViewHeight / contentHeight) * (scrollViewHeight * 0.25))),
              }
            ]}
          />
        </View>
      )}
    </SafeAreaView>
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
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    justifyContent: 'center',
    height: 40,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 16,
    textAlign: 'center',
  },
  mainScroll: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  postInfo: {
    padding: 20,
    alignItems: 'center',
  },
  postInfoCompact: {
    paddingBottom: 10,
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
  },
  postDetails: {
    alignItems: 'center',
    width: '100%',
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  userName: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 10,
  },
  userHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  userHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  userProfilePhotoSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#444',
    marginRight: 6,
  },
  userHeaderName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  rating: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
  tabContent: {
    padding: 20,
  },
  photosSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  photosContainer: {
    marginBottom: 10,
  },
  photosContentContainer: {
    paddingRight: 20,
  },
  itemPhoto: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
  },
  itemsList: {
    flex: 1,
  },
  itemCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  itemRating: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemRatingText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  bottomSpacing: {
    height: 30,
  },
  scrollIndicatorContainer: {
    position: 'absolute',
    right: 4,
    top: '50%',
    height: '25%',
    width: 2,
    justifyContent: 'flex-start',
  },
  scrollIndicator: {
    width: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    opacity: 0.8,
  },
});
