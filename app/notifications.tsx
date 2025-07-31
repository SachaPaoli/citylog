import React from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Notification {
  id: string;
  type: 'follow' | 'general';
  message: string;
  user?: string;
  city?: string;
  date: string;
}

const followNotifications: Notification[] = [
  { id: '1', type: 'follow', message: 'Alice veut s’abonner à vous.', user: 'Alice', date: 'Aujourd’hui' },
  { id: '2', type: 'follow', message: 'Bob veut s’abonner à vous.', user: 'Bob', date: 'Hier' },
];

const generalNotifications: Notification[] = [
  { id: '3', type: 'general', message: 'Marie a ajouté Paris à sa wishlist.', user: 'Marie', city: 'Paris', date: 'Aujourd’hui' },
  { id: '4', type: 'general', message: 'Lucas a mis 5 étoiles à Tokyo.', user: 'Lucas', city: 'Tokyo', date: 'Hier' },
  { id: '5', type: 'general', message: 'Emma a visité Rome.', user: 'Emma', city: 'Rome', date: 'Hier' },
];

export default function NotificationsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Notifications</Text>
          <ScrollView style={styles.sections}>
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
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const { height } = Dimensions.get('window');
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modalContent: {
    marginTop: 0,
    width: '100%',
    height: height * 0.75,
    backgroundColor: '#181818',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    alignSelf: 'center',
  },
  sections: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    marginTop: 8,
  },
  notifItem: {
    backgroundColor: '#232323',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
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
  closeBtn: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: '#232323',
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 10,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
