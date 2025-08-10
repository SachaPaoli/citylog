
// Configuration Cloudinary - Utilise les variables d'environnement
const CLOUDINARY_CONFIG = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dn36thuhe',
  apiKey: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || '349386876196142',
  uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'citylog_preset'
};

export class CloudinaryService {
  /**
   * Upload une image vers Cloudinary
   * @param imageUri L'URI locale de l'image
   * @param folder Le dossier de destination (optionnel)
   * @returns L'URL Cloudinary de l'image uploadée
   */
  static async uploadImage(imageUri: string, folder?: string): Promise<string> {
    try {
      console.log('📤 Upload vers Cloudinary...');
      
      // Préparer les données du formulaire
      const formData = new FormData();
      
      // Ajouter l'image
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `image_${Date.now()}.jpg`,
      } as any);
      
      // Ajouter le preset d'upload
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      
      // Ajouter le dossier si spécifié
      if (folder) {
        formData.append('folder', folder);
      }
      
      // Ajouter un timestamp pour l'organisation
      const timestamp = Math.round(Date.now() / 1000);
      formData.append('timestamp', timestamp.toString());
      
      // URL d'upload Cloudinary
      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
      
      console.log('🌐 Envoi vers Cloudinary...');
      
      // Faire la requête d'upload
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Erreur Cloudinary:', result);
        throw new Error(`Erreur Cloudinary: ${result.error?.message || 'Upload failed'}`);
      }
      
      console.log('✅ Image uploadée vers Cloudinary:', result.secure_url);
      return result.secure_url;
      
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'upload Cloudinary:', error);
      throw new Error(`Impossible d'uploader l'image: ${error?.message || 'Erreur inconnue'}`);
    }
  }

  /**
   * Upload plusieurs images en parallèle
   * @param imageUris Les URIs locales des images
   * @param folder Le dossier de destination
   * @returns Les URLs Cloudinary des images uploadées
   */
  static async uploadMultipleImages(imageUris: string[], folder?: string): Promise<string[]> {
    try {
      console.log(`📤 Upload de ${imageUris.length} images vers Cloudinary...`);
      
      const uploadPromises = imageUris.map(uri => 
        this.uploadImage(uri, folder)
      );
      
      const urls = await Promise.all(uploadPromises);
      
      console.log(`✅ ${urls.length} images uploadées vers Cloudinary`);
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
   * @returns Les images avec les URLs Cloudinary
   */
  static async uploadItemImages(
    images: { id: string; uri: string }[], 
    itemType: string, 
    postId: string
  ): Promise<{ id: string; uri: string }[]> {
    if (images.length === 0) return images;

    try {
      const folder = `citylog/posts/${postId}/${itemType}`;
      
      const uploadPromises = images.map(async (image) => {
        const cloudinaryUrl = await this.uploadImage(image.uri, folder);
        return {
          id: image.id,
          uri: cloudinaryUrl
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
   * Génère une URL optimisée pour l'affichage
   * @param cloudinaryUrl L'URL Cloudinary originale
   * @param transformation Les transformations à appliquer
   * @returns L'URL optimisée
   */
  static getOptimizedUrl(
    cloudinaryUrl: string, 
    transformation: string = 'w_400,h_300,c_fill,f_auto,q_auto'
  ): string {
    if (!cloudinaryUrl.includes('cloudinary.com')) {
      return cloudinaryUrl; // Si ce n'est pas une URL Cloudinary, retourner telle quelle
    }

    // Insérer la transformation dans l'URL Cloudinary
    const parts = cloudinaryUrl.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/${transformation}/${parts[1]}`;
    }
    
    return cloudinaryUrl;
  }

  /**
   * URLs optimisées pour différentes tailles d'écran
   */
  static getImageVariants(cloudinaryUrl: string) {
    return {
      thumbnail: this.getOptimizedUrl(cloudinaryUrl, 'w_150,h_150,c_fill,f_auto,q_auto:low'),
      medium: this.getOptimizedUrl(cloudinaryUrl, 'w_400,h_300,c_fill,f_auto,q_auto:good'),
      large: this.getOptimizedUrl(cloudinaryUrl, 'w_800,h_600,c_fill,f_auto,q_auto:best'),
      cover: this.getOptimizedUrl(cloudinaryUrl, 'w_600,h_400,c_fill,f_auto,q_auto:good')
    };
  }
}

export default CloudinaryService;
