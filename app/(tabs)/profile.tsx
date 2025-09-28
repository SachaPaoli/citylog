import { useAuth } from '@/contexts/AuthContext';
import { useFollowStats } from '@/hooks/useFollowStats';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useUserTravels } from '@/hooks/useUserTravels';
import { useVisitedCountries } from '@/hooks/useVisitedCountries';
import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFollowersList, getFollowingList } from '@/services/FollowService';
import { UserSearchResult } from '@/services/UserSearchService';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TravelPostCard } from '../../components/TravelPostCard';
import { db } from '../../config/firebase';
import { useVisitedCities } from '../../contexts/VisitedCitiesContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { usePosts } from '../../hooks/usePosts';
import { addFavorite as addFavoriteFirestore, getUserFavorites, removeFavorite } from '../../services/UserService';

// Utilitaire pour obtenir le code pays ISO2 en minuscule à partir du nom du pays
function getCountryCode(countryName: string): string {
  const map: Record<string, string> = {
    France: 'fr',
    Japan: 'jp',
    USA: 'us',
    Brazil: 'br',
    Australia: 'au',
    // Ajoute d'autres pays si besoin
  };
  return map[countryName] || '';
}

export default function ProfileScreen() {

  const { cities: visitedCities } = useVisitedCities();
  const { wishlist } = useWishlist();
  const textColor = useThemeColor({}, 'text');
  const textActiveColor = useThemeColor({}, 'textActive');
  const ratingColor = useThemeColor({}, 'rating');
  const backgroundColor = useThemeColor({}, 'background');
  const buttonBackgroundColor = useThemeColor({}, 'buttonBackground');
  const borderColor = useThemeColor({}, 'borderColor');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'wishlist'>('profile');
  type FavoriteType = { city: string; country: string; flag: string; countryCode?: string } | null;
  const [favorites, setFavorites] = useState<FavoriteType[]>([null, null, null]);

  // États pour la modal followers
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followers, setFollowers] = useState<UserSearchResult[]>([]);
  const [filteredFollowers, setFilteredFollowers] = useState<UserSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [followersLoading, setFollowersLoading] = useState(false);

  // États pour la modal following
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [following, setFollowing] = useState<UserSearchResult[]>([]);
  const [filteredFollowing, setFilteredFollowing] = useState<UserSearchResult[]>([]);
  const [followingSearchQuery, setFollowingSearchQuery] = useState('');
  const [followingLoading, setFollowingLoading] = useState(false);

  // Animations pour le sliding - même système que index
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const tabIndicatorAnim = React.useRef(new Animated.Value(0)).current;
  
  // Animation pour la modal followers
  const followersModalAnim = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;
  
  // Animation pour la modal following
  const followingModalAnim = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;

  const switchTab = (tab: 'profile' | 'wishlist') => {
    if (tab === activeTab) return;
    
    const screenWidth = Dimensions.get('window').width;
    const targetSlideValue = tab === 'profile' ? 0 : -screenWidth;
    const targetIndicatorValue = tab === 'profile' ? 0 : screenWidth / 2;
    
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: targetSlideValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(tabIndicatorAnim, {
        toValue: targetIndicatorValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    setActiveTab(tab);
  };

  // Fonction pour afficher la modal followers
  const showFollowers = async () => {
    if (!authUserProfile?.uid) return;
    
    setShowFollowersModal(true);
    setFollowersLoading(true);
    
    // Animation d'entrée fluide depuis le bas de l'écran
    Animated.spring(followersModalAnim, {
      toValue: 20, // Position finale plus haut (20px depuis le haut)
      damping: 20,
      stiffness: 90,
      useNativeDriver: true,
    }).start();
    
    try {
      const followersList = await getFollowersList(authUserProfile.uid);
      
      // Récupérer les détails de chaque follower
      const followersDetails = await Promise.all(
        followersList.map(async (followerId: string) => {
          try {
            const userDoc = await getDoc(doc(db, 'users', followerId));
            if (userDoc.exists()) {
              const data = userDoc.data();
              return {
                uid: userDoc.id,
                displayName: data.displayName || 'Utilisateur',
                email: data.email,
                photoURL: data.photoURL,
                profileImage: data.profileImage,
                followers: data.followers ? data.followers.length : 0,
                following: data.following ? data.following.length : 0
              } as UserSearchResult;
            }
            return null;
          } catch (error) {
            console.error(`Erreur lors de la récupération du follower ${followerId}:`, error);
            return null;
          }
        })
      );
      
      const validFollowers = followersDetails.filter((f: any) => f !== null) as UserSearchResult[];
      setFollowers(validFollowers);
      setFilteredFollowers(validFollowers);
    } catch (error) {
      console.error('Erreur lors du chargement des followers:', error);
    } finally {
      setFollowersLoading(false);
    }
  };

  // Fonction pour fermer la modal followers
  const hideFollowers = () => {
    Animated.spring(followersModalAnim, {
      toValue: Dimensions.get('window').height,
      damping: 20,
      stiffness: 90,
      useNativeDriver: true,
    }).start(() => {
      setShowFollowersModal(false);
      setSearchQuery('');
    });
  };

  // Fonction pour afficher la modal following
  const showFollowing = async () => {
    if (!authUserProfile?.uid) return;
    
    setShowFollowingModal(true);
    setFollowingLoading(true);
    
    // Animation d'entrée fluide depuis le bas de l'écran
    Animated.spring(followingModalAnim, {
      toValue: 20, // Position finale plus haut (20px depuis le haut)
      damping: 20,
      stiffness: 90,
      useNativeDriver: true,
    }).start();
    
    try {
      const followingList = await getFollowingList(authUserProfile.uid);
      
      // Récupérer les détails de chaque personne suivie
      const followingDetails = await Promise.all(
        followingList.map(async (followingId: string) => {
          try {
            const userDoc = await getDoc(doc(db, 'users', followingId));
            if (userDoc.exists()) {
              const data = userDoc.data();
              return {
                uid: userDoc.id,
                displayName: data.displayName || 'Utilisateur',
                email: data.email,
                photoURL: data.photoURL,
                profileImage: data.profileImage,
                followers: data.followers ? data.followers.length : 0,
                following: data.following ? data.following.length : 0
              } as UserSearchResult;
            }
            return null;
          } catch (error) {
            console.error(`Erreur lors de la récupération du following ${followingId}:`, error);
            return null;
          }
        })
      );
      
      const validFollowing = followingDetails.filter((f: any) => f !== null) as UserSearchResult[];
      setFollowing(validFollowing);
      setFilteredFollowing(validFollowing);
    } catch (error) {
      console.error('Erreur lors du chargement des following:', error);
    } finally {
      setFollowingLoading(false);
    }
  };

  // Fonction pour fermer la modal following
  const hideFollowing = () => {
    Animated.spring(followingModalAnim, {
      toValue: Dimensions.get('window').height,
      damping: 20,
      stiffness: 90,
      useNativeDriver: true,
    }).start(() => {
      setShowFollowingModal(false);
      setFollowingSearchQuery('');
    });
  };

  // Filtrer les followers selon la recherche
  React.useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFollowers(followers);
    } else {
      const filtered = followers.filter(follower =>
        follower.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (follower.email && follower.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredFollowers(filtered);
    }
  }, [searchQuery, followers]);

  // Filtrer les following selon la recherche
  React.useEffect(() => {
    if (followingSearchQuery.trim() === '') {
      setFilteredFollowing(following);
    } else {
      const filtered = following.filter(followingUser =>
        followingUser.displayName.toLowerCase().includes(followingSearchQuery.toLowerCase()) ||
        (followingUser.email && followingUser.email.toLowerCase().includes(followingSearchQuery.toLowerCase()))
      );
      setFilteredFollowing(filtered);
    }
  }, [followingSearchQuery, following]);

  // Charge les favoris depuis Firestore à chaque focus
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          const arr = await getUserFavorites();
          setFavorites(arr);
        } catch (e) { setFavorites([null, null, null]); }
      })();
    }, [])
  );
  
  // Force a re-render when the screen is focused (to avoid stale state)
  useFocusEffect(
    React.useCallback(() => {
      setFavorites(favs => [...favs]);
    }, [])
  );
  const { logout, userProfile: authUserProfile } = useAuth();
  const { travelData, loading: travelLoading } = useUserTravels();
  const { visitedCountries } = useVisitedCountries();
  const { stats: followStats, loading: followStatsLoading } = useFollowStats(authUserProfile?.uid);

  // Fetch all posts, then filter by userId (after authUserProfile is defined)
  const { posts, loading: postsLoading } = usePosts();
  const userPosts = React.useMemo(() => {
    if (!authUserProfile?.uid || !posts) return [];
    return posts.filter((p: any) => p.userId === authUserProfile.uid);
  }, [posts, authUserProfile]);

  // Combine les données du contexte auth avec les vraies données de voyage
  const displayProfile = {
    name: authUserProfile?.displayName || 'Utilisateur',
    photo: authUserProfile?.photoURL || authUserProfile?.profileImage || '', // Pas de photo par défaut
    followers: followStats.followersCount,
    following: followStats.followingCount,
    visitedCountries: travelData.visitedCountries,
    totalCities: travelData.totalCities
  };

  // Navigation vers la page de recherche de ville (même style que Explore)
  const handleAddFavorite = (index: number) => {
    router.push({ pathname: '../search-city', params: { favoriteIndex: index } });
  };

  // Récupère la ville sélectionnée via les params de navigation
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const [paramReload, setParamReload] = useState(0);

  // Incrémente le compteur à chaque focus/navigation
  useFocusEffect(
    React.useCallback(() => {
      setParamReload(r => r + 1);
    }, [])
  );

  React.useEffect(() => {
    if (
      params.favoriteIndex !== undefined &&
      params.city && params.country
    ) {
      const favoriteIndex = Number(params.favoriteIndex);
      (async () => {
        // Ajoute le favori dans Firestore avec tous les champs
        await addFavoriteFirestore(
          String(params.city),
          String(params.country),
          params.flag ? String(params.flag) : '',
          params.countryCode ? String(params.countryCode) : undefined,
          favoriteIndex
        );
        // Recharge les favoris depuis Firestore
        const arr = await getUserFavorites();
        setFavorites(arr);
        router.replace('../profile');
        console.log('PROFILE PARAMS EFFECT RUN', params);
      })();
    }
  }, [paramReload, params]);

  // Fonction pour gérer le clic sur un pays
  const handleCountryPress = (country: string) => {
    setSelectedCountry(country);
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const screenWidth = Dimensions.get('window').width;

  // Add state for managing the popup visibility and selected favorite
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState<number | null>(null);

  // Function to handle showing the popup
  const showFavoritePopup = (index: number) => {
    setSelectedFavorite(index);
    setPopupVisible(true);
  };

  // Function to handle deleting a favorite
  const handleDeleteFavorite = async () => {
    if (selectedFavorite === null || !favorites[selectedFavorite]) return;
    try {
      await removeFavorite(favorites[selectedFavorite].city, favorites[selectedFavorite].country);
      const updatedFavorites = await getUserFavorites();
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Error deleting favorite:', error);
    } finally {
      setPopupVisible(false);
    }
  };

  // Function to handle updating a favorite
  const handleUpdateFavorite = () => {
    if (selectedFavorite === null) return;
    router.push({ pathname: '../search-city', params: { favoriteIndex: selectedFavorite } });
    setPopupVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#181C24' }]}> 
      {/* Header Explore-like avec nom d'utilisateur et boutons, fond foncé partout */}
      <View style={{ backgroundColor: '#181C24', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Bouton réglages (settings) */}
          <TouchableOpacity onPress={() => router.push('/settings')} style={{ padding: 8 }}>
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </TouchableOpacity>
          {/* Nom d'utilisateur centré */}
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 22, textAlign: 'center', flex: 1 }} numberOfLines={1}>{displayProfile.name}</Text>
          {/* Bouton edit (crayon) */}
          <TouchableOpacity onPress={() => router.push('/edit-profile')} style={{ padding: 8 }}>
            <Ionicons name="pencil-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Onglets Profile / Wishlist - même style que index */}
      <View style={{ backgroundColor: '#181C24', paddingTop: 0, paddingBottom: 4, marginBottom: 10 }}>
        <View style={[styles.tabsContainer, { backgroundColor: '#181C24', paddingTop: 0, paddingBottom: 0, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' }]}> 
          <View style={{ paddingHorizontal: 0, flexDirection: 'row', position: 'relative' }}>
            <TouchableOpacity 
              style={[styles.tab]} 
              onPress={() => switchTab('profile')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabText, 
                { color: activeTab === 'profile' ? '#FFFFFF' : '#888' }
              ]}>
                Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab]} 
              onPress={() => switchTab('wishlist')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'wishlist' ? '#FFFFFF' : '#888' }
              ]}>
                Wishlist
              </Text>
            </TouchableOpacity>
            
            {/* Barre blanche de sélection animée */}
            <Animated.View 
              style={[
                styles.tabIndicator,
                { transform: [{ translateX: tabIndicatorAnim }] }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Contenu avec sliding animation - même structure que index */}
      <Animated.View 
        style={[
          styles.slidingContent,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        {/* Tab Profile */}
        <ScrollView 
          style={[styles.tabContent, { backgroundColor: '#181C24' }]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
              {/* Header du profil avec followers/following autour de la photo */}
              <View style={styles.profileHeader}>
            <View style={styles.profileRow}>
              <TouchableOpacity 
                style={styles.profileStatCol}
                onPress={showFollowers}
                activeOpacity={0.7}
              >
                <Text style={[styles.profileStatNumber, { color: textColor }]}>{displayProfile.followers}</Text>
                <Text style={[styles.profileStatLabel, { color: textColor }]}>Followers</Text>
              </TouchableOpacity>
              <Image source={{ uri: displayProfile.photo }} style={styles.profilePhoto} />
              <TouchableOpacity 
                style={styles.profileStatCol}
                onPress={showFollowing}
                activeOpacity={0.7}
              >
                <Text style={[styles.profileStatNumber, { color: textColor }]}>{displayProfile.following}</Text>
                <Text style={[styles.profileStatLabel, { color: textColor }]}>Following</Text>
              </TouchableOpacity>
            </View>
            {/* Ligne de séparation fine grise au-dessus des Favorites */}
            <View style={{ height: 1, backgroundColor: '#444', width: '100%', opacity: 0.5, marginVertical: 12 }} />
            {/* Section Favorites */}
            <Text style={[styles.favoritesTitle, { color: textColor }]}>Favorites</Text>
            <View style={styles.favoritesRow}>
              {favorites.map((fav, idx) => (
                <View key={fav?.city && fav?.country ? `${fav.city}-${fav.country}-${idx}` : `favorite-${idx}`} style={{ alignItems: 'center', flex: 1 }}>
                  <TouchableOpacity
                    style={[
                      styles.favoriteBox,
                      !fav && { marginTop: 10 }, // Add margin only if no city is chosen
                      fav && { borderWidth: 0, borderColor: 'transparent' }
                    ]}
                    onPress={() => showFavoritePopup(idx)}
                    activeOpacity={0.7}
                  >
                    {!fav ? (
                      <Text style={styles.plus}>+</Text>
                    ) : (
                      (fav.countryCode && fav.countryCode.length === 2)
                        ? <Image
                            source={{ uri: `https://flagcdn.com/w320/${fav.countryCode}.png` }}
                            style={styles.favoriteFlagImg}
                            resizeMode="cover"
                          />
                        : getCountryCode(fav.country)
                          ? <Image
                              source={{ uri: `https://flagcdn.com/w320/${getCountryCode(fav.country)}.png` }}
                              style={styles.favoriteFlagImg}
                              resizeMode="cover"
                            />
                          : fav.flag
                            ? <Text style={styles.flag}>{fav.flag}</Text>
                            : <Text style={styles.flag}>🏙️</Text>
                    )}
                  </TouchableOpacity>
                  {fav && (
                    <Text style={[styles.favoriteCity, { color: textColor }]}>{fav.city || 'Unknown'}</Text>
                  )}
                </View>
              ))}
            </View>
            {/* Ligne de séparation fine grise en dessous des Favorites */}
            <View style={{ height: 1, backgroundColor: '#444', width: '100%', opacity: 0.5, marginVertical: 12 }} />

            {/* Titre Diary au-dessus des 4 boutons */}
            <Text style={[styles.favoritesTitle, { color: textColor, marginBottom: 18 }]}>Diary</Text>

            {/* 4 boutons, un par ligne, avec icône chevron à droite */}
            <View style={{ width: '100%' }}>
              <TouchableOpacity style={styles.profileButtonRow} onPress={() => router.push('/my-posts')}>
                <View style={styles.profileButtonLeft}>
                  <Text style={styles.profileButtonText}>Posts</Text>
                </View>
                <View style={styles.profileButtonRight}>
                  <Text style={styles.profileButtonCount}>{userPosts.length}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#bbb" style={styles.profileButtonIcon} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileButtonRow} onPress={() => router.push('/trips')}>
                <View style={styles.profileButtonLeft}>
                  <Text style={styles.profileButtonText}>Trips</Text>
                </View>
                <View style={styles.profileButtonRight}>
                  <Text style={styles.profileButtonCount}>0</Text>
                  <Ionicons name="chevron-forward" size={20} color="#bbb" style={styles.profileButtonIcon} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileButtonRow} onPress={() => router.push('/my-cities')}>
                <View style={styles.profileButtonLeft}>
                  <Text style={styles.profileButtonText}>Cities</Text>
                </View>
                <View style={styles.profileButtonRight}>
                  <Text style={styles.profileButtonCount}>{[...new Set(visitedCities.filter(c => c?.name && c?.country).map(c => `${c.name}-${c.country}`))].length}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#bbb" style={styles.profileButtonIcon} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileButtonRow} onPress={() => router.push('/my-countries')}>
                <View style={styles.profileButtonLeft}>
                  <Text style={styles.profileButtonText}>Countries</Text>
                </View>
                <View style={styles.profileButtonRight}>
                  <Text style={styles.profileButtonCount}>{visitedCountries?.length ?? 0}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#bbb" style={styles.profileButtonIcon} />
                </View>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>

        {/* Tab Wishlist */}
        <ScrollView 
          style={[styles.tabContent, { backgroundColor: '#181C24' }]}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.wishlistSection}>
            <Text style={[styles.sectionTitle, { color: textColor, alignSelf: 'flex-start', marginLeft: 4 }]}>🌟 Mes destinations de rêve</Text>
            {wishlist.length === 0 ? (
              <View style={styles.wishlistContent}>
                <Text style={[styles.wishlistText, { color: textColor }]}>Aucune destination dans ta wishlist.</Text>
                <Text style={[styles.wishlistSubtext, { color: textColor }]}>Ajoute des voyages à ta wishlist depuis les détails d'un post !</Text>
              </View>
            ) : (
              <FlatList
                data={wishlist}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TravelPostCard
                    post={item}
                    onPress={() => router.push(`/trip-detail?postId=${item.id}`)}
                  />
                )}
                ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                contentContainerStyle={{ paddingBottom: 30 }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Modal Followers */}
      {showFollowersModal && (
        <Animated.View
          style={[
            styles.followersModal,
            {
              transform: [{ translateY: followersModalAnim }],
            },
          ]}
        >
          {/* Header de la modal */}
          <View style={styles.followersHeader}>
            <TouchableOpacity onPress={hideFollowers} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>⌄</Text>
            </TouchableOpacity>
            <Text style={styles.followersTitle}>Followers</Text>
            <View style={{ width: 70 }} />
          </View>

          {/* Barre de recherche */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un follower..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Liste des followers */}
          <ScrollView style={styles.followersScrollView} showsVerticalScrollIndicator={false}>
            {followersLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Chargement des followers...</Text>
              </View>
            ) : filteredFollowers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Aucun follower trouvé' : 'Aucun follower pour le moment'}
                </Text>
              </View>
            ) : (
              filteredFollowers.map((follower) => (
                <TouchableOpacity
                  key={follower.uid}
                  style={styles.userCard}
                  onPress={() => {
                    hideFollowers();
                    setTimeout(() => {
                      if (follower.uid === authUserProfile?.uid) {
                        router.push('/(tabs)/profile');
                      } else {
                        router.push(`/user-profile?userId=${follower.uid}`);
                      }
                    }, 300);
                  }}
                >
                  <View style={styles.userInfo}>
                    <Image 
                      source={{ uri: follower.photoURL || follower.profileImage || '' }}
                      style={styles.userPhoto}
                    />
                    <View style={styles.userTextInfo}>
                      <Text style={styles.userDisplayName}>
                        {follower.displayName}
                        {follower.uid === authUserProfile?.uid && <Text style={styles.youIndicator}> (You)</Text>}
                      </Text>
                    </View>
                  </View>
                  
                  {follower.uid !== authUserProfile?.uid && (
                    <View style={styles.followButtonContainer}>
                      <Text style={styles.followButtonText}>Voir profil</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* Modal Following */}
      {showFollowingModal && (
        <Animated.View
          style={[
            styles.followersModal, // Même style que followers
            {
              transform: [{ translateY: followingModalAnim }],
            },
          ]}
        >
          {/* Header de la modal */}
          <View style={styles.followersHeader}>
            <TouchableOpacity onPress={hideFollowing} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>⌄</Text>
            </TouchableOpacity>
            <Text style={styles.followersTitle}>Following</Text>
            <View style={{ width: 70 }} />
          </View>

          {/* Barre de recherche */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher dans following..."
              placeholderTextColor="#888"
              value={followingSearchQuery}
              onChangeText={setFollowingSearchQuery}
            />
          </View>

          {/* Liste des following */}
          <ScrollView style={styles.followersScrollView} showsVerticalScrollIndicator={false}>
            {followingLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Chargement des following...</Text>
              </View>
            ) : filteredFollowing.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {followingSearchQuery ? 'Aucun following trouvé' : 'Tu ne suis personne pour le moment'}
                </Text>
              </View>
            ) : (
              filteredFollowing.map((followingUser) => (
                <TouchableOpacity
                  key={followingUser.uid}
                  style={styles.userCard}
                  onPress={() => {
                    hideFollowing();
                    setTimeout(() => {
                      if (followingUser.uid === authUserProfile?.uid) {
                        router.push('/(tabs)/profile');
                      } else {
                        router.push(`/user-profile?userId=${followingUser.uid}`);
                      }
                    }, 300);
                  }}
                >
                  <View style={styles.userInfo}>
                    <Image 
                      source={{ uri: followingUser.photoURL || followingUser.profileImage || '' }}
                      style={styles.userPhoto}
                    />
                    <View style={styles.userTextInfo}>
                      <Text style={styles.userDisplayName}>
                        {followingUser.displayName}
                        {followingUser.uid === authUserProfile?.uid && <Text style={styles.youIndicator}> (You)</Text>}
                      </Text>
                    </View>
                  </View>
                  
                  {followingUser.uid !== authUserProfile?.uid && (
                    <View style={styles.followButtonContainer}>
                      <Text style={styles.followButtonText}>Voir profil</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* Popup for managing favorite cities */}
      {popupVisible && (
        <View style={styles.popupContainer}>
          <View style={styles.popupContent}>
            <Text style={styles.popupTitle}>Manage Favorite</Text>
            <TouchableOpacity style={styles.popupButton} onPress={handleDeleteFavorite}>
              <Text style={styles.popupButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.popupButton} onPress={handleUpdateFavorite}>
              <Text style={styles.popupButtonText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.popupButton} onPress={() => setPopupVisible(false)}>
              <Text style={styles.popupButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slidingContent: {
    flexDirection: 'row',
    width: Dimensions.get('window').width * 2,
  },
  tabContent: {
    width: Dimensions.get('window').width,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  profileStatCol: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  profileStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileStatLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 16,
    width: '100%',
    opacity: 0.4,
  },
  favoritesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  favoritesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  favoriteBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderWidth: 0.5,
    borderColor: '#bbb',
  },
  plus: {
    fontSize: 32,
    color: '#888',
    fontWeight: 'bold',
  },
  favoriteFlagImg: {
    width: 50,
    height: 38,
    borderRadius: 6,
    marginBottom: 0,
    borderWidth: 0.5,
    borderColor: '#333',
  },
  flag: {
    fontSize: 44,
    marginBottom: 0,
    textAlign: 'center',
  },
  favoriteCity: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  navIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  tabsContainer: {
    position: 'relative',
    paddingVertical: 15,
  },
  tab: {
    width: Dimensions.get('window').width / 2,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: Dimensions.get('window').width / 2,
    height: 2,
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollView: {
    paddingHorizontal: 0,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  tripsButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
  },
  tripsButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  citiesSection: {
    padding: 16,
  },
  citiesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  closeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  closeButtonText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
  },
  cityCard: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cityPhoto: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  cityInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cityName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cityRating: {
    fontSize: 14,
    marginBottom: 4,
  },
  cityDescription: {
    fontSize: 12,
    opacity: 0.8,
  },
  wishlistSection: {
    padding: 20,
    // alignItems: 'center', // Remove to allow full-width cards
  },
  wishlistContent: {
    alignItems: 'center',
    marginTop: 40,
  },
  wishlistText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    opacity: 0.8,
  },
  wishlistSubtext: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  profileButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderRadius: 10,
    borderWidth: 0.35,
    borderColor: '#bbb',
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  profileButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileButtonText: {
    color: '#bbb',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
    marginRight: 6,
  },
  profileButtonCount: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    opacity: 0.85,
  },
  profileButtonIcon: {
    marginLeft: 8,
  },
  profileButtonRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  // Styles pour la modal followers
  followersModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#181C24',
    zIndex: 9999, // Z-index très élevé pour survol complet
    elevation: 20, // Pour Android
  },
  followersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  followersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
  },
  followersScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  // Styles pour les cartes utilisateur dans les modals
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 0.7,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  userPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
  },
  userTextInfo: {
    flex: 1,
  },
  userDisplayName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    color: '#fff',
  },
  youIndicator: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.7,
    color: '#fff',
  },
  followButtonContainer: {
    backgroundColor: '#2051A4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 70,
    alignItems: 'center',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Styles pour le popup de gestion des favoris
  popupContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  popupContent: {
    width: '80%',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  popupButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: '#2051A4',
  },
  popupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
