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

// Collection reference
const postsCollection = collection(db, 'posts');

export class PostService {
  // Créer un nouveau post
  static async createPost(postData: CreatePostData, userId: string, userName: string): Promise<string> {
    try {
      const newPost = {
        userId,
        userName,
        userPhoto: '', // À ajouter plus tard avec le profil utilisateur
        city: postData.city,
        country: postData.country,
        photo: postData.photo,
        rating: postData.rating,
        description: postData.description,
        stayingItems: postData.stayingItems,
        restaurantItems: postData.restaurantItems,
        activitiesItems: postData.activitiesItems,
        otherItems: postData.otherItems,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        likes: [],
        comments: []
      };

      const docRef = await addDoc(postsCollection, newPost);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création du post:', error);
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
      await deleteDoc(doc(db, 'posts', postId));
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
}
