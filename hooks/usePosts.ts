import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PostService } from '../services/PostService';
import { CreatePostData, Post } from '../types/Post';
import { useEnrichedPosts } from './useEnrichedPosts';
import { getInstantUserPhoto } from './useGlobalPhotoPreloader';

export const usePosts = () => {
  const [rawPosts, setRawPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userProfile } = useAuth();

  // Enrichir les posts avec les photos de profil
  const { enrichedPosts, loading: enrichmentLoading } = useEnrichedPosts(rawPosts);

  // Les posts finaux sont les posts enrichis
  const posts = enrichedPosts;

  // Charger tous les posts
  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPosts = await PostService.getAllPosts();
      setRawPosts(fetchedPosts);
    } catch (err) {
      setError('Erreur lors du chargement des posts');
      console.error('Erreur posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouveau post
  const createPost = async (postData: CreatePostData) => {
    console.log('🔐 Vérification authentification...');
    console.log('🔐 user:', user ? 'CONNECTÉ' : 'NON CONNECTÉ');
    console.log('🔐 user.uid:', user?.uid);
    console.log('🔐 userProfile:', userProfile ? 'PRÉSENT' : 'ABSENT');
    console.log('🔐 userProfile.displayName:', userProfile?.displayName);
    console.log('🔐 userProfile.photoURL:', userProfile?.photoURL);
    
    if (!user || !userProfile) {
      console.error('❌ Utilisateur non connecté ou profil manquant');
      throw new Error('Utilisateur non connecté');
    }

    try {
      console.log('📤 Appel PostService.createPost...');
      const postId = await PostService.createPost(
        postData,
        user.uid,
        userProfile.displayName,
        userProfile.photoURL
      );
      
      console.log('✅ PostService.createPost réussi, ID:', postId);
      
      // Recharger les posts pour inclure le nouveau
      await loadPosts();
      return postId;
    } catch (err) {
      setError('Erreur lors de la création du post');
      console.error('Erreur création post:', err);
      throw err;
    }
  };

  // Liker/unliker un post
  const toggleLike = async (postId: string) => {
    if (!user) return;

    try {
      await PostService.toggleLike(postId, user.uid);
      
      // Mettre à jour localement
      setRawPosts((prevPosts: Post[]) => 
        prevPosts.map((post: Post) => {
          if (post.id === postId) {
            const isLiked = post.likes.includes(user.uid);
            return {
              ...post,
              likes: isLiked 
                ? post.likes.filter((id: string) => id !== user.uid)
                : [...post.likes, user.uid]
            };
          }
          return post;
        })
      );
    } catch (err) {
      setError('Erreur lors du like');
      console.error('Erreur like:', err);
    }
  };

  // Supprimer un post
  const deletePost = async (postId: string) => {
    try {
      await PostService.deletePost(postId);
      setRawPosts((prevPosts: Post[]) => prevPosts.filter((post: Post) => post.id !== postId));
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error('Erreur suppression:', err);
      throw err;
    }
  };

  // Récupérer un post spécifique par ID avec enrichissement instantané
  const getPostById = async (postId: string): Promise<Post | null> => {
    try {
      const post = await PostService.getPostById(postId);
      if (!post) return null;
      
      // Enrichir instantanément avec la photo du cache global
      const enrichedPost = {
        ...post,
        userPhoto: post.userPhoto || getInstantUserPhoto(post.userId) || ''
      };
      
      console.log(`📸 Post ${postId} enrichi instantanément - Photo: ${enrichedPost.userPhoto ? 'OUI' : 'NON'}`);
      return enrichedPost;
    } catch (err) {
      setError('Erreur lors de la récupération du post');
      console.error('Erreur getPostById:', err);
      return null;
    }
  };

  // Charger les posts au montage du composant
  useEffect(() => {
    loadPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    createPost,
    toggleLike,
    deletePost,
    refreshPosts: loadPosts,
    getPostById
  };
};
