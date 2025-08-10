import React, { useCallback, useEffect, useState } from 'react';
import { getFollowStats } from '../services/FollowService';
import { useFocusEffect } from '@react-navigation/native';

export const useFollowStats = (userId?: string) => {
  const [stats, setStats] = useState({
    followersCount: 0,
    followingCount: 0
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const followStats = await getFollowStats(userId);
      setStats({
        followersCount: followStats.followers,
        followingCount: followStats.following
      });
    } catch (error) {
      console.error('Erreur lors du chargement des stats de follow:', error);
      setStats({ followersCount: 0, followingCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [userId]);

  // Recharger à chaque fois que l'écran regagne le focus
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [userId])
  );

  return { stats, loading, refreshStats: loadStats };
};
