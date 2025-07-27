import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CityLogTitle } from '@/components/CityLogTitle';
import { TravelPostCard } from '@/components/TravelPostCard';
import { usePosts } from '@/hooks/usePosts';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const beigeColor = '#E5C9A6'; // Couleur beige pour la ligne
  
  const { posts, loading, error, refreshPosts, toggleLike } = usePosts();
  const [refreshing, setRefreshing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'cities' | 'trips'>('cities');

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPosts();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Titre CityLog */}
        <CityLogTitle />
        
        {/* Onglets */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'cities' && { borderBottomColor: beigeColor }]}
            onPress={() => setActiveTab('cities')}
          >
            <Text style={[
              styles.tabText, 
              { color: activeTab === 'cities' ? beigeColor : textColor }
            ]}>
              Cities
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'trips' && { borderBottomColor: beigeColor }]}
            onPress={() => setActiveTab('trips')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'trips' ? beigeColor : textColor }
            ]}>
              Trips
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Ligne de séparation grise */}
        <View style={styles.separatorContainer}>
          <View style={[styles.separatorLine, { backgroundColor: '#333333' }]} />
        </View>
        
        {/* Messages d'état */}
        {loading && !refreshing && (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={beigeColor} />
            <Text style={[styles.loadingText, { color: textColor }]}>
              Chargement des voyages...
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.centerContent}>
            <Text style={[styles.errorText, { color: 'red' }]}>
              {error}
            </Text>
          </View>
        )}

        {/* Posts */}
        <View style={styles.postsContainer}>
          {activeTab === 'cities' && (
            <>
              {!loading && posts.length === 0 && (
                <View style={styles.centerContent}>
                  <Text style={[styles.emptyText, { color: textColor }]}>
                    Aucun voyage partagé pour le moment.
                  </Text>
                  <Text style={[styles.emptySubtext, { color: textColor }]}>
                    Soyez le premier à partager votre aventure ! ✈️
                  </Text>
                </View>
              )}

              {posts.map((post) => (
                <TravelPostCard 
                  key={post.id} 
                  post={post}
                  onLike={() => toggleLike(post.id)}
                />
              ))}
            </>
          )}

          {activeTab === 'trips' && (
            <View style={styles.centerContent}>
              <Text style={[styles.emptyText, { color: textColor }]}>
                Gros trips à venir ! 🌍
              </Text>
              <Text style={[styles.emptySubtext, { color: textColor }]}>
                Cette section affichera vos grands voyages créés depuis votre profil.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginHorizontal: -6,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  separatorContainer: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  separatorLine: {
    height: 0.5,
    width: '100%',
  },
  postsContainer: {
    paddingBottom: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    opacity: 0.7,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});
