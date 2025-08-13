import { useRanking } from '@/hooks/useRanking';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RankingScreen() {
  const backgroundColor = '#181C24'; // Electric dark gray
  const textColor = useThemeColor({}, 'text');
  const beigeColor = '#E5C9A6';
  const [activeTab, setActiveTab] = React.useState<'city' | 'country'>('city');
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Utiliser le hook personnalisé pour récupérer les données réelles
  const { rankingData, loading, error, refreshRanking } = useRanking();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankStyle = (rank: number) => {
    if (rank <= 3) {
      return styles.topRank;
    }
    return styles.normalRank;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRanking();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}> 
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={[styles.header, { backgroundColor }]}>
          <View style={styles.titleContainer}>
            <IconSymbol size={24} name="trophy" color="#FFFFFF" />
            <Text style={[styles.headerTitle, { color: "#FFFFFF" }]}>Ranking</Text>
          </View>
          
          {/* Onglets */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'city' && { borderBottomColor: '#FFFFFF' }]}
              onPress={() => setActiveTab('city')}
            >
              <Text style={[
                styles.tabText, 
                { color: activeTab === 'city' ? '#FFFFFF' : '#888' }
              ]}>
                City
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'country' && { borderBottomColor: '#FFFFFF' }]}
              onPress={() => setActiveTab('country')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'country' ? '#FFFFFF' : '#888' }
              ]}>
                Country
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'city' && (
          <>
  

            {loading && !refreshing && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={beigeColor} />
                <Text style={[styles.loadingText, { color: textColor }]}>
                  Chargement du classement...
                </Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: 'red' }]}>
                  {error}
                </Text>
              </View>
            )}

            {!loading && !error && rankingData.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: textColor }]}>
                  Aucun utilisateur à classer
                </Text>
                <Text style={styles.emptySubtext}>
                  Suivez des utilisateurs pour voir le classement !
                </Text>
              </View>
            )}

            {!loading && rankingData.length > 0 && (
              <View style={styles.rankingList}>
                {rankingData.map((user) => (
                  <View 
                    key={user.id}
                    style={[
                      styles.rankingCard,
                      user.isCurrentUser && { backgroundColor: beigeColor + '20' }
                    ]}
                  >
                    <View style={styles.rankInfo}>
                      <Text style={[styles.rankNumber, getRankStyle(user.rank)]}>
                        {getRankIcon(user.rank)}
                      </Text>
                    </View>

                    <Image 
                      source={{ uri: user.avatar }}
                      style={styles.avatar}
                    />

                    <View style={styles.userInfo}>
                      <Text style={[
                        styles.userName, 
                        { color: '#999' }, // Gris normal pour tous
                        user.isCurrentUser && { fontWeight: 'bold', color: beigeColor }
                      ]}>
                        {user.name}
                      </Text>
                      <Text style={[styles.citiesText, { color: '#FFFFFF' }]}>
                        {user.citiesVisited} villes visitées
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {!loading && rankingData.length > 0 && (
              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: textColor }]}>
                  Continue à explorer pour grimper dans le classement ! 🌍
                </Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'country' && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: textColor }]}>
              Classement par pays
            </Text>
            <Text style={styles.emptySubtitle}>
              Cette fonctionnalité arrive bientôt ! 🌍
            </Text>
          </View>
        )}
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#444',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsHeader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statsSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  rankingList: {
    marginBottom: 20,
  },
  rankingCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 0.7,
    borderColor: 'rgba(255,255,255,0.18)', // Bordure très fine et subtile
    backgroundColor: 'rgba(255,255,255,0.04)', // Même fond que les cartes d'explore
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
    marginHorizontal: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  citiesText: {
    fontSize: 14,
    color: '#666',
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    opacity: 0.7,
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
