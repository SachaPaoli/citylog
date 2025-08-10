import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { followUser, getFollowStats, getFollowingList, isFollowingUser, unfollowUser, type FollowStats } from '../services/FollowService';

export const useFollow = (targetUserId?: string) => {
  const { userProfile } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStats, setFollowStats] = useState<FollowStats>({ followers: 0, following: 0 });
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    if (targetUserId && userProfile?.uid) {
      loadFollowData();
    }
  }, [targetUserId, userProfile?.uid]);

  const loadFollowData = async () => {
    if (!targetUserId || !userProfile?.uid) return;

    try {
      setLoading(true);
      
      // Vérifier si on suit l'utilisateur
      const following = await isFollowingUser(userProfile.uid, targetUserId);
      setIsFollowing(following);
      
      // Récupérer les stats de follow
      const stats = await getFollowStats(targetUserId);
      setFollowStats(stats);
      
      // Récupérer la liste des personnes suivies par l'utilisateur actuel
      const following_list = await getFollowingList(userProfile.uid);
      setFollowingList(following_list);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données de follow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!targetUserId || !userProfile?.uid || targetUserId === userProfile.uid) return;

    try {
      setLoading(true);
      
      if (isFollowing) {
        await unfollowUser(userProfile.uid, targetUserId);
        setIsFollowing(false);
        setFollowStats(prev => ({ ...prev, followers: prev.followers - 1 }));
        setFollowingList(prev => prev.filter(id => id !== targetUserId));
      } else {
        await followUser(userProfile.uid, targetUserId);
        setIsFollowing(true);
        setFollowStats(prev => ({ ...prev, followers: prev.followers + 1 }));
        setFollowingList(prev => [...prev, targetUserId]);
      }
      
    } catch (error) {
      console.error('Erreur lors du follow/unfollow:', error);
      // Recharger les données en cas d'erreur
      await loadFollowData();
    } finally {
      setLoading(false);
    }
  };

  return {
    isFollowing,
    followStats,
    followingList,
    loading,
    handleFollow,
    refreshFollowData: loadFollowData
  };
};
