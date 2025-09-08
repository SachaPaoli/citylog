import { StarRating } from '@/components/StarRating';
import { getCountryName } from '@/constants/CountryNames';
import { useThemeColor } from '@/hooks/useThemeColor';
import { RealCitiesService } from '@/services/RealCitiesService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types
interface SelectedImage {
  id: string;
  uri: string;
}

interface TripItem {
  id: string;
  name: string;
  rating: number;
  description: string;
  images: SelectedImage[];
}

type PostTabType = 'staying' | 'restaurant' | 'activities' | 'other';

const DRAFT_KEY = 'post_draft';

export default function NewCityScreen() {
  const params = useLocalSearchParams();
  const editMode = params.editMode === 'true';
  const tripData = params.tripData ? JSON.parse(params.tripData as string) : null;

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textActiveColor = useThemeColor({}, 'textActive');
  const borderColor = useThemeColor({}, 'borderColor');

  // Form states - initialize with existing data if in edit mode
  const [cityName, setCityName] = useState(editMode && tripData ? tripData.city : '');
  const [countryName, setCountryName] = useState(editMode && tripData ? tripData.country : '');
  const [coverImage, setCoverImage] = useState<string | null>(editMode && tripData ? tripData.coverImage : null);
  const [tripDescription, setTripDescription] = useState(editMode && tripData ? tripData.description : '');
  const [isPublic, setIsPublic] = useState(true);
  const publicPrivateAnimation = useState(new Animated.Value(1))[0];
  const [isSaving, setIsSaving] = useState(false);

  // City search states
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Post tab states
  const [postActiveTab, setPostActiveTab] = useState<PostTabType>('staying');
  const [stayingItems, setStayingItems] = useState<TripItem[]>(editMode && tripData?.stayingItems ? tripData.stayingItems : []);
  const [restaurantItems, setRestaurantItems] = useState<TripItem[]>(editMode && tripData?.restaurantItems ? tripData.restaurantItems : []);
  const [activitiesItems, setActivitiesItems] = useState<TripItem[]>(editMode && tripData?.activitiesItems ? tripData.activitiesItems : []);
  const [otherItems, setOtherItems] = useState<TripItem[]>(editMode && tripData?.otherItems ? tripData.otherItems : []);

  // Modal states
  const [showItemModal, setShowItemModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [currentItemType, setCurrentItemType] = useState<PostTabType>('staying');
  const [tempItem, setTempItem] = useState<TripItem>({ id: '', name: '', rating: 0, description: '', images: [] });
  const [editingItem, setEditingItem] = useState<TripItem | null>(null);

  // Load draft on mount (only if not in edit mode)
  useEffect(() => {
    if (!editMode) {
      loadDraft();
    }
  }, [editMode]);

  // City search effect
  useEffect(() => {
    searchCities(cityName);
  }, [cityName]);

  // Fonction pour normaliser les chaînes
  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  };

  // Recherche de villes instantanée
  const searchCities = async (query: string) => {
    if (query.length <= 1) {
      setCitySuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const results = await RealCitiesService.searchCities(query, 10);
      
      const uniqueCities = [];
      const seen = new Set();
      for (const city of results) {
        const key = `${normalizeString(city.name)}-${normalizeString(city.country)}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueCities.push(city);
        }
      }
      
      const normalizedQuery = normalizeString(query);
      const sortedCities = uniqueCities.sort((a, b) => {
        const aExact = normalizeString(a.name) === normalizedQuery;
        const bExact = normalizeString(b.name) === normalizedQuery;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        const popA = typeof a.population === 'number' ? a.population : 0;
        const popB = typeof b.population === 'number' ? b.population : 0;
        return popB - popA;
      });
      
      setCitySuggestions(sortedCities);
      setShowSuggestions(true);
    } catch {
      setCitySuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectCity = (city: any) => {
    setCityName(city.name);
    setCountryName(city.country);
    setShowSuggestions(false);
    setCitySuggestions([]);
    setIsSearchFocused(false);
    Keyboard.dismiss();
  };

  const loadDraft = async () => {
    try {
      const draft = await AsyncStorage.getItem(DRAFT_KEY);
      if (draft) {
        const data = JSON.parse(draft);
        setCityName(data.cityName || '');
        setCountryName(data.countryName || '');
        setCoverImage(data.coverImage || null);
        setTripDescription(data.tripDescription || '');
        setIsPublic(data.isPublic ?? true);
        setStayingItems(data.stayingItems || []);
        setRestaurantItems(data.restaurantItems || []);
        setActivitiesItems(data.activitiesItems || []);
        setOtherItems(data.otherItems || []);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const saveDraft = async () => {
    try {
      const draftData = {
        cityName,
        countryName,
        coverImage,
        tripDescription,
        isPublic,
        stayingItems,
        restaurantItems,
        activitiesItems,
        otherItems,
      };
      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  // Save draft when data changes
  useEffect(() => {
    saveDraft();
  }, [cityName, countryName, coverImage, tripDescription, isPublic, stayingItems, restaurantItems, activitiesItems, otherItems]);

  useEffect(() => {
    Animated.timing(publicPrivateAnimation, {
      toValue: isPublic ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isPublic, publicPrivateAnimation]);

  const resetForm = () => {
    setCityName('');
    setCountryName('');
    setCoverImage(null);
    setTripDescription('');
    setIsPublic(true);
    publicPrivateAnimation.setValue(1);
    setStayingItems([]);
    setRestaurantItems([]);
    setActivitiesItems([]);
    setOtherItems([]);
    setPostActiveTab('staying');
    AsyncStorage.removeItem(DRAFT_KEY);
  };

  // Item management functions
  const openAddItemModal = (tabType: PostTabType) => {
    setCurrentItemType(tabType);
    setTempItem({ id: '', name: '', rating: 0, description: '', images: [] });
    setEditingItem(null);
    setShowItemModal(true);
  };

  const openEditItemModal = (item: TripItem, tabType: PostTabType) => {
    setCurrentItemType(tabType);
    setTempItem({ ...item });
    setEditingItem(item);
    setShowItemModal(true);
  };

  const saveItem = () => {
    if (!tempItem.name.trim()) {
      Alert.alert('Error', 'Please enter a name.');
      return;
    }

    const itemToSave = {
      ...tempItem,
      id: tempItem.id || Date.now().toString(),
      name: tempItem.name.trim(),
    };

    if (editingItem) {
      updateItemInList(currentItemType, itemToSave);
    } else {
      addItemToList(currentItemType, itemToSave);
    }

    setShowItemModal(false);
    setTempItem({ id: '', name: '', rating: 0, description: '', images: [] });
    setEditingItem(null);
  };

  const addItemToList = (tabType: PostTabType, item: TripItem) => {
    if (tabType === 'staying') {
      setStayingItems([...stayingItems, item]);
    } else if (tabType === 'restaurant') {
      setRestaurantItems([...restaurantItems, item]);
    } else if (tabType === 'activities') {
      setActivitiesItems([...activitiesItems, item]);
    } else {
      setOtherItems([...otherItems, item]);
    }
  };

  const updateItemInList = (tabType: PostTabType, updatedItem: TripItem) => {
    const updateItems = (items: TripItem[]) =>
      items.map(item => item.id === updatedItem.id ? updatedItem : item);

    if (tabType === 'staying') {
      setStayingItems(updateItems(stayingItems));
    } else if (tabType === 'restaurant') {
      setRestaurantItems(updateItems(restaurantItems));
    } else if (tabType === 'activities') {
      setActivitiesItems(updateItems(activitiesItems));
    } else {
      setOtherItems(updateItems(otherItems));
    }
  };

  const removeItem = (tabType: PostTabType, itemId: string) => {
    if (tabType === 'staying') {
      setStayingItems(stayingItems.filter(item => item.id !== itemId));
    } else if (tabType === 'restaurant') {
      setRestaurantItems(restaurantItems.filter(item => item.id !== itemId));
    } else if (tabType === 'activities') {
      setActivitiesItems(activitiesItems.filter(item => item.id !== itemId));
    } else {
      setOtherItems(otherItems.filter(item => item.id !== itemId));
    }
  };

  // Image functions
  const pickImageForTempItem = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const newImage: SelectedImage = {
        id: Date.now().toString(),
        uri: result.assets[0].uri
      };

      setTempItem(prev => ({
        ...prev,
        images: [...prev.images, newImage]
      }));
    }
  };

  const removeImageFromTempItem = (imageId: string) => {
    setTempItem(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const pickCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setCoverImage(result.assets[0].uri);
    }
  };

  // Calculate average rating
  const calculateAverageRating = () => {
    const allItems = [...stayingItems, ...restaurantItems, ...activitiesItems, ...otherItems];
    if (allItems.length === 0) return 0;
    
    const totalRating = allItems.reduce((sum, item) => sum + item.rating, 0);
    return Math.round((totalRating / allItems.length) * 10) / 10;
  };

  // Handle post
  const handlePost = async () => {
    if (!coverImage || !cityName.trim() || !countryName.trim()) {
      Alert.alert('Error', 'Please select a city and add a cover photo.');
      return;
    }

    const averageRating = calculateAverageRating();
    const fullCountryName = getCountryName(countryName.trim());

    setShowPostModal(false);

    // Create trip data
    const updatedTripData = {
      id: editMode && tripData ? tripData.id : `trip-${Date.now()}`,
      city: cityName.trim(),
      country: fullCountryName,
      coverImage: coverImage,
      rating: averageRating,
      description: tripDescription.trim() || `Trip to ${cityName}, ${fullCountryName}`,
      stayingItems,
      restaurantItems,
      activitiesItems,
      otherItems,
      isPublic,
      createdAt: editMode && tripData ? tripData.createdAt : Date.now()
    };

    try {
      // Save to AsyncStorage
      const existingTrips = await AsyncStorage.getItem('local_trips');
      const trips = existingTrips ? JSON.parse(existingTrips) : [];
      
      if (editMode && tripData) {
        // Update existing trip
        const tripIndex = trips.findIndex((trip: any) => trip.id === tripData.id);
        if (tripIndex !== -1) {
          trips[tripIndex] = updatedTripData;
        }
      } else {
        // Add new trip
        trips.push(updatedTripData);
      }
      
      await AsyncStorage.setItem('local_trips', JSON.stringify(trips));

      console.log('✅ Trip saved locally:', updatedTripData);
      
      // Remove draft
      await AsyncStorage.removeItem(DRAFT_KEY);
      
      // Return to create page
      router.push('/trips/create');
    } catch (error) {
      console.error('❌ Local save error:', error);
      Alert.alert('Error', 'Unable to save trip.');
    }

    resetForm();
  };

  // Render post tab content
  const renderPostTabContent = () => {
    const currentItems = postActiveTab === 'staying' ? stayingItems : 
                        postActiveTab === 'restaurant' ? restaurantItems : 
                        postActiveTab === 'activities' ? activitiesItems : otherItems;

    return (
      <View style={styles.tabContent}>
        {currentItems.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.itemCard, { borderColor: borderColor }]}
            onPress={() => openEditItemModal(item, postActiveTab)}
          >
            <TouchableOpacity 
              style={[styles.deleteItemButton, { backgroundColor: '#5784BA' }]}
              onPress={(e) => {
                e.stopPropagation();
                removeItem(postActiveTab, item.id);
              }}
            >
              <Text style={styles.deleteItemText}>×</Text>
            </TouchableOpacity>

            <View style={styles.cardImageContainer}>
              {item.images.length > 0 ? (
                <Image source={{ uri: item.images[0].uri }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardImagePlaceholder, { borderColor: borderColor }]}>
                  <Text style={[styles.cardImagePlaceholderText, { color: textColor }]}>📷</Text>
                </View>
              )}
            </View>

            <View style={styles.cardInfo}>
              <Text style={[styles.cardName, { color: textColor }]} numberOfLines={1}>
                {item.name || `${postActiveTab === 'staying' ? 'Accommodation' : 
                               postActiveTab === 'restaurant' ? 'Restaurant' : 
                               postActiveTab === 'activities' ? 'Activity' : 'Other'} without name`}
              </Text>
              <View style={[styles.cardRating, { alignItems: 'flex-start' }]}>
                <StarRating rating={item.rating} readonly size="small" showRating={false} color="#f5c518" />
              </View>
              {item.images.length > 1 && (
                <Text style={[styles.cardImageCount, { color: textColor }]}>
                  +{item.images.length - 1} photo{item.images.length > 2 ? 's' : ''}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          style={[styles.addItemButton, { borderColor: borderColor }]}
          onPress={() => openAddItemModal(postActiveTab)}
        >
          <Text style={[styles.addItemText, { color: textColor }]}>+</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: '#181C24' }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: '#181C24' }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: '#fff' }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: '#fff' }]}>
            {editMode ? 'Edit City' : 'New City'}
          </Text>
          <TouchableOpacity
            style={styles.postButton}
            onPress={() => setShowPostModal(true)}
          >
            <Text style={styles.postButtonText}>{editMode ? 'Update' : 'Post'}</Text>
          </TouchableOpacity>
        </View>

        {isSearchFocused ? (
          /* Mode recherche focalisée */
          <View style={styles.searchContainer}>
            <View style={styles.searchHeader}>
              <TouchableOpacity
                style={styles.searchBackButton}
                onPress={() => {
                  setIsSearchFocused(false);
                  setShowSuggestions(false);
                  Keyboard.dismiss();
                }}
              >
                <Text style={[styles.backButtonText, { color: '#fff' }]}>←</Text>
              </TouchableOpacity>
              <View style={styles.searchInputContainer}>
                <TextInput
                  style={[styles.searchInput, { color: '#fff', borderColor: borderColor }]}
                  value={cityName}
                  onChangeText={(text) => {
                    setCityName(text);
                    if (text.length > 1) {
                      setShowSuggestions(true);
                    } else {
                      setShowSuggestions(false);
                    }
                  }}
                  placeholder="Search for a city..."
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  autoFocus={true}
                />
                {cityName.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => {
                      setCityName('');
                      setCountryName('');
                      setCitySuggestions([]);
                      setShowSuggestions(false);
                    }}
                  >
                    <Text style={styles.clearButtonText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {showSuggestions && citySuggestions.length > 0 && (
              <ScrollView style={styles.searchResults}>
                {citySuggestions.map((city, index) => {
                  let countryDisplay = city.countryFull || city.country;
                  if (city.countryCode && city.countryCode.length === 2) {
                    countryDisplay = city.country;
                  }
                  return (
                    <TouchableOpacity
                      key={`${city.name}-${countryDisplay}-${index}`}
                      style={styles.searchResultItem}
                      onPress={() => selectCity(city)}
                    >
                      <Image
                        source={{ uri: `https://flagcdn.com/w40/${city.countryCode?.toLowerCase()}.png` }}
                        style={styles.searchResultFlag}
                        resizeMode="cover"
                      />
                      <View style={styles.searchResultText}>
                        <Text style={styles.searchResultCityName}>{city.name}</Text>
                        <Text style={styles.searchResultCountryName}>{countryDisplay}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        ) : (
          /* Mode formulaire normal */
          <ScrollView style={[styles.scrollContent, { backgroundColor: '#181C24' }]}>
            {/* Cover Image Section */}
            <View style={styles.coverSection}>
              <Text style={[styles.sectionTitle, { color: '#fff' }]}>Cover photo</Text>
              {coverImage ? (
                <View style={styles.coverImageContainer}>
                  <Image source={{ uri: coverImage }} style={styles.coverImage} />
                  <TouchableOpacity
                    style={styles.removeCoverButton}
                    onPress={() => setCoverImage(null)}
                  >
                    <Text style={styles.removeCoverText}>×</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.addCoverButton, { borderColor: borderColor }]}
                  onPress={pickCoverImage}
                >
                  <Text style={[styles.addCoverText, { color: textColor }]}>Add a photo</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* City Info Section */}
            <View style={styles.infoSection}>
              <Text style={[styles.sectionTitle, { color: '#fff' }]}>Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: '#fff' }]}>City</Text>
                <TouchableOpacity
                  style={[styles.textInput, { borderColor: borderColor, justifyContent: 'center' }]}
                  onPress={() => setIsSearchFocused(true)}
                >
                  <Text style={[{ color: cityName ? '#fff' : 'rgba(255,255,255,0.5)', fontSize: 16 }]}>
                    {cityName ? `${cityName}, ${countryName}` : 'City name'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: '#fff' }]}>Description</Text>
                <TextInput
                  style={[styles.textArea, { color: '#fff', borderColor: borderColor }]}
                  value={tripDescription}
                  onChangeText={setTripDescription}
                  placeholder="Describe your trip..."
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

          {/* Post Tabs Section */}
          <View style={styles.postSection}>
            <Text style={[styles.sectionTitle, { color: '#fff' }]}>Trip details</Text>
            
            {/* Tab Headers */}
            <View style={styles.tabHeader}>
              {(['staying', 'restaurant', 'activities', 'other'] as PostTabType[]).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tabButton,
                    postActiveTab === tab && styles.activeTabButton
                  ]}
                  onPress={() => setPostActiveTab(tab)}
                >
                  <Text style={[
                    styles.tabButtonText,
                    { color: postActiveTab === tab ? '#fff' : 'rgba(255,255,255,0.6)' }
                  ]}>
                    {tab === 'staying' ? '🏠' :
                     tab === 'restaurant' ? '🍽️' :
                     tab === 'activities' ? '🎯' : '📝'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tab Content */}
            {renderPostTabContent()}
          </View>
        </ScrollView>
        )}

        {/* Item Modal */}
        <Modal
          visible={showItemModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowItemModal(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: '#181C24' }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: '#fff' }]}>
                    {editingItem ? 'Edit' : 'Add'} an item
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowItemModal(false)}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: '#fff' }]}>Name</Text>
                    <TextInput
                      style={[styles.textInput, { color: '#fff', borderColor: borderColor }]}
                      value={tempItem.name}
                      onChangeText={(text) => setTempItem(prev => ({ ...prev, name: text }))}
                      placeholder="Item name"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: '#fff' }]}>Rating</Text>
                    <View style={styles.ratingContainer}>
                      <StarRating
                        rating={tempItem.rating}
                        onRatingChange={(rating) => setTempItem(prev => ({ ...prev, rating }))}
                        size="medium"
                        color="#f5c518"
                        showRating={true}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: '#fff' }]}>Description</Text>
                    <TextInput
                      style={[styles.textArea, { color: '#fff', borderColor: borderColor }]}
                      value={tempItem.description}
                      onChangeText={(text) => setTempItem(prev => ({ ...prev, description: text }))}
                      placeholder="Description..."
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: '#fff' }]}>Photos</Text>
                    <View style={styles.imagesContainer}>
                      {tempItem.images.map((image) => (
                        <View key={image.id} style={styles.imageItem}>
                          <Image source={{ uri: image.uri }} style={styles.itemImage} />
                          <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => removeImageFromTempItem(image.id)}
                          >
                            <Text style={styles.removeImageText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                      <TouchableOpacity
                        style={[styles.addImageButton, { borderColor: borderColor }]}
                        onPress={pickImageForTempItem}
                      >
                        <Text style={[styles.addImageText, { color: textColor }]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: '#5784BA' }]}
                    onPress={saveItem}
                  >
                    <Text style={styles.saveButtonText}>
                      {editingItem ? 'Update' : 'Add'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Post Modal */}
        <Modal
          visible={showPostModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowPostModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: '#181C24' }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: '#fff' }]}>
                  {editMode ? 'Update trip' : 'Publish trip'}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowPostModal(false)}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.summaryContainer}>
                  <Text style={[styles.summaryTitle, { color: '#fff' }]}>
                    {cityName}, {getCountryName(countryName)}
                  </Text>
                  <Text style={[styles.summaryRating, { color: '#f5c518' }]}>
                    ⭐ {calculateAverageRating()}/5
                  </Text>
                </View>

                <View style={styles.privacyContainer}>
                  <Text style={[styles.privacyLabel, { color: '#fff' }]}>Visibility</Text>
                  <TouchableOpacity
                    style={[styles.privacyToggle, { backgroundColor: isPublic ? '#5784BA' : '#666' }]}
                    onPress={() => setIsPublic(!isPublic)}
                  >
                    <Text style={styles.privacyToggleText}>
                      {isPublic ? 'Public' : 'Private'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: '#5784BA' }]}
                  onPress={handlePost}
                >
                  <Text style={styles.saveButtonText}>
                    {editMode ? 'Update' : 'Publish'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
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
    borderBottomColor: '#444',
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
    flex: 1,
    textAlign: 'center',
  },
  postButton: {
    backgroundColor: '#5784BA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollContent: {
    flex: 1,
  },
  coverSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  coverImageContainer: {
    position: 'relative',
    alignSelf: 'center',
  },
  coverImage: {
    width: 300,
    height: 200,
    borderRadius: 12,
  },
  removeCoverButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeCoverText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addCoverButton: {
    height: 200,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCoverText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  postSection: {
    padding: 16,
  },
  tabHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#5784BA',
  },
  tabButtonText: {
    fontSize: 24,
  },
  tabContent: {
    minHeight: 100,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    position: 'relative',
  },
  deleteItemButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  deleteItemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardImageContainer: {
    marginRight: 12,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  cardImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImagePlaceholderText: {
    fontSize: 20,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardRating: {
    marginBottom: 4,
  },
  cardImageCount: {
    fontSize: 12,
    opacity: 0.7,
  },
  addItemButton: {
    height: 80,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addItemText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  ratingContainer: {
    alignItems: 'flex-start',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageItem: {
    position: 'relative',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryRating: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  privacyContainer: {
    alignItems: 'center',
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  privacyToggle: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  privacyToggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    marginTop: 8,
    backgroundColor: '#181C24',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 100,
    maxHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionFlag: {
    width: 22,
    height: 16,
    borderRadius: 3,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: '#181C24',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  searchBackButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    paddingRight: 44,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  searchResultFlag: {
    width: 32,
    height: 24,
    borderRadius: 4,
    marginRight: 12,
  },
  searchResultText: {
    flex: 1,
  },
  searchResultCityName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  searchResultCountryName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
});
