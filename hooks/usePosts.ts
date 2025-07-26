import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PostService } from '../services/PostService';
import { CreatePostData, Post } from '../types/Post';

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userProfile } = useAuth();

  // Charger tous les posts
  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPosts = await PostService.getAllPosts();
      setPosts(fetchedPosts);
    } catch (err) {
      setError('Erreur lors du chargement des posts');
      console.error('Erreur posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouveau post
  const createPost = async (postData: CreatePostData) => {
    if (!user || !userProfile) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const postId = await PostService.createPost(
        postData,
        user.uid,
        userProfile.displayName
      );
      
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
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const isLiked = post.likes.includes(user.uid);
            return {
              ...post,
              likes: isLiked 
                ? post.likes.filter(id => id !== user.uid)
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
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error('Erreur suppression:', err);
      throw err;
    }
  };

  // Récupérer un post spécifique par ID
  const getPostById = async (postId: string): Promise<Post | null> => {
    try {
      return await PostService.getPostById(postId);
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
