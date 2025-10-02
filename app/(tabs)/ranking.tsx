import { CachedImage } from '@/components/CachedImage';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useCountryRanking } from '@/hooks/useCountryRanking';
import { getInstantUserPhoto } from '@/hooks/useGlobalPhotoPreloader';
import { useRanking } from '@/hooks/useRanking';
import { useThemeColor } from '@/hooks/useThemeColor';
import { imageCacheService } from '@/services/ImageCacheService';
import React from 'react';
import {
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RankingScreen() {
  const backgroundColor = '#181C24';
  const textColor = useThemeColor({}, 'text');
  const [activeTab, setActiveTab] = React.useState<'city' | 'country'>('city');
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Animations pour le sliding
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const tabIndicatorAnim = React.useRef(new Animated.Value(0)).current;
  
  const { rankingData: cityRankingData, loading: cityLoading, error: cityError, refreshRanking: refreshCityRanking } = useRanking();
  const { rankingData: countryRankingData, loading: countryLoading, error: countryError, refreshRanking: refreshCountryRanking } = useCountryRanking();

  // Précharge les avatars des utilisateurs pour un affichage instantané
  React.useEffect(() => {
    const preloadAvatars = async () => {
      const avatarsToPreload: string[] = [];
      
      // Ajouter les avatars du classement des villes
      if (cityRankingData) {
        cityRankingData.forEach(user => {
          if (user.avatar && user.avatar.trim() !== '') {
            avatarsToPreload.push(user.avatar);
          } else {
            const cachedPhoto = getInstantUserPhoto(user.id);
            if (cachedPhoto) avatarsToPreload.push(cachedPhoto);
          }
        });
      }
      
      // Ajouter les avatars du classement des pays
      if (countryRankingData) {
        countryRankingData.forEach(user => {
          if (user.avatar && user.avatar.trim() !== '') {
            avatarsToPreload.push(user.avatar);
          } else {
            const cachedPhoto = getInstantUserPhoto(user.id);
            if (cachedPhoto) avatarsToPreload.push(cachedPhoto);
          }
        });
      }
      
      // Précharger tous les avatars en parallèle
      if (avatarsToPreload.length > 0) {
        await imageCacheService.preloadMultiple(avatarsToPreload);
      }
    };
    
    preloadAvatars();
  }, [cityRankingData, countryRankingData]);

  // Fonctions pour obtenir les données selon l'onglet actif
  const getCurrentRankingData = () => {
    return activeTab === 'city' ? cityRankingData : countryRankingData;
  };

  const getCurrentError = () => {
    return activeTab === 'city' ? cityError : countryError;
  };

  const getCurrentLoading = () => {
    return activeTab === 'city' ? cityLoading : countryLoading;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankStyle = (rank: number) => {
    return rank <= 3 ? styles.topRank : styles.normalRank;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'city') {
      await refreshCityRanking();
    } else {
      await refreshCountryRanking();
    }
    setRefreshing(false);
  };

  const switchTab = (tab: 'city' | 'country') => {
    if (tab === activeTab) return;
    
    const screenWidth = Dimensions.get('window').width;
    const targetSlideValue = tab === 'city' ? 0 : -screenWidth;
    const targetIndicatorValue = tab === 'city' ? 0 : screenWidth / 2;
    
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

  const renderContent = (data: any[], error: string | null, isCity: boolean) => {
    return (
      <>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: 'red' }]}>{error}</Text>
          </View>
        )}

        {(!data || data.length === 0) && !error && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: textColor }]}>
              Aucun utilisateur à classer
            </Text>
            <Text style={styles.emptySubtext}>
              Suivez des utilisateurs pour voir le classement !
            </Text>
          </View>
        )}

        {data && data.length > 0 && (
          <>
            <View style={styles.rankingList}>
              {data.map((user: any) => (
                <View key={user.id} style={styles.rankingCard}>
                  <View style={styles.rankInfo}>
                    <Text style={[styles.rankNumber, getRankStyle(user.rank)]}>
                      {getRankIcon(user.rank)}
                    </Text>
                  </View>

                  <View style={styles.avatarContainer}>
                    {user.avatar && user.avatar.trim() !== '' ? (
                      <CachedImage 
                        uri={user.avatar}
                        style={styles.avatar}
                        onError={() => console.log('Erreur chargement avatar pour:', user.name)}
                      />
                    ) : (
                      (() => {
                        const cachedPhoto = getInstantUserPhoto(user.id);
                        return cachedPhoto ? (
                          <CachedImage 
                            uri={cachedPhoto}
                            style={styles.avatar}
                          />
                        ) : (
                          <View style={styles.defaultAvatar}>
                            <Text style={styles.defaultAvatarText}>
                              {(user.name || '?').charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        );
                      })()
                    )}
                  </View>

                  <View style={styles.userInfo}>
                    <View style={styles.userInfoRow}>
                      <Text style={[
                        styles.userName, 
                        { color: '#FFFFFF', flex: 1 },
                        user.isCurrentUser && { fontWeight: 'bold', color: '#FFFFFF' }
                      ]}>
                        {user.isCurrentUser ? 'You' : user.name}
                      </Text>
                      
                      <View style={styles.citiesContainer}>
                        <Text style={styles.citiesNumber}>
                          {isCity ? user.citiesVisited : user.countriesVisited}
                        </Text>
                        <IconSymbol 
                          size={16} 
                          name={isCity ? "building.2" : "flag"} 
                          color="#FFFFFF" 
                        />
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: textColor }]}>
                {isCity 
                  ? "Continue à explorer pour grimper dans le classement ! 🌍"
                  : "Découvre de nouveaux pays pour grimper dans le classement ! 🌏"
                }
              </Text>
            </View>
          </>
        )}
      </>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}> 
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={[styles.header, { backgroundColor }]}>
          <View style={styles.titleContainer}>
            <IconSymbol size={24} name="trophy" color="#FFFFFF" />
            <Text style={[styles.headerTitle, { color: "#FFFFFF" }]}>Ranking</Text>
          </View>
          
          <View style={[styles.tabsContainer, { borderBottomWidth: 1, borderBottomColor: '#444', marginHorizontal: -20 }]}>
            <View style={{ paddingHorizontal: 20, flexDirection: 'row', position: 'relative' }}>
              <TouchableOpacity style={[styles.tab, { marginLeft: -10 }]} onPress={() => switchTab('city')}>
                <Text style={[
                  styles.tabText, 
                  { color: activeTab === 'city' ? '#FFFFFF' : '#888' }
                ]}>
                  City
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, { marginLeft: 20 }]} onPress={() => switchTab('country')}>
                <Text style={[
                  styles.tabText,
                  { color: activeTab === 'country' ? '#FFFFFF' : '#888' }
                ]}>
                  Country
                </Text>
              </TouchableOpacity>
              
              <Animated.View 
                style={[
                  styles.tabIndicator,
                  { transform: [{ translateX: tabIndicatorAnim }] }
                ]} 
              />
            </View>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.contentContainer}>
        <Animated.View 
          style={[
            styles.slidingContent,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          <View style={styles.tabContent}>
            <ScrollView 
              style={styles.content}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {cityLoading ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: textColor }]}>Chargement...</Text>
                </View>
              ) : (
                renderContent(cityRankingData || [], cityError, true)
              )}
            </ScrollView>
          </View>

          <View style={styles.tabContent}>
            <ScrollView 
              style={styles.content}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {countryLoading ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: textColor }]}>Chargement...</Text>
                </View>
              ) : (
                renderContent(countryRankingData || [], countryError, false)
              )}
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSafeArea: {
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tabsContainer: {
    position: 'relative',
  },
  tab: {
    width: (Dimensions.get('window').width - 40) / 2,
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
  contentContainer: {
    flex: 1,
  },
  slidingContent: {
    flexDirection: 'row',
    width: Dimensions.get('window').width * 2,
  },
  tabContent: {
    width: Dimensions.get('window').width,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
  },
  rankingList: {
    marginBottom: 20,
  },
  rankingCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 0.7,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
  },
  rankInfo: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  topRank: {
    fontSize: 24,
  },
  normalRank: {
    fontSize: 18,
    color: '#666',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarContainer: {
    marginHorizontal: 15,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5C9A6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  citiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  citiesNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  footer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});
