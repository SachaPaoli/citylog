import { ProfileImage } from '@/components/ProfileImage';
import { StarRating } from '@/components/StarRating';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useUserPhotoCache } from '@/hooks/useUserPhotoCache';
import { Post, TripItem } from '@/types/Post';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  const { getPostById, deletePost, posts } = usePosts();
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
              const { useVisitedCities } = require('../contexts/VisitedCitiesContext');
              const { removeCitySource } = useVisitedCities();
              await removeCitySource(post.city, post.country, 'post', post.id);
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

  // Récupérer la photo de profil de l'utilisateur du post si elle n'est pas présente
  const { userPhoto: fetchedUserPhoto, loading: photoLoading } = useUserPhotoCache(post?.userId || '');

  useEffect(() => {
    console.log('TripDetailScreen - postId recu:', postId);
    if (postId) {
      // D'abord chercher dans les posts déjà chargés pour un affichage instantané
      const cachedPost = posts.find(p => p.id === postId);
      if (cachedPost) {
        console.log('Post trouvé en cache:', cachedPost);
        setPost(cachedPost);
        setLoading(false);
      } else {
        // Si pas en cache, charger depuis Firebase
        loadPost();
      }
    }
  }, [postId, posts]);

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
            <Ionicons name="arrow-back" size={24} color={whiteColor} />
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
            <Ionicons name="arrow-back" size={24} color={whiteColor} />
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

  // Utiliser la photo de profil actuelle de l'utilisateur si c'est son post
  const userPhoto = (userProfile && post && post.userId === userProfile.uid && userProfile.photoURL) 
    ? userProfile.photoURL 
    : post?.userPhoto || fetchedUserPhoto;

  // Fonction pour déterminer si on doit utiliser OptimizedImage ou Image standard
  const isCloudinaryUrl = (url: string) => {
    return url && (url.includes('cloudinary.com') || url.includes('res.cloudinary.com'));
  };

  const handleAddToWishlist = () => {
    if (post) {
      addToWishlist(post);
      Alert.alert('Ajouté à la wishlist', 'Ce voyage a bien été ajouté à votre wishlist !');
      setShowMenu(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: headerColor }]}> 
      {/* Header avec bouton retour, profil utilisateur et menu */}
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={whiteColor} />
        </TouchableOpacity>
        
        {/* Profil utilisateur au centre du header */}
        <TouchableOpacity 
          style={styles.headerUserProfile}
          onPress={() => {
            if (post.userId && post.userId !== userProfile?.uid) {
              router.push(`/user-profile?userId=${post.userId}`);
            }
          }}
          activeOpacity={0.6}
        >
          {/* Attendre que la photo soit chargée avant d'afficher ProfileImage */}
          {photoLoading ? (
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'transparent' }} />
          ) : (
            <ProfileImage 
              uri={userPhoto}
              size={32}
            />
          )}
          <Text style={[styles.headerUserName, { color: whiteColor }]}>{post.userName}</Text>
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
          <Image 
            source={{ uri: post.photo }} 
            style={styles.coverImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
          />
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
              {/* Chaque item dans sa propre carte */}
              {currentItems.map((item, index) => (
                <View key={item.id}>
                  {/* Photos de l'item en haut */}
                  {item.images && item.images.length > 0 && (
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false} 
                      style={styles.itemPhotosScroll}
                      contentContainerStyle={styles.itemPhotosContainer}
                    >
                      {item.images.map((image, imgIndex) => {
                        return (
                          <Image 
                            key={`${item.id}-${image.id}`}
                            source={{ uri: image.uri }} 
                            style={styles.itemPhoto}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                            transition={200}
                          />
                        );
                      })}
                    </ScrollView>
                  )}

                  {/* Carte avec infos de l'item */}
                  <View style={[styles.itemCard, { borderColor: whiteColor }]}>
                    <View style={styles.itemHeader}>
                      <Text style={[styles.itemName, { color: textColor }]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.itemRating, { color: '#f5c518' }]}>
                        {item.rating}/5 ⭐
                      </Text>
                    </View>
                    {item.description && (
                      <Text style={[styles.itemDescription, { color: textColor }]}>
                        {item.description}
                      </Text>
                    )}
                  </View>

                  {/* Ligne de séparation fine (sauf pour le dernier item) */}
                  {index < currentItems.length - 1 && (
                    <View style={{ height: 1, backgroundColor: '#444', width: '100%', opacity: 0.5, marginTop: 12, marginBottom: 20 }} />
                  )}
                </View>
              ))}
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
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerUserProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  headerUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    maxWidth: 120,
  },
  backButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
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
    height: 250,
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
    width: 140,
    height: 105,
    borderRadius: 10,
    marginRight: 14,
    backgroundColor: '#2a2a2a',
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
  itemDetailCard: {
    padding: 16,
    marginVertical: 8,
  },
  itemDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemDetailName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  itemDetailRating: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPhotosScroll: {
    marginBottom: 12,
  },
  itemPhotosContainer: {
    paddingRight: 12,
    alignItems: 'center',
  },
  itemDetailDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    marginTop: 8,
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
