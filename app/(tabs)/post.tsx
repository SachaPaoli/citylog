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
  const backgroundColor = useThemeColor({}, 'background');
  const beigeColor = '#D4B896';
  
  const [activeTab, setActiveTab] = useState<TabType>('staying');
  const [stayingItems, setStayingItems] = useState<TripItem[]>([]);
  const [restaurantItems, setRestaurantItems] = useState<TripItem[]>([]);
  const [activitiesItems, setActivitiesItems] = useState<TripItem[]>([]);
  const [otherItems, setOtherItems] = useState<TripItem[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);

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

  // Poster le voyage
  const handlePost = () => {
    const averageRating = calculateAverageRating();
    Alert.alert(
      'Voyage posté !', 
      `Votre voyage a été publié avec une note moyenne de ${averageRating}/10`
    );
    setShowPostModal(false);
  };

  // Contenu de chaque onglet
  const renderTabContent = () => {
    const currentItems = activeTab === 'staying' ? stayingItems : 
                        activeTab === 'restaurant' ? restaurantItems : 
                        activeTab === 'activities' ? activitiesItems : otherItems;

    return (
      <View style={styles.tabContent}>
        {currentItems.map(item => (
          <View key={item.id} style={[styles.itemCard, { borderColor: beigeColor }]}>
            {/* Bouton supprimer */}
            <TouchableOpacity 
              style={[styles.deleteItemButton, { backgroundColor: beigeColor }]}
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
                style={[styles.addImageButton, { borderColor: beigeColor }]}
                onPress={() => pickImage(activeTab as 'staying' | 'restaurant' | 'activities' | 'other', item.id)}
              >
                <Text style={[styles.addImageText, { color: beigeColor }]}>+</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Nom */}
            <TextInput
              style={[styles.nameInput, { color: textColor, borderColor: beigeColor }]}
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
                      { borderColor: beigeColor },
                      item.rating === rating && { backgroundColor: beigeColor }
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
              style={[styles.descriptionInput, { color: textColor, borderColor: beigeColor }]}
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
          style={[styles.addButton, { backgroundColor: beigeColor }]}
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
              style={[styles.tab, activeTab === tab && { borderBottomColor: beigeColor }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? beigeColor : textColor }]}>
                {tab === 'staying' ? 'Staying' : 
                 tab === 'restaurant' ? 'Restaurant' : 
                 tab === 'activities' ? 'Activities' : 'Other'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Contenu */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>

      {/* Bouton flottant */}
      <TouchableOpacity 
        style={[styles.floatingButton, { backgroundColor: beigeColor }]}
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
              <View style={styles.averageRatingContainer}>
                <Text style={[styles.averageRatingLabel, { color: textColor }]}>
                  Note moyenne:
                </Text>
                <Text style={[styles.averageRating, { color: beigeColor }]}>
                  {calculateAverageRating()}/10
                </Text>
              </View>
              <TouchableOpacity style={[styles.postButton, { backgroundColor: beigeColor }]} onPress={handlePost}>
                <Text style={styles.postButtonText}>Poster le voyage</Text>
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
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginHorizontal: -4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
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
    marginBottom: 40,
  },
  averageRatingContainer: {
    alignItems: 'center',
    marginBottom: 40,
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
    backgroundColor: '#D4B896',
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
    height: '75%',
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  bottomSpacing: {
    height: 120,
  },
});
