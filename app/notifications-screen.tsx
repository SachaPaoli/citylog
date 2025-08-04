import { useNavigation, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


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
  notifItem: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 0.7,
    borderColor: 'rgba(255,255,255,0.18)',
    // Optionnel : effet d'ombre léger pour le relief
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
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
  headerSafe: {
    backgroundColor: '#181C24',
  },
  topBand: {
    width: '100%',
    height: 18,
    backgroundColor: '#181C24',
  }
});

const followNotifications = [
  { id: '1', message: 'Alice veut s’abonner à vous.', user: 'Alice', date: 'Aujourd’hui' },
  { id: '2', message: 'Bob veut s’abonner à vous.', user: 'Bob', date: 'Hier' },
];

const generalNotifications = [
  { id: '3', message: 'Marie a ajouté Paris à sa wishlist.', user: 'Marie', city: 'Paris', date: 'Aujourd’hui' },
  { id: '4', message: 'Lucas a mis 5 étoiles à Tokyo.', user: 'Lucas', city: 'Tokyo', date: 'Hier' },
  { id: '5', message: 'Emma a visité Rome.', user: 'Emma', city: 'Rome', date: 'Hier' },
];


export default function NotificationsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  React.useLayoutEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>
      <View style={{ height: 0.5, backgroundColor: 'rgba(255,255,255,0.3)', width: '100%' }} />
      <ScrollView style={styles.sections} contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={styles.sectionTitle}>Demandes d’abonnement</Text>
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
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Général</Text>
        {generalNotifications.length === 0 ? (
          <Text style={styles.emptyText}>Aucune notification</Text>
        ) : (
          generalNotifications.map(notif => (
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

