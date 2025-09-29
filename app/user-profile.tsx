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
import { useFollow } from '@/hooks/useFollow';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  // States for followers/following modals
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [filteredFollowers, setFilteredFollowers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [followersLoading, setFollowersLoading] = useState(false);

  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [following, setFollowing] = useState<any[]>([]);
  const [filteredFollowing, setFilteredFollowing] = useState<any[]>([]);
  const [followingSearchQuery, setFollowingSearchQuery] = useState('');
  const [followingLoading, setFollowingLoading] = useState(false);

  // Animation values
  const followersModalAnim = React.useRef(new Animated.Value(1000)).current;
  const followingModalAnim = React.useRef(new Animated.Value(1000)).current;
  // Show followers modal
  const showFollowers = async () => {
    setShowFollowersModal(true);
    setFollowersLoading(true);
    require('react-native').Animated.spring(followersModalAnim, {
      toValue: 20,
      damping: 20,
      stiffness: 90,
      useNativeDriver: true,
    }).start();
    try {
      const { getFollowersList } = require('../services/FollowService');
      const followersList = await getFollowersList(userId);
      // Fetch user details for each follower
      const { getUserProfile } = require('../services/UserService');
      const followersDetails = await Promise.all(
        followersList.map(async (followerId: string) => {
          try {
            const profile = await getUserProfile(followerId);
            return {
              uid: followerId,
              displayName: profile.displayName || profile.name || 'User',
              email: profile.email,
              photoURL: profile.photoURL || profile.profileImage,
              profileImage: profile.profileImage,
            };
          } catch {
            return null;
          }
        })
      );
      const validFollowers = followersDetails.filter((f: any) => f !== null);
      setFollowers(validFollowers);
      setFilteredFollowers(validFollowers);
    } catch (error) {
      setFollowers([]);
      setFilteredFollowers([]);
    } finally {
      setFollowersLoading(false);
    }
  };

  // Hide followers modal
  const hideFollowers = () => {
    require('react-native').Animated.spring(followersModalAnim, {
      toValue: 1000,
      damping: 20,
      stiffness: 90,
      useNativeDriver: true,
    }).start(() => {
      setShowFollowersModal(false);
      setSearchQuery('');
    });
  };

  // Show following modal
  const showFollowing = async () => {
    setShowFollowingModal(true);
    setFollowingLoading(true);
    require('react-native').Animated.spring(followingModalAnim, {
      toValue: 20,
      damping: 20,
      stiffness: 90,
      useNativeDriver: true,
    }).start();
    try {
      const { getFollowingList } = require('../services/FollowService');
      const followingList = await getFollowingList(userId);
      // Fetch user details for each following
      const { getUserProfile } = require('../services/UserService');
      const followingDetails = await Promise.all(
        followingList.map(async (followingId: string) => {
          try {
            const profile = await getUserProfile(followingId);
            return {
              uid: followingId,
              displayName: profile.displayName || profile.name || 'User',
              email: profile.email,
              photoURL: profile.photoURL || profile.profileImage,
              profileImage: profile.profileImage,
            };
          } catch {
            return null;
          }
        })
      );
      const validFollowing = followingDetails.filter((f: any) => f !== null);
      setFollowing(validFollowing);
      setFilteredFollowing(validFollowing);
    } catch (error) {
      setFollowing([]);
      setFilteredFollowing([]);
    } finally {
      setFollowingLoading(false);
    }
  };

  // Hide following modal
  const hideFollowing = () => {
    require('react-native').Animated.spring(followingModalAnim, {
      toValue: 1000,
      damping: 20,
      stiffness: 90,
      useNativeDriver: true,
    }).start(() => {
      setShowFollowingModal(false);
      setFollowingSearchQuery('');
    });
  };

  // Filter followers by search
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

  // Filter following by search
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
  const params = useLocalSearchParams();
  const userId = params.userId as string;

  const { userProfile: currentUserProfile } = useAuth();
  const { posts, loading: postsLoading } = usePosts();
  const { isFollowing, followStats, handleFollow } = useFollow(userId);

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
            photoURL: ''
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

        {/* Ligne de séparation fine */}
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.2)', width: '100%' }} />

        <ScrollView style={[styles.scrollView, { backgroundColor: '#181C24' }]} showsVerticalScrollIndicator={false}>
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
              <ProfileImage 
                uri={displayProfile.photo} 
                size={100}
              />
              <TouchableOpacity 
                style={styles.profileStatCol}
                onPress={showFollowing}
                activeOpacity={0.7}
              >
                <Text style={[styles.profileStatNumber, { color: textColor }]}>{displayProfile.following}</Text>
                <Text style={[styles.profileStatLabel, { color: textColor }]}>Following</Text>
              </TouchableOpacity>
      {/* Modal Followers */}
      {showFollowersModal && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#181C24',
            zIndex: 9999,
            elevation: 20,
            transform: [{ translateY: followersModalAnim }],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' }}>
            <TouchableOpacity onPress={hideFollowers} style={{ width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
              <Text style={{ fontSize: 36, color: '#fff', fontWeight: 'bold' }}>⌄</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>Followers</Text>
            <View style={{ width: 70 }} />
          </View>
          <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
            <TextInput
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#fff' }}
              placeholder="Search followers..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
            {followersLoading ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{ marginTop: 12, fontSize: 16, color: '#888' }}>Loading followers...</Text>
              </View>
            ) : filteredFollowers.length === 0 ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
                <Text style={{ fontSize: 16, color: '#888', textAlign: 'center' }}>
                  {searchQuery ? 'No followers found' : 'No followers yet'}
                </Text>
              </View>
            ) : (
              filteredFollowers.map((follower) => (
                <TouchableOpacity
                  key={follower.uid}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 0.7, borderColor: 'rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.04)' }}
                  onPress={() => {
                    hideFollowers();
                    setTimeout(() => {
                      if (follower.uid === currentUserProfile?.uid) {
                        router.push('/(tabs)/profile');
                      } else {
                        router.push(`/user-profile?userId=${follower.uid}`);
                      }
                    }, 300);
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
                    <Image 
                      source={{ uri: follower.photoURL || follower.profileImage || '' }}
                      style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#333' }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 2, color: '#fff' }}>
                        {follower.displayName}
                        {follower.uid === currentUserProfile?.uid && <Text style={{ fontSize: 14, fontWeight: '400', opacity: 0.7, color: '#fff' }}> (You)</Text>}
                      </Text>
                    </View>
                  </View>
                  {follower.uid !== currentUserProfile?.uid && (
                    <View style={{ backgroundColor: '#2051A4', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, minWidth: 70, alignItems: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>View profile</Text>
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
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#181C24',
            zIndex: 9999,
            elevation: 20,
            transform: [{ translateY: followingModalAnim }],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' }}>
            <TouchableOpacity onPress={hideFollowing} style={{ width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
              <Text style={{ fontSize: 36, color: '#fff', fontWeight: 'bold' }}>⌄</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>Following</Text>
            <View style={{ width: 70 }} />
          </View>
          <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
            <TextInput
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#fff' }}
              placeholder="Search following..."
              placeholderTextColor="#888"
              value={followingSearchQuery}
              onChangeText={setFollowingSearchQuery}
            />
          </View>
          <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
            {followingLoading ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{ marginTop: 12, fontSize: 16, color: '#888' }}>Loading following...</Text>
              </View>
            ) : filteredFollowing.length === 0 ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
                <Text style={{ fontSize: 16, color: '#888', textAlign: 'center' }}>
                  {followingSearchQuery ? 'No following found' : 'Not following anyone yet'}
                </Text>
              </View>
            ) : (
              filteredFollowing.map((followingUser) => (
                <TouchableOpacity
                  key={followingUser.uid}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 0.7, borderColor: 'rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.04)' }}
                  onPress={() => {
                    hideFollowing();
                    setTimeout(() => {
                      if (followingUser.uid === currentUserProfile?.uid) {
                        router.push('/(tabs)/profile');
                      } else {
                        router.push(`/user-profile?userId=${followingUser.uid}`);
                      }
                    }, 300);
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
                    <Image 
                      source={{ uri: followingUser.photoURL || followingUser.profileImage || '' }}
                      style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#333' }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 2, color: '#fff' }}>
                        {followingUser.displayName}
                        {followingUser.uid === currentUserProfile?.uid && <Text style={{ fontSize: 14, fontWeight: '400', opacity: 0.7, color: '#fff' }}> (You)</Text>}
                      </Text>
                    </View>
                  </View>
                  {followingUser.uid !== currentUserProfile?.uid && (
                    <View style={{ backgroundColor: '#2051A4', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, minWidth: 70, alignItems: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>View profile</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </Animated.View>
      )}
            </View>

            {/* Bouton Follow centré */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={[
                  styles.followButton,
                  isFollowing && { backgroundColor: '#666' }
                ]}
                onPress={handleFollow}
                disabled={userId === currentUserProfile?.uid}
              >
                <Text style={styles.followButtonText}>
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Ligne de séparation fine grise au-dessus des Favorites */}
            <View style={{ height: 1, backgroundColor: '#444', width: '100%', opacity: 0.5, marginVertical: 12 }} />

            {/* Section Favorites (lecture seule) - only show if at least one favorite exists */}
            {favorites.some(fav => fav && fav.city && fav.country) && (
              <>
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
                                contentFit="cover"
                                cachePolicy="memory-disk"
                              />
                            : getCountryCode(fav.country)
                              ? <Image
                                  source={{ uri: `https://flagcdn.com/w80/${getCountryCode(fav.country)}.png` }}
                                  style={styles.favoriteFlagImg}
                                  contentFit="cover"
                                  cachePolicy="memory-disk"
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
              </>
            )}

            {/* Titre Diary au-dessus des 4 boutons */}
            <Text style={[styles.favoritesTitle, { color: textColor, marginBottom: 18 }]}>Diary</Text>

            {/* 4 boutons, un par ligne, avec icône chevron à droite */}
            <View style={{ width: '100%' }}>
              <TouchableOpacity 
                style={styles.profileButtonRow}
                onPress={() => router.push({ pathname: '/user-posts', params: { userId } })}
              >
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
              <TouchableOpacity 
                style={styles.profileButtonRow}
                onPress={() => router.push({ pathname: '/user-cities', params: { userId } })}
              >
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
