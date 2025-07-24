import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RankingUser {
  id: string;
  name: string;
  avatar: string;
  citiesVisited: number;
  rank: number;
}

const rankingData: RankingUser[] = [
  {
    id: '1',
    name: 'Toi',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    citiesVisited: 27,
    rank: 1,
  },
  {
    id: '2',
    name: 'Sarah Martin',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100',
    citiesVisited: 23,
    rank: 2,
  },
  {
    id: '3',
    name: 'Alex Dubois',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    citiesVisited: 19,
    rank: 3,
  },
  {
    id: '4',
    name: 'Emma Wilson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    citiesVisited: 15,
    rank: 4,
  },
  {
    id: '5',
    name: 'Lucas Garcia',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    citiesVisited: 12,
    rank: 5,
  },
  {
    id: '6',
    name: 'Marie Dupont',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100',
    citiesVisited: 8,
    rank: 6,
  }
];

export default function RankingScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const beigeColor = '#E5C9A6';

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankStyle = (rank: number) => {
    if (rank <= 3) {
      return styles.topRank;
    }
    return styles.normalRank;
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={[styles.header, { backgroundColor }]}>
          <Text style={[styles.headerTitle, { color: textColor }]}>🏆 Classement</Text>
        </View>
      </SafeAreaView>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsHeader}>
          <Text style={[styles.statsTitle, { color: textColor }]}>
            Meilleurs explorateurs
          </Text>
          <Text style={styles.statsSubtitle}>
            Classé par nombre de villes visitées
          </Text>
        </View>

        <View style={styles.rankingList}>
          {rankingData.map((user) => (
            <View 
              key={user.id}
              style={[
                styles.rankingCard,
                user.id === '1' && { backgroundColor: beigeColor + '20', borderColor: beigeColor }
              ]}
            >
              <View style={styles.rankInfo}>
                <Text style={[styles.rankNumber, getRankStyle(user.rank)]}>
                  {getRankIcon(user.rank)}
                </Text>
              </View>

              <Image 
                source={{ uri: user.avatar }}
                style={[
                  styles.avatar,
                  user.id === '1' && { borderColor: beigeColor, borderWidth: 3 }
                ]}
              />

              <View style={styles.userInfo}>
                <Text style={[
                  styles.userName, 
                  { color: textColor },
                  user.id === '1' && { fontWeight: 'bold', color: beigeColor }
                ]}>
                  {user.name}
                </Text>
                <View style={styles.citiesContainer}>
                  <Text style={[styles.citiesNumber, { color: beigeColor }]}>
                    {user.citiesVisited}
                  </Text>
                  <Text style={styles.citiesLabel}>villes visitées</Text>
                </View>
              </View>

              {user.rank <= 3 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>TOP 3</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: textColor }]}>
            Continue à explorer pour grimper dans le classement ! 🌍
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSafeArea: {
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsHeader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statsSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  rankingList: {
    marginBottom: 20,
  },
  rankingCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rankInfo: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  topRank: {
    fontSize: 24,
  },
  normalRank: {
    fontSize: 18,
    color: '#666',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  citiesContainer: {
    alignItems: 'center',
  },
  citiesNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  citiesLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  footer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
