import { ProfileImage } from '@/components/ProfileImage';
import { StarRating } from '@/components/StarRating';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Post, TripItem } from '@/types/Post';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import { useWishlist } from '../contexts/WishlistContext';

type TabType = 'staying' | 'restaurant' | 'activities' | 'other';

export default function TripDetailScreen() {
  // Animated value for scroll position
  const scrollYAnimated = React.useRef(new Animated.Value(0)).current;
  const { userProfile } = useAuth();
  // Fullscreen image modal state
  const [fullscreenImageVisible, setFullscreenImageVisible] = useState(false);
  const [fullscreenImageUri, setFullscreenImageUri] = useState<string | null>(null);
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
  const [activeTab, setActiveTab] = useState<TabType>('staying');

  // Détermine dynamiquement les onglets à afficher selon le contenu du post
  const availableTabs: TabType[] = React.useMemo(() => {
    if (!post) return [];
    const tabs: TabType[] = [];
    if (post.stayingItems && post.stayingItems.length > 0) tabs.push('staying');
    if (post.restaurantItems && post.restaurantItems.length > 0) tabs.push('restaurant');
    if (post.activitiesItems && post.activitiesItems.length > 0) tabs.push('activities');
    if (post.otherItems && post.otherItems.length > 0) tabs.push('other');
    return tabs;
  }, [post]);
  const [showMenu, setShowMenu] = useState(false);
  const { addToWishlist, isInWishlist } = useWishlist();
  const [scrollY, setScrollY] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [isDescriptionMultiline, setIsDescriptionMultiline] = useState(false);
  const [isTextTruncated, setIsTextTruncated] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollIndicatorOpacity = React.useRef(new Animated.Value(0)).current;

  // Récupérer la photo de profil de l'utilisateur du post si elle n'est pas présente
  // Maintenant les posts arrivent déjà enrichis avec les photos, donc pas besoin de hook séparé

  useEffect(() => {
    console.log('TripDetailScreen - postId recu:', postId);
    if (postId) {
      // Recherche instantanée dans les posts enrichis
      const cachedPost = posts.find(p => p.id === postId);
      if (cachedPost) {
        console.log('✅ Post trouvé instantanément:', cachedPost.city, 'Photo:', cachedPost.userPhoto ? 'OUI' : 'NON');
        setPost(cachedPost);
        // Initialiser l'état de la description
        if (cachedPost.description && cachedPost.description.length > 40) {
          setIsDescriptionMultiline(true);
        }
      } else {
        // Si pas en cache, charger depuis Firebase
        console.log('🔄 Post non trouvé en cache, chargement...');
        loadPost();
      }
    }
  }, [postId, posts]);

  const loadPost = async () => {
    if (!postId) return;
    
    console.log('🔥 Chargement du post avec ID:', postId);
    try {
      const fetchedPost = await getPostById(postId);
      console.log('📦 Post récupéré:', fetchedPost?.city, 'Photo:', fetchedPost?.userPhoto ? 'OUI' : 'NON');
      if (fetchedPost) {
        setPost(fetchedPost);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du post:', error);
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

  // Vérifie si le post appartient à l'utilisateur courant
  const isMyPost = post && userProfile && (post.userId === userProfile.uid);

  if (!post) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: headerColor }]}> 
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: headerColor }}>
          <Ionicons name="reload" size={48} color="#888" />
        </View>
      </SafeAreaView>
    );
  }

  const currentItems = getCurrentItems();

  // Photo de profil : utiliser celle enrichie du post directement
  const userPhoto = post?.userPhoto || '';

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

  // Fonction pour vérifier si la description fait plus de 40 caractères
  const checkDescriptionLines = (event: any) => {
    if (post?.description) {
      const shouldShowChevron = post.description.length > 40;
      console.log('Description length:', post.description.length, 'Should show chevron:', shouldShowChevron);
      setIsDescriptionMultiline(shouldShowChevron);
    }
  };

  // Fonction pour tronquer la description à 40 caractères avec "..."
  const getDisplayedDescription = () => {
    if (!post?.description || post.description.trim() === '' || post.description.toLowerCase().startsWith('voyage à')) {
      return `Travelled to ${post?.city}, ${post?.country}`;
    }
    if (post.description.length <= 40) return post.description;
    // Trouver le dernier espace avant la limite pour ne pas couper un mot
    const truncated = post.description.substring(0, 40);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    if (lastSpaceIndex > 0) {
      return truncated.substring(0, lastSpaceIndex) + '...';
    }
    return truncated + '...';
  };

  // Fonction pour naviguer vers la page de description complète
  const handleDescriptionPress = () => {
    console.log('Description pressed, multiline:', isDescriptionMultiline);
    if (post?.description) {
      router.push(`/description-detail?description=${encodeURIComponent(post.description)}`);
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
            <ProfileImage 
              uri={userPhoto}
              size={32}
            />
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

        {/* Scroll global de toute la page, inclut la photo en haut */}
        <ScrollView 
          style={[styles.mainScroll, { backgroundColor }]} 
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => {
            setShowScrollIndicator(true);
            Animated.timing(scrollIndicatorOpacity, {
              toValue: 0.8,
              duration: 150,
              useNativeDriver: true,
            }).start();
          }}
          onScrollEndDrag={() => {
            setTimeout(() => {
              setShowScrollIndicator(false);
              Animated.timing(scrollIndicatorOpacity, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
              }).start();
            }, 600);
          }}
          onMomentumScrollBegin={() => {
            setShowScrollIndicator(true);
            Animated.timing(scrollIndicatorOpacity, {
              toValue: 0.8,
              duration: 150,
              useNativeDriver: true,
            }).start();
          }}
          onMomentumScrollEnd={() => {
            setTimeout(() => {
              setShowScrollIndicator(false);
              Animated.timing(scrollIndicatorOpacity, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
              }).start();
            }, 600);
          }}
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
          {/* Nouvelle image de la ville avec le style city-detail (full width, gradient fade) */}
          <View style={{ position: 'relative', width: '100%', marginTop: 0, marginBottom: 20 }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                setFullscreenImageUri(post.photo);
                setFullscreenImageVisible(true);
              }}
            >
              <Image
                source={{ uri: post.photo }}
                style={{ width: '100%', height: 260, borderRadius: 0, resizeMode: 'cover' }}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
              />
            </TouchableOpacity>
            {/* Gradient fade at the bottom, like city-detail */}
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 55 }} pointerEvents="none">
              <Image
                source={require('../assets/images/partial-react-logo.png')}
                style={{ display: 'none' }}
              />
              <LinearGradient
                colors={["rgba(0,0,0,0)", "#181C24"]}
                style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 55 }}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              />
            </View>
          </View>

          {/* Fullscreen Image Modal */}
          <Modal
            visible={fullscreenImageVisible && !!fullscreenImageUri}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setFullscreenImageVisible(false)}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
              {fullscreenImageUri && (
                <View style={{ width: '90%', alignItems: 'center', marginTop: 80 }}>
                  <View style={{ width: '100%', height: '70%', borderRadius: 16, overflow: 'hidden', position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
                    <Image
                      source={{ uri: fullscreenImageUri }}
                      style={{ width: '100%', height: '100%', borderRadius: 16, resizeMode: 'contain' }}
                      contentFit="contain"
                      cachePolicy="memory-disk"
                      transition={200}
                    />
                  </View>
                  {/* Back button below image */}
                  <TouchableOpacity
                    style={{ marginTop: 24, backgroundColor: 'transparent', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 24 }}
                    onPress={() => setFullscreenImageVisible(false)}
                  >
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Back</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Modal>

          {/* Informations du voyage */}
          <View style={[styles.postInfo, !post.description && styles.postInfoCompact]}>
            <View style={styles.postDetails}>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <Text style={[styles.cityName, { color: textColor }]}> 
                  {post.city},
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '400', color: '#888', marginLeft: 4, alignSelf: 'center' }}>
                  {post.country}
                </Text>
              </View>
              <View style={styles.ratingContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <StarRating 
                    rating={post.rating} 
                    readonly={true} 
                    size="medium" // étoiles un peu plus grandes
                    showRating={false}
                    color="#f5c518"
                  />
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#f5c518', marginLeft: 6 }}>
                    {post.rating}
                  </Text>
                </View>
              </View>
              {post.description && (
                <TouchableOpacity 
                  style={styles.descriptionContainer}
                  onPress={handleDescriptionPress}
                  activeOpacity={0.7}
                >
                  <Text 
                    style={[styles.description, { color: textColor, flex: 1 }]}
                    numberOfLines={1}
                    onTextLayout={checkDescriptionLines}
                  > 
                    {getDisplayedDescription()}
                  </Text>
                  {isDescriptionMultiline && (
                    <Ionicons name="chevron-forward" size={20} color={textColor} style={styles.descriptionIcon} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Onglets */}
          {availableTabs.length > 0 && (
            <View style={styles.tabsContainer}>
              {availableTabs.map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={styles.tab}
                  onPress={() => setActiveTab(tab)}
                >
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[styles.tabText, { color: activeTab === tab ? whiteColor : textColor }]}> 
                      {getTabLabel(tab)}
                    </Text>
                    {activeTab === tab && (
                      <View style={{
                        marginTop: 4,
                        height: 2,
                        width: 96, // Further increased pixel width for underline, always visible
                        backgroundColor: whiteColor,
                        borderRadius: 1,
                      }} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Contenu de l'onglet */}
          {availableTabs.length > 0 && (
            <View style={styles.content}>
              {currentItems.length > 0 && (
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
                              <TouchableOpacity
                                key={`${item.id}-${image.id}`}
                                activeOpacity={0.9}
                                onPress={() => {
                                  setFullscreenImageUri(image.uri);
                                  setFullscreenImageVisible(true);
                                }}
                              >
                                <Image 
                                  source={{ uri: image.uri }} 
                                  style={styles.itemPhoto}
                                  contentFit="cover"
                                  cachePolicy="memory-disk"
                                  transition={200}
                                />
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      )}

                      {/* Carte avec infos de l'item */}
                      <View style={[styles.itemCard, { borderColor: whiteColor }]}>
                        <View style={styles.itemHeader}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.itemName, { color: textColor }]}>
                              {item.name}
                            </Text>
                            <Text style={[styles.itemRating, { color: '#f5c518', marginLeft: 4, fontWeight: 'bold' }]}>
                              {item.rating}
                            </Text>
                            <Ionicons name="star" size={20} color="#f5c518" style={{ marginLeft: 0 }} />
                          </View>
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
          )}

          {/* Indicateur de scroll personnalisé */}
          {contentHeight > scrollViewHeight && (
            <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 4, justifyContent: 'center', pointerEvents: 'none' }}>
              <Animated.View
                style={{
                  position: 'absolute',
                  right: 1,
                  width: 2,
                  borderRadius: 1,
                  backgroundColor: '#fff',
                  opacity: scrollIndicatorOpacity,
                  height: Math.max(12, (scrollViewHeight / contentHeight) * (scrollViewHeight * 0.15)),
                  top:
                    (scrollViewHeight / 2) +
                    (scrollY / (contentHeight - scrollViewHeight)) * ((scrollViewHeight / 2) - Math.max(12, (scrollViewHeight / contentHeight) * (scrollViewHeight * 0.15))),
                }}
              />
            </View>
          )}
        </ScrollView>
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
    borderBottomColor: 'transparent',
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
    width: 50,
    height: 40,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 5,
    paddingTop: -5,
  },
  menuButtonText: {
    fontSize: 40,
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
  fontSize: 28,
  fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  descriptionIcon: {
    marginLeft: 8,
    marginBottom: 2,
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
