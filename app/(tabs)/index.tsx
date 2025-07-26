import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
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
