import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

type TabType = 'staying' | 'restaurant' | 'activities' | 'other';

export default function PostScreen() {
  const textColor = useThemeColor({}, 'text');
  const textActiveColor = useThemeColor({}, 'textActive');
  const backgroundColor = useThemeColor({}, 'background');
  const buttonBackgroundColor = useThemeColor({}, 'buttonBackground');
  const borderColor = useThemeColor({}, 'borderColor');
  const headerBackgroundColor = '#808080';
  const scrollBackgroundColor = '#D3D3D3';
  
  // Hooks pour Firebase
  const { createPost } = usePosts();
  const { userProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('staying');
  const [stayingItems, setStayingItems] = useState<TripItem[]>([]);
  const [restaurantItems, setRestaurantItems] = useState<TripItem[]>([]);
  const [activitiesItems, setActivitiesItems] = useState<TripItem[]>([]);
  const [otherItems, setOtherItems] = useState<TripItem[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  
  // Nouveaux champs pour le post
  const [cityName, setCityName] = useState('');
  const [countryName, setCountryName] = useState('');
  const [tripDescription, setTripDescription] = useState('');

  // Réinitialiser le formulaire
  const resetForm = () => {
    setStayingItems([]);
    setRestaurantItems([]);
    setActivitiesItems([]);
    setOtherItems([]);
    setCoverImage(null);
    setCityName('');
    setCountryName('');
    setTripDescription('');
    setActiveTab('staying');
  };

  // Ajouter un nouvel item
  const addNewItem = (tabType: 'staying' | 'restaurant' | 'activities' | 'other') => {
    const newItem: TripItem = {
      id: Date.now().toString(),
      name: '',
      rating: 5,
      description: '',
      images: []
    };

    if (tabType === 'staying') {
      setStayingItems([...stayingItems, newItem]);
    } else if (tabType === 'restaurant') {
      setRestaurantItems([...restaurantItems, newItem]);
    } else if (tabType === 'activities') {
      setActivitiesItems([...activitiesItems, newItem]);
    } else {
      setOtherItems([...otherItems, newItem]);
    }
  };

  // Mettre à jour un item
  const updateItem = (tabType: 'staying' | 'restaurant' | 'activities' | 'other', itemId: string, field: 'name' | 'rating' | 'description', value: string | number) => {
    const updateItems = (items: TripItem[]) =>
      items.map(item => item.id === itemId ? { ...item, [field]: value } : item);

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

  // Ajouter une photo
  const pickImage = async (tabType: 'staying' | 'restaurant' | 'activities' | 'other', itemId: string) => {
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

      const updateItems = (items: TripItem[]) =>
        items.map(item => 
          item.id === itemId 
            ? { ...item, images: [...item.images, newImage] }
            : item
        );

      if (tabType === 'staying') {
        setStayingItems(updateItems(stayingItems));
      } else if (tabType === 'restaurant') {
        setRestaurantItems(updateItems(restaurantItems));
      } else if (tabType === 'activities') {
        setActivitiesItems(updateItems(activitiesItems));
      } else {
        setOtherItems(updateItems(otherItems));
      }
    }
  };

  // Supprimer une photo
  const removeImage = (tabType: 'staying' | 'restaurant' | 'activities' | 'other', itemId: string, imageId: string) => {
    const updateItems = (items: TripItem[]) =>
      items.map(item => 
        item.id === itemId 
          ? { ...item, images: item.images.filter(img => img.id !== imageId) }
          : item
      );

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

  // Supprimer un item
  const removeItem = (tabType: 'staying' | 'restaurant' | 'activities' | 'other', itemId: string) => {
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

  // Calculer la note moyenne
  const calculateAverageRating = () => {
    const allItems = [...stayingItems, ...restaurantItems, ...activitiesItems, ...otherItems];
    if (allItems.length === 0) return 0;
    
    const totalRating = allItems.reduce((sum, item) => sum + item.rating, 0);
    return Math.round((totalRating / allItems.length) * 10) / 10;
  };

  // Sélectionner la photo de couverture
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

  // Poster le voyage
  const handlePost = async () => {
    // Validation
    if (!coverImage) {
      Alert.alert('Photo manquante', 'Veuillez ajouter une photo de couverture pour votre post.');
      return;
    }
    
    if (!cityName.trim() || !countryName.trim()) {
      Alert.alert('Informations manquantes', 'Veuillez renseigner la ville et le pays.');
      return;
    }

    if (!userProfile) {
      Alert.alert('Erreur', 'Vous devez être connecté pour poster.');
      return;
    }

    const averageRating = calculateAverageRating();
    
    try {
      await createPost({
        city: cityName.trim(),
        country: countryName.trim(),
        photo: coverImage,
        rating: averageRating,
        description: tripDescription.trim() || `Voyage à ${cityName}, ${countryName}`,
        stayingItems,
        restaurantItems,
        activitiesItems,
        otherItems,
      });

      Alert.alert(
        'Voyage posté !', 
        `Votre voyage à ${cityName} a été publié avec succès !`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowPostModal(false);
              resetForm(); // Réinitialiser le formulaire
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      Alert.alert('Erreur', 'Impossible de publier votre voyage. Veuillez réessayer.');
    }
  };

  // Contenu de chaque onglet
  const renderTabContent = () => {
    const currentItems = activeTab === 'staying' ? stayingItems : 
                        activeTab === 'restaurant' ? restaurantItems : 
                        activeTab === 'activities' ? activitiesItems : otherItems;

    return (
      <View style={styles.tabContent}>
        {currentItems.map(item => (
          <View key={item.id} style={[styles.itemCard, { borderColor: borderColor }]}>
            {/* Bouton supprimer */}
            <TouchableOpacity 
              style={[styles.deleteItemButton, { backgroundColor: textActiveColor }]}
              onPress={() => removeItem(activeTab as 'staying' | 'restaurant' | 'activities' | 'other', item.id)}
            >
              <Text style={styles.deleteItemText}>×</Text>
            </TouchableOpacity>

            {/* Photos */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
              {item.images.map(image => (
                <View key={image.id} style={styles.imageContainer}>
                  <Image source={{ uri: image.uri }} style={styles.itemImage} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => removeImage(activeTab as 'staying' | 'restaurant' | 'activities' | 'other', item.id, image.id)}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity 
                style={[styles.addImageButton, { borderColor: borderColor }]}
                onPress={() => pickImage(activeTab as 'staying' | 'restaurant' | 'activities' | 'other', item.id)}
              >
                <Text style={[styles.addImageText, { color: textActiveColor }]}>+</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Nom */}
            <TextInput
              style={[styles.nameInput, { color: textColor, borderColor: borderColor }]}
              placeholder={`Nom ${activeTab === 'staying' ? 'du logement' : 
                             activeTab === 'restaurant' ? 'du restaurant' : 
                             activeTab === 'activities' ? 'de l\'activité' : 'de l\'autre'}`}
              placeholderTextColor="#999"
              value={item.name}
              onChangeText={(text) => updateItem(activeTab as 'staying' | 'restaurant' | 'activities' | 'other', item.id, 'name', text)}
            />

            {/* Note */}
            <View style={styles.ratingContainer}>
              <Text style={[styles.ratingLabel, { color: textColor }]}>Note sur 10:</Text>
              <View style={styles.ratingButtonsGrid}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingButton, 
                      { borderColor: borderColor },
                      item.rating === rating && { backgroundColor: textActiveColor }
                    ]}
                    onPress={() => updateItem(activeTab as 'staying' | 'restaurant' | 'activities' | 'other', item.id, 'rating', rating)}
                  >
                    <Text style={[
                      styles.ratingButtonText,
                      { color: item.rating === rating ? '#000' : textColor }
                    ]}>
                      {rating}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description */}
            <TextInput
              style={[styles.descriptionInput, { color: textColor, borderColor: borderColor }]}
              placeholder="Description (optionnelle)"
              placeholderTextColor="#999"
              value={item.description}
              onChangeText={(text) => updateItem(activeTab as 'staying' | 'restaurant' | 'activities' | 'other', item.id, 'description', text)}
              multiline
              numberOfLines={3}
            />
          </View>
        ))}

        {/* Bouton ajouter */}
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: textActiveColor }]}
          onPress={() => addNewItem(activeTab as 'staying' | 'restaurant' | 'activities' | 'other')}
        >
          <Text style={styles.addButtonText}>
            + Ajouter {activeTab === 'staying' ? 'un logement' : 
                      activeTab === 'restaurant' ? 'un restaurant' : 
                      activeTab === 'activities' ? 'une activité' : 'autre chose'}
          </Text>
        </TouchableOpacity>

        {/* Espacement pour le bouton flottant */}
        <View style={styles.bottomSpacing} />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Onglets */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>Nouveau Voyage</Text>
        <View style={styles.tabsContainer}>
          {(['staying', 'restaurant', 'activities', 'other'] as TabType[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && { borderBottomColor: borderColor }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? textActiveColor : textColor }]}>
                {tab === 'staying' ? 'Staying' : 
                 tab === 'restaurant' ? 'Restaurant' : 
                 tab === 'activities' ? 'Activities' : 'Other'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Ligne de séparation grise */}
      <View style={styles.separatorContainer}>
        <View style={[styles.separatorLine, { backgroundColor: '#333333' }]} />
      </View>

      {/* Contenu */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>

      {/* Bouton flottant */}
      <TouchableOpacity 
        style={[styles.floatingButton, { backgroundColor: textActiveColor }]}
        onPress={() => setShowPostModal(true)}
      >
        <Text style={styles.floatingButtonText}>Log your city</Text>
      </TouchableOpacity>

      {/* Modal de post */}
      <Modal
        visible={showPostModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPostModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowPostModal(false)}
              >
                <Text style={[styles.closeButtonText, { color: textColor }]}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.postModalContent}>
              <Text style={[styles.postTitle, { color: textColor }]}>
                Post when you finished your visit!
              </Text>
              
              {/* Photo de couverture */}
              <View style={styles.coverImageSection}>
                <Text style={[styles.coverImageLabel, { color: textColor }]}>
                  Photo de couverture:
                </Text>
                {coverImage ? (
                  <View style={styles.coverImageContainer}>
                    <Image source={{ uri: coverImage }} style={styles.coverImage} />
                    <TouchableOpacity 
                      style={styles.removeCoverImageButton}
                      onPress={() => setCoverImage(null)}
                    >
                      <Text style={styles.removeCoverImageText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={[styles.addCoverImageButton, { borderColor: borderColor }]}
                    onPress={pickCoverImage}
                  >
                    <Text style={[styles.addCoverImageText, { color: textActiveColor }]}>+ Ajouter une photo</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Ville et Pays */}
              <View style={styles.locationSection}>
                <Text style={[styles.locationLabel, { color: textColor }]}>
                  Ville et Pays:
                </Text>
                <View style={styles.locationInputs}>
                  <TextInput
                    style={[styles.locationInput, { color: textColor, borderColor: borderColor }]}
                    placeholder="Ville"
                    placeholderTextColor="#666"
                    value={cityName}
                    onChangeText={setCityName}
                  />
                  <TextInput
                    style={[styles.locationInput, { color: textColor, borderColor: borderColor }]}
                    placeholder="Pays"
                    placeholderTextColor="#666"
                    value={countryName}
                    onChangeText={setCountryName}
                  />
                </View>
              </View>

              {/* Description optionnelle */}
              <View style={styles.descriptionSection}>
                <Text style={[styles.descriptionLabel, { color: textColor }]}>
                  Description (optionnelle):
                </Text>
                <TextInput
                  style={[styles.descriptionTextArea, { color: textColor, borderColor: borderColor }]}
                  placeholder="Racontez votre voyage..."
                  placeholderTextColor="#666"
                  value={tripDescription}
                  onChangeText={setTripDescription}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.averageRatingContainer}>
                <Text style={[styles.averageRatingLabel, { color: textColor }]}>
                  Note finale:
                </Text>
                <Text style={[styles.averageRating, { color: textActiveColor }]}>
                  {calculateAverageRating()}/10
                </Text>
              </View>
            </View>
            
            {/* Bouton flottant dans le modal */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalPostButton, { backgroundColor: textActiveColor }]} onPress={handlePost}>
                <Text style={styles.modalPostButtonText}>Poster le voyage</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 0,
    paddingVertical: 12,
    paddingBottom: 5, // Réduire l'espace vers la ligne
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingBottom: 20,
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
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 31, // Ajouter de l'espace après la ligne (16 + 15 = 31)
  },
  tabContent: {
    flex: 1,
  },
  itemCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagesContainer: {
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 8,
  },
  itemImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 80,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    height: 80,
    textAlignVertical: 'top',
  },
  ratingContainer: {
    flexDirection: 'column',
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  ratingButtons: {
    flexDirection: 'row',
  },
  ratingButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  ratingButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    width: '18%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  postTabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  postTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
  },
  averageRatingContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  averageRatingLabel: {
    fontSize: 18,
    marginBottom: 8,
  },
  averageRating: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  postButton: {
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    left: '50%',
    transform: [{ translateX: -75 }],
    backgroundColor: '#E5C9A6',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 15,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  postModalContent: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  modalButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: 'transparent',
  },
  modalPostButton: {
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalPostButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 120,
  },
  coverImageSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  coverImageLabel: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  coverImageContainer: {
    position: 'relative',
  },
  coverImage: {
    width: 160,
    height: 90,
    borderRadius: 12,
  },
  removeCoverImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeCoverImageText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addCoverImageButton: {
    width: 160,
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  addCoverImageText: {
    fontSize: 16,
    fontWeight: '600',
  },
  separatorContainer: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  separatorLine: {
    height: 0.5,
    width: '100%',
  },
  locationSection: {
    marginBottom: 15,
  },
  locationLabel: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  locationInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  locationInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  descriptionSection: {
    marginBottom: 15,
  },
  descriptionLabel: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  descriptionTextArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    height: 60,
    textAlignVertical: 'top',
  },
});
