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

import { ProfileImage } from '@/components/ProfileImage';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useFollow } from '@/hooks/useFollow';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePosts } from '../hooks/usePosts';
import { getUserFavorites, getUserProfile } from '../services/UserService';

interface UserProfile {
  uid?: string;
  displayName?: string;
  photoURL?: string;
  profileImage?: string;
  email?: string;
  // Ajoute d'autres champs selon tes besoins - tous optionnels pour DocumentData
}

interface UserStats {
  visitedCountries: number;
  totalCities: number;
  followers: number;
  following: number;
}

export default function UserProfileScreen() {
  const params = useLocalSearchParams();
  const userId = params.userId as string;
  
  const { userProfile: currentUserProfile } = useAuth();
  const { posts, loading: postsLoading } = usePosts();
  const { isFollowing, followStats, loading: followLoading, handleFollow } = useFollow(userId);
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    visitedCountries: 0,
    totalCities: 0,
    followers: 0,
    following: 0
  });

  // Mettre à jour les stats quand followStats change
  useEffect(() => {
    setUserStats(prev => ({
      ...prev,
      followers: followStats.followers,
      following: followStats.following
    }));
  }, [followStats]);
  const [favorites, setFavorites] = useState<any[]>([null, null, null]);
  const [activeTab, setActiveTab] = useState<'profile' | 'wishlist'>('profile');
  const [loading, setLoading] = useState(true);

  const textColor = useThemeColor({}, 'text');
  const textActiveColor = useThemeColor({}, 'textActive');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'borderColor');

  // Récupérer les posts de l'utilisateur
  const userPosts = React.useMemo(() => {
    if (!userId || !posts) return [];
    return posts.filter((p: any) => p.userId === userId);
  }, [posts, userId]);

  // Charger le profil utilisateur
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        
        // Récupérer le profil utilisateur depuis Firestore
        let profile: UserProfile;
        try {
          const firestoreProfile = await getUserProfile(userId);
          profile = {
            uid: userId,
            displayName: firestoreProfile.displayName || firestoreProfile.name || 'Utilisateur',
            photoURL: firestoreProfile.photoURL || firestoreProfile.profileImage,
            profileImage: firestoreProfile.profileImage,
            email: firestoreProfile.email
          };
        } catch (error) {
          // Si le profil n'existe pas dans Firestore, créer un profil minimal
          console.log('Profil non trouvé dans Firestore, création d\'un profil minimal');
          profile = {
            uid: userId,
            displayName: 'Utilisateur',
            photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b5739775?w=200&h=200&fit=crop&crop=face'
          };
        }
        setUserProfile(profile);
        
        // Récupérer les favoris de l'utilisateur
        try {
          const userFavorites = await getUserFavorites(userId);
          setFavorites(userFavorites);
        } catch (error) {
          console.log('Favoris non trouvés:', error);
          setFavorites([null, null, null]);
        }
        
        // Calculer les statistiques basées sur les posts
        const userPostsCount = posts?.filter((p: any) => p.userId === userId).length || 0;
        const uniqueCities = new Set();
        const uniqueCountries = new Set();
        
        posts?.filter((p: any) => p.userId === userId).forEach((post: any) => {
          if (post.city && post.country) {
            uniqueCities.add(`${post.city}-${post.country}`);
            uniqueCountries.add(post.country);
          }
        });
        
        setUserStats({
          visitedCountries: uniqueCountries.size,
          totalCities: uniqueCities.size,
          followers: followStats.followers,
          following: followStats.following,
        });
        
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userId, posts]);

  if (loading || !userProfile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#181C24' }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: textColor }]}>Chargement du profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayProfile = {
    name: userProfile.displayName || 'Utilisateur',
    photo: userProfile.photoURL || userProfile.profileImage,
    followers: followStats.followers,
    following: followStats.following,
    visitedCountries: userStats.visitedCountries,
    totalCities: userStats.totalCities
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: '#181C24' }]}> 
      {/* Header Explore-like avec nom d'utilisateur, fond foncé partout */}
      <View style={{ backgroundColor: '#181C24', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Bouton retour */}
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          {/* Nom d'utilisateur centré */}
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 22, textAlign: 'center', flex: 1 }} numberOfLines={1}>
            {displayProfile.name}
          </Text>
          {/* Espace vide pour équilibrer */}
          <View style={{ width: 38 }} />
        </View>
      </View>

      {/* Onglets Profile / Wishlist */}
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
              <ProfileImage 
                uri={displayProfile.photo} 
                size={100}
              />
              <View style={styles.profileStatCol}>
                <Text style={[styles.profileStatNumber, { color: textColor }]}>{displayProfile.following}</Text>
                <Text style={[styles.profileStatLabel, { color: textColor }]}>Following</Text>
              </View>
            </View>

            {/* Bouton Follow centré */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={[
                  styles.followButton,
                  isFollowing && { backgroundColor: '#666' }
                ]}
                onPress={handleFollow}
                disabled={followLoading || userId === currentUserProfile?.uid}
              >
                <Text style={styles.followButtonText}>
                  {followLoading ? 'Chargement...' : isFollowing ? 'Unfollow' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Ligne de séparation fine grise au-dessus des Favorites */}
            <View style={{ height: 1, backgroundColor: '#444', width: '100%', opacity: 0.5, marginVertical: 12 }} />
            
            {/* Section Favorites (lecture seule) */}
            <Text style={[styles.favoritesTitle, { color: textColor }]}>Favorites</Text>
            <View style={styles.favoritesRow}>
              {favorites.map((fav, idx) => (
                <View key={fav?.city && fav?.country ? `${fav.city}-${fav.country}-${idx}` : `favorite-${idx}`} style={{ alignItems: 'center', flex: 1 }}>
                  <View style={[styles.favoriteBox, fav && { borderWidth: 0, borderColor: 'transparent' }]}>
                    {!fav ? (
                      <Text style={styles.emptyFavorite}>—</Text>
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
                  </View>
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
              <TouchableOpacity style={styles.profileButtonRow}>
                <View style={styles.profileButtonLeft}>
                  <Text style={styles.profileButtonText}>Posts</Text>
                </View>
                <View style={styles.profileButtonRight}>
                  <Text style={styles.profileButtonCount}>{userPosts.length}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#bbb" style={{ marginLeft: 8 }} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileButtonRow}>
                <View style={styles.profileButtonLeft}>
                  <Text style={styles.profileButtonText}>Trips</Text>
                </View>
                <View style={styles.profileButtonRight}>
                  <Text style={styles.profileButtonCount}>0</Text>
                  <Ionicons name="chevron-forward" size={20} color="#bbb" style={{ marginLeft: 8 }} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileButtonRow}>
                <View style={styles.profileButtonLeft}>
                  <Text style={styles.profileButtonText}>Cities</Text>
                </View>
                <View style={styles.profileButtonRight}>
                  <Text style={styles.profileButtonCount}>{userStats.totalCities}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#bbb" style={{ marginLeft: 8 }} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileButtonRow}>
                <View style={styles.profileButtonLeft}>
                  <Text style={styles.profileButtonText}>Countries</Text>
                </View>
                <View style={styles.profileButtonRight}>
                  <Text style={styles.profileButtonCount}>{userStats.visitedCountries}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#bbb" style={{ marginLeft: 8 }} />
                </View>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      ) : (
        <View style={styles.wishlistSection}>
          <Text style={[styles.sectionTitle, { color: textColor, alignSelf: 'flex-start', marginLeft: 4 }]}>🌟 Ses destinations de rêve</Text>
          <View style={styles.wishlistContent}>
            <Text style={[styles.wishlistText, { color: textColor }]}>Wishlist privée.</Text>
            <Text style={[styles.wishlistSubtext, { color: textColor }]}>Les wishlists ne sont pas publiques pour l'instant.</Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    justifyContent: 'center',
  },
  followButton: {
    backgroundColor: '#2051A4',
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 120,
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  messageButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2051A4',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
  },
  messageButtonText: {
    color: '#2051A4',
    fontWeight: 'bold',
    fontSize: 14,
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
  emptyFavorite: {
    fontSize: 24,
    color: '#666',
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
  profileButtonRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postsSection: {
    flex: 1,
  },
  emptyPostsContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyPostsText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    opacity: 0.8,
  },
  emptyPostsSubtext: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  wishlistSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
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
});
