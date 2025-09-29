

import { TravelPostCard } from '@/components/TravelPostCard';
import { usePosts } from '@/hooks/usePosts';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function UserPostsScreen() {
  const navigation = useNavigation();
  React.useLayoutEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);
  const params = useLocalSearchParams();
  const userId = params.userId as string;
  const { posts, loading } = usePosts();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  // Filter posts for the user
  const userPosts = React.useMemo(() => {
    if (!userId || !posts) return [];
    return posts.filter((p: any) => p.userId === userId);
  }, [posts, userId]);

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
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={{ height: 16 }} />
          {userPosts.map((post: any) => (
            <TravelPostCard
              key={post.id}
              post={post}
              onPress={() => router.push(`/trip-detail?postId=${post.id}`)}
            />
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
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
  scrollView: {
    flex: 1,
    backgroundColor: '#181C24',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
