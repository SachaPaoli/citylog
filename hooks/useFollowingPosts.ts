import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getFollowingList } from '../services/FollowService';
import { PostService } from '../services/PostService';
import { Post } from '../types/Post';

export const useFollowingPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();

  // Charger les posts des utilisateurs suivis
  const loadFollowingPosts = async () => {
    if (!userProfile?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Récupérer la liste des utilisateurs suivis
      const followingList = await getFollowingList(userProfile.uid);
      
      // Récupérer tous les posts
      const allPosts = await PostService.getAllPosts();
      
      // Filtrer pour ne garder que les posts des utilisateurs suivis + ses propres posts
      const filteredPosts = allPosts.filter(post => 
        post.isPublic && (
          followingList.includes(post.userId) || 
          post.userId === userProfile.uid // Toujours inclure ses propres posts
        )
      );
      
      // Trier par date de création (plus récent en premier)
      filteredPosts.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      setPosts(filteredPosts);
    } catch (err) {
      setError('Erreur lors du chargement des posts');
      console.error('Erreur following posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir les posts
  const refreshFollowingPosts = async () => {
    await loadFollowingPosts();
  };

  // Charger les posts au montage et quand l'utilisateur change
  useEffect(() => {
    loadFollowingPosts();
  }, [userProfile?.uid]);

  return {
    posts,
    loading,
    error,
    refreshFollowingPosts
  };
};
