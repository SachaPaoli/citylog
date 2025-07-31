import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
  const textActiveColor = useThemeColor({}, 'textActive');
  const borderColor = useThemeColor({}, 'borderColor');
  
  const { posts, loading, error, refreshPosts } = usePosts();
  const [refreshing, setRefreshing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'cities' | 'trips'>('cities');
  const router = useRouter();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPosts();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#2A2A2A' }]}> 
      <View style={{ flex: 1 }}>
        {/* Header : logo à gauche, cloche à droite */}
        <View style={[styles.topSection, { backgroundColor: '#2A2A2A', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 }]}> 
          <CityLogTitle />
          <TouchableOpacity onPress={() => router.push('/notifications-screen')} style={{ padding: 8 }}>
            <Ionicons name="notifications-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Onglets */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'cities' && { borderBottomColor: '#FFFFFF' }]}
            onPress={() => setActiveTab('cities')}
          >
            <Text style={[
              styles.tabText, 
              { color: activeTab === 'cities' ? '#FFFFFF' : '#B0B0B0' }
            ]}>
              Cities
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'trips' && { borderBottomColor: '#FFFFFF' }]}
            onPress={() => setActiveTab('trips')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'trips' ? '#FFFFFF' : '#B0B0B0' }
            ]}>
              Trips
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          style={[styles.scrollView, { backgroundColor: '#3A3A3A' }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Messages d'état */}
          {loading && !refreshing && (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={textActiveColor} />
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
      </View>
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    paddingTop: 0,
    paddingBottom: 5,
  },
  scrollView: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 2,
    marginTop: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginHorizontal: -6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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
