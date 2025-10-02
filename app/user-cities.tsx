import { usePosts } from '@/hooks/usePosts';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import { FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Country name to ISO code for flag
const countryNameToCode = {
  France: 'FR', Japan: 'JP', USA: 'US', Brazil: 'BR', Australia: 'AU', Canada: 'CA', Germany: 'DE', Spain: 'ES', Italy: 'IT', UK: 'GB', Belgium: 'BE', Switzerland: 'CH', Mexico: 'MX', Argentina: 'AR', Chile: 'CL', SouthAfrica: 'ZA', /* ... add more as needed ... */
};

export default function UserCitiesScreen() {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);
  const params = useLocalSearchParams();
  const userId = params.userId as string;
  const { posts } = usePosts();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  // States for modal
  const [showPostsModal, setShowPostsModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<{name: string, countryCode: string} | null>(null);

  // Group and deduplicate cities by name + country code
  const displayCities = useMemo(() => {
    if (!userId || !posts) return [];
    // Only posts for this user
    const userPosts = posts.filter((p: any) => p.userId === userId && p.city && p.country);
    const grouped: Record<string, { name: string, countryCode: string, ratings: number[], postCount: number }> = {};
    userPosts.forEach((p: { city: string; country: keyof typeof countryNameToCode | string; rating?: number }) => {
      let code = p.country.trim();
      if (code.length > 2) {
        code = (countryNameToCode as any)[code] || code;
      }
      code = code.toUpperCase();
      const key = `${p.city.trim().toLowerCase()}-${code}`;
      if (!grouped[key]) {
        grouped[key] = { name: p.city, countryCode: code, ratings: [], postCount: 0 };
      }
      grouped[key].postCount += 1;
      if (p.rating !== undefined && p.rating !== null && p.rating > 0) {
        grouped[key].ratings.push(Number(p.rating));
      }
    });
    return Object.values(grouped);
  }, [posts, userId]);

  // Handle city press (show modal)
  const handleCityPress = (cityName: string, countryCode: string) => {
    setSelectedCity({ name: cityName, countryCode });
    setShowPostsModal(true);
  };

  // Posts for selected city
  const selectedCityPosts = useMemo(() => {
    if (!selectedCity) return [];
    return posts.filter(
      p => p.userId === userId &&
        p.city && p.country &&
        p.city.toLowerCase() === selectedCity.name.toLowerCase() &&
        (countryNameToCode[p.country as keyof typeof countryNameToCode] || p.country).toUpperCase() === selectedCity.countryCode
    );
  }, [posts, selectedCity, userId]);

  return (  
    <SafeAreaView style={{ flex: 1, backgroundColor: '#181C24' }}>
      <View style={[styles.header, { backgroundColor: '#181C24' }]}> 
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <View style={{ width: 38 }} />
      </View>
      <View style={{ height: 0.5, backgroundColor: 'rgba(255,255,255,0.3)', width: '100%' }} />
      {displayCities.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{ color: textColor, opacity: 0.7, fontSize: 16, textAlign: 'center' }}>
            Aucune ville visitée.
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...displayCities].reverse()}
          keyExtractor={(item, idx) => `${item.name || 'city'}-${item.countryCode || 'country'}-${idx}`}
          renderItem={({ item }) => {
            const flagUrl = `https://flagcdn.com/w40/${item.countryCode.toLowerCase()}.png`;
            const avgRating = item.ratings.length > 0 ? (item.ratings.reduce((a, b) => a + b, 0) / item.ratings.length).toFixed(1) : null;
            return (
              <TouchableOpacity
                style={styles.cityCard}
                onPress={() => handleCityPress(item.name, item.countryCode)}
                activeOpacity={0.7}
              >
                <Image source={{ uri: flagUrl }} style={styles.flag} />
                <View style={{ flex: 1 }}>
                  <View style={styles.cityNameRow}>
                    <Text style={styles.cityName}>{item.name}</Text>
                    {avgRating && <Text style={styles.cityRating}>★ {avgRating}</Text>}
                  </View>
                  <Text style={styles.citySourceGray}>{item.postCount > 1 ? `${item.postCount} posts` : '1 post'}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal for city posts */}
      <Modal
        visible={showPostsModal}
        animationType="slide"
        presentationStyle="overFullScreen"
        transparent={true}
        onRequestClose={() => setShowPostsModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: backgroundColor }]}> 
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowPostsModal(false)}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{selectedCity?.name}</Text>
              {selectedCityPosts.length === 0 ? (
                <View style={styles.noPostsContainer}>
                  <Text style={styles.noPostsText}>Aucun post pour cette ville.</Text>
                </View>
              ) : (
                selectedCityPosts.map((post: any) => (
                  <View key={post.id} style={styles.postWrapper}>
                    <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 4 }}>{post.city}</Text>
                    <Text style={{ color: textColor, opacity: 0.8 }}>{post.description}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
    flex: 1,
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#181C24',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 24,
    marginLeft: 20,
  },
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.7,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
  },
  flag: {
    width: 32,
    height: 22,
    borderRadius: 3,
    marginRight: 12,
  },
  cityName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
    flex: 1,
  },
  cityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  cityRating: {
    color: '#FFD700',
    fontSize: 13,
  },
  citySourceGray: {
    color: '#bbb',
    fontSize: 13,
    fontStyle: 'italic',
    marginLeft: 4,
  },
  countryName: {
    fontSize: 14,
    opacity: 0.8,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 15,
    paddingTop: 20,
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalScroll: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  noPostsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noPostsText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  postWrapper: {
    marginBottom: 16,
  },
});
