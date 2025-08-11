import { collection, endAt, getDocs, limit, orderBy, query, startAt, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserSearchResult {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  profileImage?: string;
  followers?: number;
  following?: number;
}

export class UserSearchService {
  // Rechercher des utilisateurs par nom
  static async searchUsersByName(searchTerm: string, maxResults: number = 20): Promise<UserSearchResult[]> {
    if (!searchTerm.trim()) {
      return [];
    }

    try {
      const usersRef = collection(db, 'users');
      const searchTermLower = searchTerm.toLowerCase().trim();
      
      // Stratégie 1: Recherche avec startAt/endAt (pour les noms qui commencent par le terme)
      const q1 = query(
        usersRef,
        orderBy('displayName'),
        startAt(searchTerm),
        endAt(searchTerm + '\uf8ff'),
        limit(maxResults)
      );

      // Stratégie 2: Recherche avec startAt/endAt en minuscules
      const q2 = query(
        usersRef,
        orderBy('displayName'),
        startAt(searchTermLower),
        endAt(searchTermLower + '\uf8ff'),
        limit(maxResults)
      );

      // Stratégie 3: Recherche avec la première lettre en majuscule
      const searchTermCapitalized = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase();
      const q3 = query(
        usersRef,
        orderBy('displayName'),
        startAt(searchTermCapitalized),
        endAt(searchTermCapitalized + '\uf8ff'),
        limit(maxResults)
      );

      const [snapshot1, snapshot2, snapshot3] = await Promise.all([
        getDocs(q1),
        getDocs(q2),
        getDocs(q3)
      ]);

      const usersMap = new Map<string, UserSearchResult>();

      // Collecter tous les résultats
      [snapshot1, snapshot2, snapshot3].forEach(querySnapshot => {
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.displayName && !usersMap.has(doc.id)) {
            // Vérifier si le nom contient le terme de recherche (insensible à la casse)
            if (data.displayName.toLowerCase().includes(searchTermLower)) {
              usersMap.set(doc.id, {
                uid: doc.id,
                displayName: data.displayName,
                email: data.email,
                photoURL: data.photoURL,
                profileImage: data.profileImage,
                followers: data.followers ? data.followers.length : 0,
                following: data.following ? data.following.length : 0
              });
            }
          }
        });
      });

      const users = Array.from(usersMap.values());

      // Trier par pertinence (correspondance exacte en premier, puis par début de nom, puis alphabétique)
      return users.sort((a, b) => {
        const aLower = a.displayName.toLowerCase();
        const bLower = b.displayName.toLowerCase();
        
        const aExact = aLower === searchTermLower;
        const bExact = bLower === searchTermLower;
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        const aStartsWith = aLower.startsWith(searchTermLower);
        const bStartsWith = bLower.startsWith(searchTermLower);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Si les deux sont égaux en pertinence, trier alphabétiquement
        return a.displayName.localeCompare(b.displayName);
      }).slice(0, maxResults);

    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error);
      return [];
    }
  }

  // Rechercher des utilisateurs par email (pour une recherche plus précise)
  static async searchUsersByEmail(email: string): Promise<UserSearchResult[]> {
    if (!email.trim()) {
      return [];
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.toLowerCase().trim()));
      
      const querySnapshot = await getDocs(q);
      const users: UserSearchResult[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          uid: doc.id,
          displayName: data.displayName || 'Utilisateur',
          email: data.email,
          photoURL: data.photoURL,
          profileImage: data.profileImage,
          followers: data.followers ? data.followers.length : 0,
          following: data.following ? data.following.length : 0
        });
      });

      return users;
    } catch (error) {
      console.error('Erreur lors de la recherche par email:', error);
      return [];
    }
  }

  // Obtenir des utilisateurs populaires/recommandés
  static async getPopularUsers(maxResults: number = 10): Promise<UserSearchResult[]> {
    try {
      const usersRef = collection(db, 'users');
      // Pour l'instant, on prend les premiers utilisateurs
      // Plus tard on pourra trier par nombre de followers ou posts
      const q = query(usersRef, limit(maxResults));
      
      const querySnapshot = await getDocs(q);
      const users: UserSearchResult[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.displayName) {
          users.push({
            uid: doc.id,
            displayName: data.displayName,
            email: data.email,
            photoURL: data.photoURL,
            profileImage: data.profileImage,
            followers: data.followers ? data.followers.length : 0,
            following: data.following ? data.following.length : 0
          });
        }
      });

      return users;
    } catch (error) {
      console.error('Erreur lors de la récupération d\'utilisateurs populaires:', error);
      return [];
    }
  }
}
