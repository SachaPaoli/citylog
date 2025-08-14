import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { getFollowingList } from '../services/FollowService';

interface RankingUser {
  id: string;
  name: string;
  avatar: string;
  citiesVisited: number;
  rank: number;
  isCurrentUser?: boolean;
}

export const useRanking = () => {
  const [rankingData, setRankingData] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();

  const loadRanking = async () => {
    if (!userProfile?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Récupérer la liste des utilisateurs suivis
      const followingList = await getFollowingList(userProfile.uid);
      
      // Ajouter l'utilisateur actuel à la liste
      const usersToRank = [...followingList, userProfile.uid];
      
      const usersWithCities: RankingUser[] = [];
      
      // Pour chaque utilisateur, récupérer ses informations et compter ses villes
      for (const userId of usersToRank) {
        try {
          // Récupérer les informations utilisateur
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (!userDoc.exists()) continue;
          
          const userData = userDoc.data();
          const visitedCities = userData.visitedCities || [];
          
          // Compter les villes uniques (groupe par nom de ville normalisé)
          const uniqueCities = new Set();
          visitedCities.forEach((city: any) => {
            if (city.name && city.beenThere) {
              // Normaliser le nom de ville pour éviter les doublons
              const normalizedName = city.name.toLowerCase().trim();
              uniqueCities.add(`${normalizedName}-${city.country}`);
            }
          });
          
          usersWithCities.push({
            id: userId,
            name: userId === userProfile.uid ? 'Toi' : (userData.displayName || userData.email || 'Utilisateur'),
            avatar: userData.photoURL || '', // Ne plus mettre d'URL par défaut ici
            citiesVisited: uniqueCities.size,
            rank: 0, // Sera calculé après tri
            isCurrentUser: userId === userProfile.uid
          });
        } catch (userError) {
          console.error(`Erreur pour l'utilisateur ${userId}:`, userError);
        }
      }
      
      // Trier par nombre de villes visitées (décroissant)
      usersWithCities.sort((a, b) => b.citiesVisited - a.citiesVisited);
      
      // Assigner les rangs
      let currentRank = 1;
      for (let i = 0; i < usersWithCities.length; i++) {
        if (i > 0 && usersWithCities[i].citiesVisited < usersWithCities[i - 1].citiesVisited) {
          currentRank = i + 1;
        }
        usersWithCities[i].rank = currentRank;
      }
      
      setRankingData(usersWithCities);
    } catch (err) {
      setError('Erreur lors du chargement du classement');
      console.error('Erreur ranking:', err);
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir le classement
  const refreshRanking = async () => {
    await loadRanking();
  };

  // Charger le classement au montage et quand l'utilisateur change
  useEffect(() => {
    loadRanking();
  }, [userProfile?.uid]);

  return {
    rankingData,
    loading,
    error,
    refreshRanking
  };
};
