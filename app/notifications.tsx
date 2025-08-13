import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useNavigation, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '../hooks/useNotificationsSimple';

const followNotifications = [
  { id: '1', message: 'Alice veut s\'abonner à vous.', user: 'Alice', date: 'Aujourd\'hui' },
  { id: '2', message: 'Bob veut s\'abonner à vous.', user: 'Bob', date: 'Hier' },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  
  console.log('🔔 NotificationsScreen - Component rendering...');
  
  const { notifications, loading, error, refreshNotifications } = useNotifications();
  const [refreshing, setRefreshing] = React.useState(false);

  console.log('🔔 NotificationsScreen - Hook data:', { 
    notificationsCount: notifications?.length || 0,
    loading, 
    error,
    notifications: notifications
  });

  React.useLayoutEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh started');
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
    console.log('🔄 Manual refresh completed');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_post':
        return 'camera';
      case 'rating':
        return 'star';
      case 'visited_city':
        return 'location';
      default:
        return 'notifications';
    }
  };

  const handleNotificationPress = (notification: any) => {
    console.log('🔔 Notification pressed:', notification);
    if (notification.type === 'new_post' && notification.postId) {
      router.push(`/trip-detail?postId=${notification.postId}`);
    } else if (notification.userId) {
      router.push(`/user-profile?userId=${notification.userId}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>
      <View style={{ height: 0.5, backgroundColor: 'rgba(255,255,255,0.3)', width: '100%' }} />
      
      <ScrollView 
        style={styles.sections} 
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#fff"
          />
        }
      >
        <Text style={styles.sectionTitle}>Activités des personnes suivies</Text>
        
        {/* Debug info */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Debug: {notifications.length} notifications trouvées
          </Text>
          <Text style={styles.debugText}>
            Loading: {loading ? 'Oui' : 'Non'}
          </Text>
          {error && (
            <Text style={styles.debugText}>
              Error: {error}
            </Text>
          )}
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Chargement des activités...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={styles.activityNotifItem}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={styles.notificationIconContainer}>
                <Ionicons 
                  name={getNotificationIcon(notification.type) as any}
                  size={20} 
                  color="#fff" 
                />
              </View>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Image 
                    source={{ uri: notification.userPhoto || 'https://via.placeholder.com/32' }}
                    style={styles.avatar}
                    cachePolicy="memory-disk"
                    contentFit="cover"
                    transition={200}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {notification.userName}
                    </Text>
                    <Text style={styles.timestamp}>
                      {notification.relativeTime}
                    </Text>
                  </View>
                </View>
                <Text style={styles.notifText}>
                  {notification.message}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={48} color="#666" />
            <Text style={styles.emptyActivityText}>
              Aucune activité récente de vos abonnements
            </Text>
            <Text style={styles.emptyActivityText}>
              Tirez vers le bas pour actualiser
            </Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Demandes d'abonnement</Text>
        {followNotifications.length === 0 ? (
          <Text style={styles.emptyText}>Aucune demande</Text>
        ) : (
          followNotifications.map(notif => (
            <View key={notif.id} style={styles.notifItem}>
              <Text style={styles.notifText}>{notif.message}</Text>
              <Text style={styles.notifDate}>{notif.date}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181C24',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: '#181C24',
    width: '100%',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    justifyContent: 'center',
    height: 40,
    minWidth: 80,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'right',
    minWidth: 120,
    flex: 1,
  },
  sections: {
    flex: 1,
    backgroundColor: '#181C24',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    marginTop: 8,
  },
  debugContainer: {
    backgroundColor: 'rgba(255,255,0,0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  debugText: {
    color: '#ffff00',
    fontSize: 12,
    marginBottom: 4,
  },
  notifItem: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 0.7,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
  },
  activityNotifItem: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 0.7,
    borderColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 1,
  },
  notifText: {
    color: '#fff',
    fontSize: 15,
  },
  notifDate: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'right',
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  emptyActivityText: {
    color: '#888',
    fontStyle: 'italic',
    marginTop: 15,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    textAlign: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
});
