import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { CreatePostData, Post } from '../types/Post';
import { FirebaseStorageService } from './FirebaseStorageService';

// Collection reference
const postsCollection = collection(db, 'posts');

export class PostService {
  // Créer un nouveau post
  static async createPost(postData: CreatePostData, userId: string, userName: string, userPhoto?: string): Promise<string> {
    try {
      console.log('🚀 Début de la création du post...');
      
      // Créer un ID temporaire pour organiser les images
      const tempPostId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Upload de la photo principale si elle existe
      let mainPhotoUrl = '';
      if (postData.photo) {
        console.log('📸 Upload de la photo principale vers Firebase Storage...');
        mainPhotoUrl = await FirebaseStorageService.uploadImage(postData.photo, `posts/${tempPostId}/main`);
      }
      
      // Upload des images pour chaque catégorie d'items
      console.log('🏨 Upload des images des logements...');
      const uploadedStayingItems = await Promise.all(
        postData.stayingItems.map(async (item) => ({
          ...item,
          images: await FirebaseStorageService.uploadItemImages(item.images, 'staying', tempPostId)
        }))
      );
      
      console.log('🍽️ Upload des images des restaurants...');
      const uploadedRestaurantItems = await Promise.all(
        postData.restaurantItems.map(async (item) => ({
          ...item,
          images: await FirebaseStorageService.uploadItemImages(item.images, 'restaurant', tempPostId)
        }))
      );
      
      console.log('🎯 Upload des images des activités...');
      const uploadedActivitiesItems = await Promise.all(
        postData.activitiesItems.map(async (item) => ({
          ...item,
          images: await FirebaseStorageService.uploadItemImages(item.images, 'activities', tempPostId)
        }))
      );
      
      console.log('📝 Upload des images des autres items...');
      const uploadedOtherItems = await Promise.all(
        postData.otherItems.map(async (item) => ({
          ...item,
          images: await FirebaseStorageService.uploadItemImages(item.images, 'other', tempPostId)
        }))
      );

      console.log('💾 Sauvegarde du post dans Firestore...');
      console.log('🔍 userId:', userId);
      console.log('🔍 userName:', userName);
      console.log('🔍 userPhoto:', userPhoto);
      console.log('🔍 city:', postData.city);
      console.log('🔍 country:', postData.country);
      
      const newPost = {
        userId,
        userName,
        userPhoto: userPhoto || '', // Utiliser la photo de profil fournie
        city: postData.city,
        country: postData.country,
        photo: mainPhotoUrl,
        rating: postData.rating,
        description: postData.description,
        stayingItems: uploadedStayingItems,
        restaurantItems: uploadedRestaurantItems,
        activitiesItems: uploadedActivitiesItems,
        otherItems: uploadedOtherItems,
        isPublic: postData.isPublic,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        likes: [],
        comments: []
      };

      console.log('📋 Objet post final:', JSON.stringify(newPost, null, 2));
      console.log('🎯 Tentative d\'ajout dans la collection posts...');
      const docRef = await addDoc(postsCollection, newPost);
      console.log('✅ Post créé avec succès avec ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erreur lors de la création du post:', error);
      throw error;
    }
  }

  // Récupérer tous les posts (feed principal)
  static async getAllPosts(limitCount: number = 20): Promise<Post[]> {
    try {
      const q = query(
        postsCollection,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const posts: Post[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Post);
      });

      return posts;
    } catch (error) {
      console.error('Erreur lors de la récupération des posts:', error);
      throw error;
    }
  }

  // Récupérer un post spécifique par ID
  static async getPostById(postId: string): Promise<Post | null> {
    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        return null;
      }
      
      const data = postDoc.data();
      return {
        id: postDoc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Post;
    } catch (error) {
      console.error('Erreur lors de la récupération du post:', error);
      throw error;
    }
  }

  // Récupérer les posts d'un utilisateur spécifique
  static async getUserPosts(userId: string): Promise<Post[]> {
    try {
      const q = query(
        postsCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const posts: Post[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Post);
      });

      return posts;
    } catch (error) {
      console.error('Erreur lors de la récupération des posts utilisateur:', error);
      throw error;
    }
  }

  // Liker/Unliker un post
  static async toggleLike(postId: string, userId: string): Promise<void> {
    try {
      const postRef = doc(db, 'posts', postId);
      
      // On va récupérer le post pour vérifier s'il est déjà liké
      const postDoc = await getDocs(query(collection(db, 'posts'), where('__name__', '==', postId)));
      
      if (!postDoc.empty) {
        const postData = postDoc.docs[0].data();
        const likes = postData.likes || [];
        
        if (likes.includes(userId)) {
          // Retirer le like
          await updateDoc(postRef, {
            likes: arrayRemove(userId)
          });
        } else {
          // Ajouter le like
          await updateDoc(postRef, {
            likes: arrayUnion(userId)
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors du toggle like:', error);
      throw error;
    }
  }

  // Supprimer un post
  static async deletePost(postId: string): Promise<void> {
    try {
      // D'abord récupérer le post pour obtenir les URLs des images
      const post = await this.getPostById(postId);
      if (!post) {
        throw new Error('Post non trouvé');
      }

      console.log('🗑️ Suppression des images du post...');
      
      // Collecter toutes les URLs d'images à supprimer
      const imagesToDelete: string[] = [];
      
      // Photo principale
      if (post.photo) {
        imagesToDelete.push(post.photo);
      }
      
      // Images des items
      [...post.stayingItems, ...post.restaurantItems, ...post.activitiesItems, ...post.otherItems]
        .forEach(item => {
          if (item.images) {
            item.images.forEach(image => {
              if (image.uri) {
                imagesToDelete.push(image.uri);
              }
            });
          }
        });
      
      // Supprimer toutes les images de Firebase Storage
      await Promise.all(
        imagesToDelete.map(async (imageUrl) => {
          try {
            await FirebaseStorageService.deleteImage(imageUrl);
          } catch (error) {
            console.warn('⚠️ Erreur suppression image:', imageUrl, error);
            // On continue même si une image ne peut pas être supprimée
          }
        })
      );
      
      console.log(`✅ ${imagesToDelete.length} images supprimées de Firebase Storage`);
      
      // Nettoyer le post de toutes les wishlists
      await this.removePostFromAllWishlists(postId);
      
      // Ensuite supprimer le document Firestore
      await deleteDoc(doc(db, 'posts', postId));
      console.log('✅ Post supprimé de Firestore');
      
    } catch (error) {
      console.error('Erreur lors de la suppression du post:', error);
      throw error;
    }
  }

  // Mettre à jour un post
  static async updatePost(postId: string, updateData: Partial<CreatePostData>): Promise<void> {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        ...updateData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du post:', error);
      throw error;
    }
  }

  // Nettoyer un post supprimé de toutes les wishlists
  static async removePostFromAllWishlists(postId: string): Promise<void> {
    try {
      console.log('🧹 Nettoyage du post des wishlists...');
      
      // Récupérer tous les utilisateurs qui ont ce post dans leur wishlist
      const usersCollection = collection(db, 'users');
      const usersWithPost = await getDocs(
        query(usersCollection, where('wishlist', 'array-contains', postId))
      );
      
      if (usersWithPost.empty) {
        console.log('📋 Aucune wishlist à nettoyer');
        return;
      }
      
      // Supprimer le post de chaque wishlist
      const cleanupPromises = usersWithPost.docs.map(async (userDoc) => {
        try {
          await updateDoc(userDoc.ref, {
            wishlist: arrayRemove(postId)
          });
          console.log(`✅ Post supprimé de la wishlist de ${userDoc.id}`);
        } catch (error) {
          console.warn(`⚠️ Erreur nettoyage wishlist ${userDoc.id}:`, error);
        }
      });
      
      await Promise.all(cleanupPromises);
      console.log(`🧹 Post supprimé de ${usersWithPost.docs.length} wishlists`);
      
    } catch (error) {
      console.error('❌ Erreur nettoyage wishlists:', error);
      // On ne fait pas échouer la suppression du post pour ça
    }
  }
}
