import { ProfileImage } from '@/components/ProfileImage';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/contexts/AuthContext';
import { useFollow } from '@/hooks/useFollow';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { UserSearchResult } from '../services/UserSearchService';

interface UserSearchCardProps {
  user: UserSearchResult;
}

export const UserSearchCard: React.FC<UserSearchCardProps> = ({ user }) => {
  const textColor = useThemeColor({}, 'text');
  const { userProfile } = useAuth();
  const { isFollowing, handleFollow, loading } = useFollow(user.uid);

  const handlePress = () => {
    if (user.uid === userProfile?.uid) {
      // Si c'est soi-même, aller au profil personnel
      router.push('/(tabs)/profile');
    } else {
      // Sinon aller au profil de l'utilisateur
      router.push(`/user-profile?userId=${user.uid}`);
    }
  };

  const isCurrentUser = user.uid === userProfile?.uid;

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.userInfo}>
        <ProfileImage 
          uri={user.photoURL || user.profileImage}
          size={50}
        />
        <View style={styles.textInfo}>
          <Text style={[styles.displayName, { color: textColor }]}>
            {user.displayName}
            {isCurrentUser && <Text style={styles.youIndicator}> (You)</Text>}
          </Text>
        </View>
      </View>
      
      {!isCurrentUser && (
        <TouchableOpacity
          style={[
            styles.followButton,
            isFollowing && styles.followingButton
          ]}
          onPress={(e) => {
            e.stopPropagation(); // Empêcher la navigation quand on clique sur le bouton
            handleFollow();
          }}
          disabled={loading}
        >
          <Text style={[
            styles.followButtonText,
            isFollowing && styles.followingButtonText
          ]}>
            {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 0.7,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  textInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  youIndicator: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.7,
  },
  followButton: {
    backgroundColor: '#2051A4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 70,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: '#666',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#fff',
  },
});
