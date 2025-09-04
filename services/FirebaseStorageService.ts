import { storage } from '@/config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export class FirebaseStorageService {
  /**
   * Upload une image vers Firebase Storage
   * @param imageUri L'URI locale de l'image
   * @param folder Le dossier de destination
   * @param filename Le nom du fichier (optionnel)
   * @returns L'URL de téléchargement Firebase
   */
  static async uploadImage(
    imageUri: string, 
    folder: string = 'general', 
    filename?: string
  ): Promise<string> {
    try {
      console.log('📤 Upload vers Firebase Storage...');
      console.log('📍 URI:', imageUri);
      console.log('📁 Folder:', folder);
      
      // Créer un nom de fichier unique si non fourni
      const finalFilename = filename || `image_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      console.log('📝 Filename:', finalFilename);
      
      // Créer la référence Firebase Storage (chemin simplifié pour test)
      const fullPath = `test/${finalFilename}`;
      console.log('🗂️ Full path (TEST):', fullPath);
      const imageRef = ref(storage, fullPath);
      
      // Convertir l'URI en blob
      console.log('🔄 Conversion en blob...');
      const response = await fetch(imageUri);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('📏 Blob size:', blob.size, 'bytes');
      console.log('📋 Blob type:', blob.type);
      
      console.log('🌐 Envoi vers Firebase Storage...');
      
      // Upload du blob avec metadata simplifiées
      const snapshot = await uploadBytes(imageRef, blob);
      console.log('✅ Upload terminé, taille:', snapshot.metadata.size);
      
      // Obtenir l'URL de téléchargement
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('✅ Image uploadée vers Firebase Storage:', downloadURL);
      return downloadURL;
      
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'upload Firebase Storage:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      
      // Essayer de donner plus d'informations sur l'erreur
      if (error.code === 'storage/unauthorized') {
        throw new Error(`Permissions Firebase Storage insuffisantes. Configurez les règles dans la console Firebase.`);
      } else if (error.code === 'storage/quota-exceeded') {
        throw new Error(`Quota Firebase Storage dépassé.`);
      } else if (error.code === 'storage/invalid-format') {
        throw new Error(`Format d'image non supporté.`);
      } else if (error.code === 'storage/unknown') {
        throw new Error(`Erreur Firebase Storage inconnue. Vérifiez la configuration des règles dans la console Firebase.`);
      }
      
      throw new Error(`Impossible d'uploader l'image: ${error?.message || 'Erreur inconnue'}`);
    }
  }

  /**
   * Upload plusieurs images en parallèle
   * @param imageUris Les URIs locales des images
   * @param folder Le dossier de destination
   * @returns Les URLs Firebase des images uploadées
   */
  static async uploadMultipleImages(imageUris: string[], folder: string): Promise<string[]> {
    try {
      console.log(`📤 Upload de ${imageUris.length} images vers Firebase Storage...`);
      
      const uploadPromises = imageUris.map((uri, index) => 
        this.uploadImage(uri, folder, `image_${Date.now()}_${index}.jpg`)
      );
      
      const urls = await Promise.all(uploadPromises);
      
      console.log(`✅ ${urls.length} images uploadées vers Firebase Storage`);
      return urls;
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload multiple:', error);
      throw error;
    }
  }

  /**
   * Upload les images d'un item de voyage
   * @param images Les images avec leurs URIs locales
   * @param itemType Le type d'item (staying, restaurant, etc.)
   * @param postId L'ID du post pour organiser les fichiers
   * @returns Les images avec les URLs Firebase
   */
  static async uploadItemImages(
    images: { id: string; uri: string }[], 
    itemType: string, 
    postId: string
  ): Promise<{ id: string; uri: string }[]> {
    if (images.length === 0) return images;

    try {
      const folder = `citylog/posts/${postId}/${itemType}`;
      
      const uploadPromises = images.map(async (image, index) => {
        const firebaseUrl = await this.uploadImage(
          image.uri, 
          folder, 
          `${image.id}_${index}.jpg`
        );
        return {
          id: image.id,
          uri: firebaseUrl
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      return uploadedImages;
      
    } catch (error) {
      console.error(`❌ Erreur lors de l'upload des images ${itemType}:`, error);
      throw error;
    }
  }

  /**
   * Upload d'une photo de profil
   * @param imageUri L'URI locale de l'image
   * @param userId L'ID de l'utilisateur
   * @returns L'URL Firebase de la photo de profil
   */
  static async uploadProfilePhoto(imageUri: string, userId: string): Promise<string> {
    return this.uploadImage(imageUri, `profiles/${userId}`, 'profile.jpg');
  }

  /**
   * Upload d'une photo principale de post
   * @param imageUri L'URI locale de l'image
   * @param postId L'ID du post
   * @returns L'URL Firebase de la photo
   */
  static async uploadMainPhoto(imageUri: string, postId: string): Promise<string> {
    return this.uploadImage(imageUri, `citylog/posts/${postId}/main`, 'main.jpg');
  }

  /**
   * Supprimer une image de Firebase Storage
   * @param imageUrl L'URL Firebase de l'image
   */
  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Vérifier si c'est une URL Cloudinary (ancienne)
      if (imageUrl.includes('cloudinary.com')) {
        console.log('⚠️ URL Cloudinary détectée, suppression ignorée:', imageUrl);
        return;
      }

      // Vérifier si c'est une URL Firebase Storage
      if (!imageUrl.includes('firebase') || !imageUrl.includes('/o/')) {
        console.log('⚠️ URL non Firebase Storage, suppression ignorée:', imageUrl);
        return;
      }
      
      // Extraire le chemin depuis l'URL Firebase
      const pathMatch = imageUrl.match(/\/o\/(.*?)\?/);
      if (!pathMatch) {
        console.log('⚠️ Format URL Firebase invalide, suppression ignorée:', imageUrl);
        return;
      }
      
      const path = decodeURIComponent(pathMatch[1]);
      const imageRef = ref(storage, path);
      
      await deleteObject(imageRef);
      console.log('✅ Image supprimée de Firebase Storage');
      
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      // Ne pas relancer l'erreur pour éviter de bloquer la suppression du post
      console.warn('⚠️ Suppression d\'image échouée, mais on continue:', imageUrl);
    }
  }

  /**
   * Génère une URL avec paramètres de redimensionnement (pour Firebase)
   * Note: Firebase Storage ne fait pas de redimensionnement automatique
   * mais on peut ajouter des paramètres pour les optimisations côté client
   */
  static getOptimizedUrl(firebaseUrl: string, width?: number, height?: number): string {
    // Firebase Storage ne supporte pas les transformations automatiques
    // Mais on peut retourner l'URL telle quelle pour maintenir la compatibilité
    return firebaseUrl;
  }

  /**
   * URLs pour différentes tailles
   * Note: Avec Firebase, toutes les URLs sont identiques car pas de transformation auto
   */
  static getImageVariants(firebaseUrl: string) {
    return {
      thumbnail: firebaseUrl,
      medium: firebaseUrl,
      large: firebaseUrl,
      cover: firebaseUrl
    };
  }
}

export default FirebaseStorageService;
