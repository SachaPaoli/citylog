import { router, useNavigation } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TravelPostCard } from '../components/TravelPostCard';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../hooks/usePosts';
import { useThemeColor } from '../hooks/useThemeColor';

export default function MyPostsScreen() {
  const navigation = useNavigation();
  React.useLayoutEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);
  const { userProfile } = useAuth();
  const { posts, loading } = usePosts();
  const textColor = useThemeColor({}, 'text');
  const userPosts = React.useMemo(() => {
    if (!userProfile?.uid || !posts) return [];
    return posts.filter((p: any) => p.userId === userProfile.uid);
  }, [posts, userProfile]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#181C24' }}>
      {/* Header style notifications (back only, no title) */}
      <View style={[styles.header, { backgroundColor: '#181C24' }]}> 
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 0.5, backgroundColor: 'rgba(255,255,255,0.3)', width: '100%' }} />
      {loading ? (
        <View style={styles.centered}><Text style={{ color: textColor }}>Chargement...</Text></View>
      ) : userPosts && userPosts.length > 0 ? (
        <FlatList
          data={userPosts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TravelPostCard
              post={item}
              onPress={() => router.push(`/trip-detail?postId=${item.id}`)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.centered}><Text style={{ color: textColor }}>Aucun post publié.</Text></View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: '#232323',
    width: '100%',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    justifyContent: 'center',
    height: 40,
    minWidth: 80,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'right',
    minWidth: 120,
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
