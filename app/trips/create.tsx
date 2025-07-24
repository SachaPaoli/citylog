import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Données des pays (comme dans explore)
const countriesData = {
  'France': ['Paris', 'Lyon', 'Marseille', 'Nice', 'Toulouse'],
  'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla'],
  'Italy': ['Rome', 'Milan', 'Naples', 'Turin', 'Florence'],
  'Germany': ['Berlin', 'Munich', 'Hamburg', 'Cologne'],
  'Japan': ['Tokyo', 'Osaka', 'Yokohama', 'Kyoto'],
  'USA': ['New York', 'Los Angeles', 'Chicago', 'Houston'],
};

// Interface pour les posts utilisateur
interface UserPost {
  id: string;
  title: string;
  city: string;
  country: string;
  rating: number;
  image: string;
  description: string;
}

// Données de test des posts utilisateur
const userPosts: UserPost[] = [
  {
    id: '1',
    title: 'Tour Eiffel',
    city: 'Paris',
    country: 'France',
    rating: 9,
    image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=200&h=150&fit=crop',
    description: 'Vue magnifique depuis le sommet'
  },
  {
    id: '2',
    title: 'Louvre',
    city: 'Paris',
    country: 'France',
    rating: 8,
    image: 'https://images.unsplash.com/photo-1566139002512-b2d9b2bd1ce0?w=200&h=150&fit=crop',
    description: 'Musée incroyable avec la Joconde'
  },
  {
    id: '3',
    title: 'Basilique du Sacré-Cœur',
    city: 'Lyon',
    country: 'France',
    rating: 7,
    image: 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=200&h=150&fit=crop',
    description: 'Architecture impressionnante'
  }
];

interface TripPost {
  post: UserPost;
  order: number;
  transportTo?: {
    type: 'walking' | 'car' | 'train' | 'plane' | 'bus';
    duration: string;
  };
}

export default function CreateTripScreen() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const beigeColor = '#E5C9A6';
  
  const [tripTitle, setTripTitle] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<TripPost[]>([]);
  const [step, setStep] = useState<'country' | 'posts' | 'organize'>('country');

  // Filtrer les posts selon le pays sélectionné
  const filteredPosts = selectedCountry 
    ? userPosts.filter(post => post.country === selectedCountry)
    : [];

  const toggleCountry = (country: string) => {
    setExpandedCountry(expandedCountry === country ? null : country);
  };

  const selectCountry = (country: string) => {
    setSelectedCountry(country);
    setStep('posts');
  };

  const togglePost = (post: UserPost) => {
    const isSelected = selectedPosts.some(tp => tp.post.id === post.id);
    
    if (isSelected) {
      setSelectedPosts(selectedPosts.filter(tp => tp.post.id !== post.id));
    } else {
      const newTripPost: TripPost = {
        post,
        order: selectedPosts.length,
        transportTo: selectedPosts.length > 0 ? { type: 'car', duration: '30 min' } : undefined
      };
      setSelectedPosts([...selectedPosts, newTripPost]);
    }
  };

  const movePost = (fromIndex: number, toIndex: number) => {
    const newPosts = [...selectedPosts];
    const [moved] = newPosts.splice(fromIndex, 1);
    newPosts.splice(toIndex, 0, moved);
    
    // Réorganiser les ordres
    const reorderedPosts = newPosts.map((tp, index) => ({
      ...tp,
      order: index,
      transportTo: index > 0 ? tp.transportTo : undefined
    }));
    
    setSelectedPosts(reorderedPosts);
  };

  const updateTransport = (postIndex: number, type: 'walking' | 'car' | 'train' | 'plane' | 'bus', duration: string) => {
    const newPosts = [...selectedPosts];
    if (newPosts[postIndex]) {
      newPosts[postIndex].transportTo = { type, duration };
      setSelectedPosts(newPosts);
    }
  };

  const createTrip = () => {
    if (!tripTitle.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un titre pour votre trip');
      return;
    }
    
    if (selectedPosts.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un post');
      return;
    }

    Alert.alert(
      'Trip créé !',
      `Votre trip "${tripTitle}" a été créé avec ${selectedPosts.length} posts`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const renderCountrySelection = () => (
    <ScrollView style={styles.content}>
      <Text style={[styles.stepTitle, { color: textColor }]}>
        Choisissez un pays pour votre trip
      </Text>
      
      {Object.keys(countriesData).map(country => (
        <View key={country} style={styles.countrySection}>
          <TouchableOpacity 
            style={[styles.countryHeader, { borderColor: beigeColor }]}
            onPress={() => toggleCountry(country)}
          >
            <Text style={[styles.countryName, { color: textColor }]}>{country}</Text>
            <Text style={[styles.expandIcon, { color: beigeColor }]}>
              {expandedCountry === country ? '−' : '+'}
            </Text>
          </TouchableOpacity>
          
          {expandedCountry === country && (
            <View style={styles.citiesContainer}>
              {countriesData[country as keyof typeof countriesData].map(city => (
                <TouchableOpacity
                  key={city}
                  style={[styles.cityButton, { backgroundColor: beigeColor }]}
                  onPress={() => selectCountry(country)}
                >
                  <Text style={styles.cityButtonText}>{city}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderPostSelection = () => (
    <ScrollView style={styles.content}>
      <View style={styles.stepHeader}>
        <TouchableOpacity onPress={() => setStep('country')}>
          <Text style={[styles.backText, { color: beigeColor }]}>← Changer de pays</Text>
        </TouchableOpacity>
        <Text style={[styles.stepTitle, { color: textColor }]}>
          Vos posts en {selectedCountry}
        </Text>
      </View>

      {filteredPosts.length === 0 ? (
        <View style={styles.emptyPosts}>
          <Text style={[styles.emptyPostsText, { color: textColor }]}>
            Vous n'avez aucun post en {selectedCountry}
          </Text>
        </View>
      ) : (
        <>
          {filteredPosts.map(post => {
            const isSelected = selectedPosts.some(tp => tp.post.id === post.id);
            return (
              <TouchableOpacity
                key={post.id}
                style={[
                  styles.postCard,
                  { borderColor: isSelected ? beigeColor : '#333' },
                  isSelected && { backgroundColor: `${beigeColor}20` }
                ]}
                onPress={() => togglePost(post)}
              >
                <Image source={{ uri: post.image }} style={styles.postImage} />
                <View style={styles.postInfo}>
                  <Text style={[styles.postTitle, { color: textColor }]}>{post.title}</Text>
                  <Text style={[styles.postCity, { color: beigeColor }]}>{post.city}</Text>
                  <Text style={[styles.postRating, { color: textColor }]}>⭐ {post.rating}/10</Text>
                </View>
                {isSelected && (
                  <View style={[styles.selectedIndicator, { backgroundColor: beigeColor }]}>
                    <Text style={styles.selectedText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
          
          {selectedPosts.length > 0 && (
            <TouchableOpacity
              style={[styles.organizeButton, { backgroundColor: beigeColor }]}
              onPress={() => setStep('organize')}
            >
              <Text style={styles.organizeButtonText}>
                Organiser mes {selectedPosts.length} posts →
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );

  const renderTripOrganization = () => (
    <ScrollView style={styles.content}>
      <View style={styles.stepHeader}>
        <TouchableOpacity onPress={() => setStep('posts')}>
          <Text style={[styles.backText, { color: beigeColor }]}>← Modifier les posts</Text>
        </TouchableOpacity>
        <Text style={[styles.stepTitle, { color: textColor }]}>
          Organisez votre itinéraire
        </Text>
      </View>

      <TextInput
        style={[styles.titleInput, { color: textColor, borderColor: beigeColor }]}
        placeholder="Titre de votre trip"
        placeholderTextColor="#999"
        value={tripTitle}
        onChangeText={setTripTitle}
      />

      {selectedPosts.map((tripPost, index) => (
        <View key={tripPost.post.id} style={styles.tripPostCard}>
          <View style={styles.tripPostHeader}>
            <Text style={[styles.postOrder, { color: beigeColor }]}>#{index + 1}</Text>
            <View style={styles.moveButtons}>
              {index > 0 && (
                <TouchableOpacity 
                  onPress={() => movePost(index, index - 1)}
                  style={styles.moveButton}
                >
                  <Text style={[styles.moveButtonText, { color: beigeColor }]}>↑</Text>
                </TouchableOpacity>
              )}
              {index < selectedPosts.length - 1 && (
                <TouchableOpacity 
                  onPress={() => movePost(index, index + 1)}
                  style={styles.moveButton}
                >
                  <Text style={[styles.moveButtonText, { color: beigeColor }]}>↓</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.tripPostContent}>
            <Image source={{ uri: tripPost.post.image }} style={styles.tripPostImage} />
            <View style={styles.tripPostInfo}>
              <Text style={[styles.tripPostTitle, { color: textColor }]}>
                {tripPost.post.title}
              </Text>
              <Text style={[styles.tripPostCity, { color: beigeColor }]}>
                {tripPost.post.city}
              </Text>
            </View>
          </View>

          {tripPost.transportTo && (
            <View style={styles.transportSection}>
              <Text style={[styles.transportLabel, { color: textColor }]}>
                Transport vers le prochain lieu:
              </Text>
              <View style={styles.transportOptions}>
                {(['walking', 'car', 'train', 'plane', 'bus'] as const).map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.transportButton,
                      { borderColor: beigeColor },
                      tripPost.transportTo?.type === type && { backgroundColor: beigeColor }
                    ]}
                    onPress={() => updateTransport(index, type, tripPost.transportTo?.duration || '30 min')}
                  >
                    <Text style={[
                      styles.transportButtonText,
                      { color: tripPost.transportTo?.type === type ? '#000' : textColor }
                    ]}>
                      {type === 'walking' ? '🚶' : 
                       type === 'car' ? '🚗' : 
                       type === 'train' ? '🚆' : 
                       type === 'plane' ? '✈️' : '🚌'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={[styles.durationInput, { color: textColor, borderColor: beigeColor }]}
                placeholder="Durée (ex: 30 min)"
                placeholderTextColor="#999"
                value={tripPost.transportTo.duration}
                onChangeText={(duration) => updateTransport(index, tripPost.transportTo!.type, duration)}
              />
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity
        style={[styles.createTripButton, { backgroundColor: beigeColor }]}
        onPress={createTrip}
      >
        <Text style={styles.createTripButtonText}>Créer mon trip</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: textColor }]}>←</Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Nouveau Trip
        </Text>
        
        <View style={styles.headerRight}>
          <Text style={[styles.stepIndicator, { color: beigeColor }]}>
            {step === 'country' ? '1/3' : step === 'posts' ? '2/3' : '3/3'}
          </Text>
        </View>
      </View>

      {step === 'country' && renderCountrySelection()}
      {step === 'posts' && renderPostSelection()}
      {step === 'organize' && renderTripOrganization()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  stepHeader: {
    marginBottom: 20,
  },
  backText: {
    fontSize: 14,
    marginBottom: 12,
  },
  countrySection: {
    marginBottom: 8,
  },
  countryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  countryName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expandIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  citiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  cityButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  cityButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyPosts: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyPostsText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  postCard: {
    flexDirection: 'row',
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    position: 'relative',
  },
  postImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  postInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  postCity: {
    fontSize: 14,
    marginBottom: 4,
  },
  postRating: {
    fontSize: 12,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  organizeButton: {
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
  },
  organizeButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 24,
  },
  tripPostCard: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tripPostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postOrder: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  moveButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  moveButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5C9A6',
    borderRadius: 16,
  },
  moveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tripPostContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tripPostImage: {
    width: 60,
    height: 45,
    borderRadius: 6,
    marginRight: 12,
  },
  tripPostInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  tripPostTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  tripPostCity: {
    fontSize: 12,
  },
  transportSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  transportLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  transportOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  transportButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transportButtonText: {
    fontSize: 16,
  },
  durationInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
  },
  createTripButton: {
    marginTop: 32,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
  },
  createTripButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
