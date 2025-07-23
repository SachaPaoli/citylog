import { useThemeColor } from '@/hooks/useThemeColor';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Platform,
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

export default function PostScreen() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const beigeColor = '#D4B896';
  
  const [cityName, setCityName] = useState('');
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [rating, setRating] = useState('');
  const [placesVisited, setPlacesVisited] = useState('');
  const [restaurants, setRestaurants] = useState('');
  const [description, setDescription] = useState('');

  // Demander les permissions pour accéder à la galerie
  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à votre galerie pour sélectionner des photos.');
        return false;
      }
    }
    return true;
  };

  // Sélectionner des images depuis la galerie
  const pickImages = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets) {
      const newImages: SelectedImage[] = result.assets.map((asset: any, index: number) => ({
        id: `${Date.now()}_${index}`,
        uri: asset.uri,
      }));
      setSelectedImages(prev => [...prev, ...newImages]);
    }
  };

  // Supprimer une image
  const removeImage = (imageId: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Valider et poster
  const handlePost = () => {
    if (!cityName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom de la ville');
      return;
    }
    if (selectedImages.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins une photo');
      return;
    }
    if (!rating || isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 10) {
      Alert.alert('Erreur', 'Veuillez entrer une note entre 1 et 10');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez ajouter une description');
      return;
    }

    // Ici tu peux ajouter la logique pour sauvegarder le post
    Alert.alert('Succès', 'Votre post a été publié !', [
      {
        text: 'OK',
        onPress: () => {
          // Reset du formulaire
          setCityName('');
          setSelectedImages([]);
          setRating('');
          setPlacesVisited('');
          setRestaurants('');
          setDescription('');
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Titre */}
        <Text style={[styles.title, { color: textColor }]}>
          Créer un nouveau post
        </Text>

        {/* Nom de la ville */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: textColor }]}>Ville visitée *</Text>
          <TextInput
            style={[styles.textInput, { color: textColor, borderColor: beigeColor }]}
            placeholder="Ex: Paris, Londres, Tokyo..."
            placeholderTextColor={`${beigeColor}80`}
            value={cityName}
            onChangeText={setCityName}
          />
        </View>

        {/* Sélection des photos */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: textColor }]}>Photos *</Text>
          
          {/* Bouton pour ajouter des photos */}
          <TouchableOpacity 
            style={[styles.photoButton, { borderColor: beigeColor }]}
            onPress={pickImages}
          >
            <Text style={[styles.photoButtonText, { color: beigeColor }]}>
              Ajouter des photos
            </Text>
          </TouchableOpacity>

          {/* Aperçu des photos sélectionnées */}
          {selectedImages.length > 0 && (
            <ScrollView 
              horizontal 
              style={styles.imagesPreview}
              showsHorizontalScrollIndicator={false}
            >
              {selectedImages.map((image) => (
                <View key={image.id} style={styles.imageContainer}>
                  <Image source={{ uri: image.uri }} style={styles.previewImage} />
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeImage(image.id)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Note */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: textColor }]}>Note (1-10) *</Text>
          <TextInput
            style={[styles.textInput, { color: textColor, borderColor: beigeColor }]}
            placeholder="Ex: 8"
            placeholderTextColor={`${beigeColor}80`}
            value={rating}
            onChangeText={setRating}
            keyboardType="numeric"
            maxLength={2}
          />
        </View>

        {/* Lieux visités */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: textColor }]}>Lieux visités</Text>
          <TextInput
            style={[styles.textAreaInput, { color: textColor, borderColor: beigeColor }]}
            placeholder="Ex: Tour Eiffel, Louvre, Notre-Dame..."
            placeholderTextColor={`${beigeColor}80`}
            value={placesVisited}
            onChangeText={setPlacesVisited}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Restaurants */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: textColor }]}>Restaurants recommandés</Text>
          <TextInput
            style={[styles.textAreaInput, { color: textColor, borderColor: beigeColor }]}
            placeholder="Ex: Le Comptoir du Relais, L'Ami Jean..."
            placeholderTextColor={`${beigeColor}80`}
            value={restaurants}
            onChangeText={setRestaurants}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Description */}
        <View style={[styles.inputSection, styles.lastInputSection]}>
          <Text style={[styles.label, { color: textColor }]}>Description *</Text>
          <TextInput
            style={[styles.textAreaInput, { color: textColor, borderColor: beigeColor }]}
            placeholder="Racontez votre expérience, vos impressions..."
            placeholderTextColor={`${beigeColor}80`}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>
      </ScrollView>

      {/* Bouton fixé en bas */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity 
          style={[styles.postButton, { backgroundColor: beigeColor }]}
          onPress={handlePost}
        >
          <Text style={styles.postButtonText}>
            Publier mon voyage
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 180, // Assez d'espace pour voir complètement le champ description au-dessus du bouton
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputSection: {
    marginBottom: 25,
  },
  lastInputSection: {
    marginBottom: 40, // Plus d'espace avant le bouton fixé
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: 'rgba(212, 184, 150, 0.1)',
  },
  textAreaInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'rgba(212, 184, 150, 0.1)',
    textAlignVertical: 'top',
  },
  photoButton: {
    height: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 184, 150, 0.1)',
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  imagesPreview: {
    marginTop: 15,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#333',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 90, // Au-dessus de la tab bar (environ 80px de hauteur + 10px de marge)
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  postButton: {
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
