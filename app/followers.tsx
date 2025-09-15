import { UserSearchCard } from '@/components/UserSearchCard';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getFollowersList } from '@/services/FollowService';
import { UserSearchResult } from '@/services/UserSearchService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../config/firebase';

export default function FollowersScreen() {
  const { userProfile } = useAuth();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'borderColor');
  
  const [followers, setFollowers] = useState<UserSearchResult[]>([]);
  const [filteredFollowers, setFilteredFollowers] = useState<UserSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Animation pour le modal 3/4
  const slideAnim = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;
  
  useEffect(() => {
    // Animation d'entrée
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').height * 0.25, // 3/4 de l'écran
      duration: 400,
      useNativeDriver: true,
    }).start();
    
    loadFollowers();
  }, []);
  
  const loadFollowers = async () => {
    if (!userProfile?.uid) return;
    
    try {
      setLoading(true);
      const followersList = await getFollowersList(userProfile.uid);
      
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
      setLoading(false);
    }
  };
  
  // Filtrer les followers selon la recherche
  useEffect(() => {
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
  
  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  };
  
  return (
    <SafeAreaView style={styles.overlay}>
      <Animated.View 
        style={[
          styles.modalContainer,
          { 
            backgroundColor: '#181C24',
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Header avec bouton fermer */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Followers ({followers.length})</Text>
          <View style={{ width: 40 }} /> {/* Spacer pour centrer le titre */}
        </View>
        
        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un follower..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Liste des followers */}
        <ScrollView 
          style={styles.followersList}
          contentContainerStyle={styles.followersContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={[styles.loadingText, { color: textColor }]}>Chargement des followers...</Text>
            </View>
          ) : filteredFollowers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: textColor }]}>
                {searchQuery ? 'Aucun follower trouvé' : 'Aucun follower pour le moment'}
              </Text>
            </View>
          ) : (
            filteredFollowers.map((follower, index) => (
              <UserSearchCard
                key={follower.uid}
                user={follower}
              />
            ))
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2E35',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  clearButton: {
    padding: 5,
  },
  followersList: {
    flex: 1,
  },
  followersContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
});