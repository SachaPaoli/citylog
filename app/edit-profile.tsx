import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FirebaseStorageService } from '@/services/FirebaseStorageService';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const { userProfile, updateUserProfile } = useAuth();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const beigeColor = '#fff';

  // États locaux pour l'édition
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [profilePhoto, setProfilePhoto] = useState(
    userProfile?.photoURL || '' // Pas de photo par défaut
  );
  const [bio, setBio] = useState(''); // Nouvelle fonctionnalité bio
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    try {
      // Demander la permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder à vos photos.');
        return;
      }

      // Lancer le sélecteur d'images
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Upload vers Firebase Storage au lieu de stocker localement
        setIsLoading(true);
        try {
          console.log('📸 Upload de la photo de profil vers Firebase Storage...');
          const firebaseUrl = await FirebaseStorageService.uploadProfilePhoto(
            result.assets[0].uri, 
            userProfile?.uid || 'unknown'
          );
          setProfilePhoto(firebaseUrl);
          console.log('✅ Photo de profil uploadée:', firebaseUrl);
        } catch (error) {
          console.error('❌ Erreur upload photo profil:', error);
          Alert.alert('Erreur', 'Impossible d\'uploader la photo. Vérifiez votre connexion.');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sélection d\'image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image.');
    }
  };

  const saveProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Erreur', 'Le nom ne peut pas être vide.');
      return;
    }

    setIsLoading(true);
    try {
      // Ici tu peux ajouter la logique pour sauvegarder dans Firebase
      // Pour l'instant on simule juste la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mettre à jour le profil dans le contexte (si tu as cette fonction)
      if (updateUserProfile) {
        await updateUserProfile({
          displayName: displayName.trim(),
          photoURL: profilePhoto,
          // bio: bio.trim(), // À ajouter si tu veux gérer la bio
        });
      }

      Alert.alert('Succès', 'Profil mis à jour avec succès !', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le profil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: '#fff' }]}>← Retour</Text>
        </TouchableOpacity>
        
        {/* Espace vide pour équilibrer */}
        <View style={{ width: 80 }} />
      </View>

      {/* Titre sous la ligne de séparation */}
      <View style={styles.titleSection}>
        <Text style={[styles.headerTitle, { color: textColor }]}>Edit Profile</Text>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Photo de profil */}
          <View style={styles.photoSection}>
            <TouchableOpacity 
              onPress={pickImage} 
              style={[styles.photoContainer, isLoading && styles.photoLoading]}
              disabled={isLoading}
            >
              <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
              <View style={[styles.photoOverlay, { backgroundColor: '#fff' }]}> 
                <Text style={styles.photoOverlayText}>
                  {isLoading ? '⏳' : '📷'}
                </Text>
              </View>
            </TouchableOpacity>
            <Text style={[styles.photoHint, { color: textColor }]}>
              {isLoading ? 'Upload en cours...' : 'Appuyez pour changer votre photo'}
            </Text>
          </View>

          {/* Formulaire */}
          <View style={styles.formSection}>
            {/* Nom d'affichage */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Nom d'affichage</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: '#fff' }]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Votre nom"
                placeholderTextColor={textColor + '80'}
              />
            </View>

            {/* Email (lecture seule) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Email</Text>
              <TextInput
                style={[styles.input, styles.readOnlyInput, { color: textColor, borderColor: '#666' }]}
                value={email}
                editable={false}
                placeholder="Votre email"
                placeholderTextColor={textColor + '80'}
              />
              <Text style={[styles.hint, { color: textColor }]}>
                L'email ne peut pas être modifié
              </Text>
            </View>

            {/* Bio (optionnel) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Bio (optionnel)</Text>
              <TextInput
                style={[styles.input, styles.textArea, { color: textColor, borderColor: '#fff' }]}
                value={bio}
                onChangeText={setBio}
                placeholder="Parlez-nous de vous..."
                placeholderTextColor={textColor + '80'}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Espacement en bas */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bouton Save flottant */}
      <TouchableOpacity 
        style={[styles.floatingButton, { backgroundColor: '#fff' }]}
        onPress={saveProfile}
        disabled={isLoading}
      >
        <Text style={styles.floatingButtonText}>
          {isLoading ? 'Saving...' : 'Save'}
        </Text>
      </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(212, 184, 150, 0.3)',
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  photoLoading: {
    opacity: 0.6,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOverlayText: {
    fontSize: 16,
  },
  photoHint: {
    fontSize: 14,
    opacity: 0.7,
  },
  formSection: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  readOnlyInput: {
    opacity: 0.6,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  hint: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  bottomSpacing: {
    height: 100, // Plus d'espace pour le bouton flottant
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  floatingButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
