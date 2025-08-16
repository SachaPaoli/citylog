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
import { useAuth } from '@/contexts/AuthContext';
import { useFollowStats } from '@/hooks/useFollowStats';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useUserTravels } from '@/hooks/useUserTravels';
import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TravelPostCard } from '../../components/TravelPostCard';
import { useVisitedCities } from '../../contexts/VisitedCitiesContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { usePosts } from '../../hooks/usePosts';
import { addFavorite as addFavoriteFirestore, getUserFavorites } from '../../services/UserService';

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#181C24' }]}> 
      {/* Header Explore-like avec nom d'utilisateur et boutons, fond foncé partout */}
      <View style={{ backgroundColor: '#181C24', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Bouton logout (porte) */}
          <TouchableOpacity onPress={handleLogout} style={{ padding: 8 }}>
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
      {/* Onglets Profile / Wishlist centrés */}
      <View style={{ backgroundColor: '#181C24', paddingTop: 0, paddingBottom: 4, marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 24 }}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'profile' && { borderBottomColor: borderColor }]}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'profile' ? textActiveColor : textColor }]}> 
              Profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'wishlist' && { borderBottomColor: borderColor }]}
            onPress={() => setActiveTab('wishlist')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'wishlist' ? textActiveColor : textColor }]}> 
              Wishlist
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Ligne de séparation fine */}
      <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.2)', width: '100%' }} />

      {activeTab === 'profile' ? (
      <ScrollView style={[styles.scrollView, { backgroundColor: '#181C24' }]} showsVerticalScrollIndicator={false}>
          {/* Header du profil avec followers/following autour de la photo */}
          <View style={styles.profileHeader}>
            <View style={styles.profileRow}>
              <View style={styles.profileStatCol}>
                <Text style={[styles.profileStatNumber, { color: textColor }]}>{displayProfile.followers}</Text>
                <Text style={[styles.profileStatLabel, { color: textColor }]}>Followers</Text>
              </View>
              <Image source={{ uri: displayProfile.photo }} style={styles.profilePhoto} />
              <View style={styles.profileStatCol}>
                <Text style={[styles.profileStatNumber, { color: textColor }]}>{displayProfile.following}</Text>
                <Text style={[styles.profileStatLabel, { color: textColor }]}>Following</Text>
              </View>
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
                      fav && { borderWidth: 0, borderColor: 'transparent' }
                    ]}
                    onPress={() => handleAddFavorite(idx)}
                    activeOpacity={0.7}
                  >
                    {!fav ? (
                      <Text style={styles.plus}>+</Text>
                    ) : (
                      (fav.countryCode && fav.countryCode.length === 2)
                        ? <Image
                            source={{ uri: `https://flagcdn.com/w80/${fav.countryCode}.png` }}
                            style={styles.favoriteFlagImg}
                            resizeMode="cover"
                          />
                        : getCountryCode(fav.country)
                          ? <Image
                              source={{ uri: `https://flagcdn.com/w80/${getCountryCode(fav.country)}.png` }}
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
              <TouchableOpacity style={styles.profileButtonRow}>
                <View style={styles.profileButtonLeft}>
                  <Text style={styles.profileButtonText}>Countries</Text>
                </View>
                <View style={styles.profileButtonRight}>
                  <Text style={styles.profileButtonCount}>{travelData?.visitedCountries?.length ?? 0}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#bbb" style={styles.profileButtonIcon} />
                </View>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      ) : (
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
      )}
      {/* ...modal removed, navigation to /my-posts instead... */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: 48,
    height: 36,
    borderRadius: 8,
    marginBottom: 0,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
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
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
  },
  closeButtonText: {
    fontSize: 16,
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
});
