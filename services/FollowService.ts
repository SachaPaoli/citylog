import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface FollowStats {
  followers: number;
  following: number;
}

// Suivre un utilisateur
export const followUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  if (currentUserId === targetUserId) {
    throw new Error('Cannot follow yourself');
  }

  try {
    // Only add targetUserId to the following list of currentUser
    const currentUserRef = doc(db, 'users', currentUserId);
    await updateDoc(currentUserRef, {
      following: arrayUnion(targetUserId)
    });
    console.log(`${currentUserId} now follows ${targetUserId}`);
  } catch (error) {
    console.error('Error during follow:', error);
    throw error;
  }
};

// Ne plus suivre un utilisateur
export const unfollowUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  try {
    // Only remove targetUserId from the following list of currentUser
    const currentUserRef = doc(db, 'users', currentUserId);
    await updateDoc(currentUserRef, {
      following: arrayRemove(targetUserId)
    });
    console.log(`${currentUserId} no longer follows ${targetUserId}`);
  } catch (error) {
    console.error('Error during unfollow:', error);
    throw error;
  }
};

// Vérifier si on suit un utilisateur
export const isFollowingUser = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', currentUserId));
    if (userDoc.exists()) {
      const following = userDoc.data().following || [];
      return following.includes(targetUserId);
    }
    return false;
  } catch (error) {
    console.error('Erreur lors de la vérification du follow:', error);
    return false;
  }
};

// Obtenir les statistiques de follow d'un utilisateur
export const getFollowStats = async (userId: string): Promise<FollowStats> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        followers: (data.followers || []).length,
        following: (data.following || []).length
      };
    }
    return { followers: 0, following: 0 };
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    return { followers: 0, following: 0 };
  }
};

// Obtenir la liste des utilisateurs suivis
export const getFollowingList = async (userId: string): Promise<string[]> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().following || [];
    }
    return [];
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste following:', error);
    return [];
  }
};

// Obtenir la liste des followers
export const getFollowersList = async (userId: string): Promise<string[]> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().followers || [];
    }
    return [];
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste followers:', error);
    return [];
  }
};
