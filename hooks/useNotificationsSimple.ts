import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { getFollowingList } from '../services/FollowService';

export interface Notification {
  id: string;
  type: 'new_post' | 'rating' | 'visited_city';
  userId: string;
  userName: string;
  userPhoto?: string;
  message: string;
  city?: string;
  country?: string;
  rating?: number;
  postId?: string;
  createdAt: Date;
  relativeTime: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();

  console.log('🔔 [useNotifications] Hook REEL appelé avec succès!');
  console.log('🔔 [useNotifications] userProfile:', userProfile);

  // Fonction pour calculer le temps relatif
  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'À l\'instant';
    } else if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else if (diffInDays === 1) {
      return 'Hier';
    } else if (diffInDays < 7) {
      return `Il y a ${diffInDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  // Fonction pour récupérer les informations d'un utilisateur
  const getUserInfo = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          userName: userData.displayName || userData.email?.split('@')[0] || 'Utilisateur',
          userPhoto: userData.photoURL || ''
        };
      }
      return {
        userName: 'Utilisateur inconnu',
        userPhoto: ''
      };
    } catch (error) {
      console.error('🔔 [useNotifications] Erreur lors de la récupération des infos utilisateur:', error);
      return {
        userName: 'Utilisateur',
        userPhoto: ''
      };
    }
  };

  // Fonction principale pour charger les notifications
  const loadNotifications = async () => {
    console.log('🔔 [useNotifications] loadNotifications appelée');
    
    if (!userProfile?.uid) {
      console.log('🔔 [useNotifications] Pas d\'utilisateur connecté');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('🔔 [useNotifications] Début du chargement...');
      
      // 1. Récupérer la liste des personnes suivies
      console.log('🔔 [useNotifications] Récupération des personnes suivies...');
      const followingList = await getFollowingList(userProfile.uid);
      console.log('🔔 [useNotifications] Personnes suivies:', followingList);
      
      if (followingList.length === 0) {
        console.log('🔔 [useNotifications] Aucune personne suivie');
        setNotifications([]);
        setLoading(false);
        return;
      }

      const newNotifications: Notification[] = [];

      // 2. Pour chaque personne suivie, récupérer ses activités récentes
      console.log('🔔 [useNotifications] Récupération des activités pour', followingList.length, 'personnes');
      for (const followedUserId of followingList) {
        console.log('🔔 [useNotifications] Traitement de l\'utilisateur:', followedUserId);
        try {
          // Récupérer les infos de l'utilisateur
          const userInfo = await getUserInfo(followedUserId);
          console.log('🔔 [useNotifications] Infos utilisateur:', userInfo);

          // Récupérer les villes visitées récemment
          console.log('🔔 [useNotifications] Récupération des villes visitées pour:', followedUserId);
          const userDocRef = doc(db, 'users', followedUserId);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const visitedCities = userData.visitedCities || [];
            console.log('🔔 [useNotifications] Villes visitées trouvées:', visitedCities.length);
            
            // Filtrer les villes visitées récemment (sources de notes récentes)
            visitedCities.forEach((city: any, index: number) => {
              console.log('🔔 [useNotifications] Ville analysée:', {
                name: city.name,
                source: city.source,
                beenThere: city.beenThere,
                rating: city.rating,
                hasTimestamp: !!city.timestamp
              });
              
              if (city.source === 'note' && city.beenThere) {
                // Utiliser le timestamp de la ville si disponible, sinon une date récente
                let cityDate;
                if (city.timestamp) {
                  cityDate = city.timestamp.toDate ? city.timestamp.toDate() : new Date(city.timestamp);
                } else {
                  // Si pas de timestamp, créer un timestamp déterministe basé sur l'ID de la ville
                  // Cela évite que l'ordre change à chaque reload
                  const hashCode = city.id.split('').reduce((a: number, b: string) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
                  const hours = Math.abs(hashCode % 24); // Entre 0 et 23 heures
                  cityDate = new Date(Date.now() - hours * 60 * 60 * 1000);
                }
                
                // Ne garder que les villes ajoutées dans les 30 derniers jours (on élargit pour tester)
                const daysDiff = (new Date().getTime() - cityDate.getTime()) / (1000 * 60 * 60 * 24);
                console.log('🔔 [useNotifications] Ville daysDiff:', daysDiff, 'pour', city.name);
                
                if (daysDiff <= 30) {
                  console.log('🔔 [useNotifications] Ville récente ajoutée aux notifications:', city.name);
                  newNotifications.push({
                    id: `visited_${followedUserId}_${city.id}_${index}`,
                    type: 'visited_city',
                    userId: followedUserId,
                    userName: userInfo.userName,
                    userPhoto: userInfo.userPhoto,
                    message: `${userInfo.userName} a visité ${city.name}, ${city.country}${city.rating ? ` et l'a noté ${city.rating}/5` : ''}`,
                    city: city.name,
                    country: city.country,
                    rating: city.rating,
                    createdAt: cityDate,
                    relativeTime: getRelativeTime(cityDate)
                  });
                } else {
                  console.log('🔔 [useNotifications] Ville trop ancienne ignorée:', city.name);
                }
              }
            });
          }

        } catch (userError) {
          console.error(`🔔 [useNotifications] Erreur pour l'utilisateur ${followedUserId}:`, userError);
        }
      }

      // 3. Trier par date (plus récent en premier) et limiter à 50
      console.log('🔔 [useNotifications] Total notifications avant tri:', newNotifications.length);
      const sortedNotifications = newNotifications
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 50);

      console.log('🔔 [useNotifications] Notifications finales:', sortedNotifications.length);
      setNotifications(sortedNotifications);

    } catch (error) {
      console.error('🔔 [useNotifications] Erreur lors du chargement des notifications:', error);
      setError('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
      console.log('🔔 [useNotifications] Chargement terminé');
    }
  };

  // Fonction pour rafraîchir les notifications
  const refreshNotifications = async () => {
    console.log('🔔 [useNotifications] Refresh appelé');
    await loadNotifications();
  };

  // Charger les notifications au montage du hook
  useEffect(() => {
    loadNotifications();
  }, [userProfile?.uid]);

  return {
    notifications,
    loading,
    error,
    refreshNotifications
  };
};
