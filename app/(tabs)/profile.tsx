import { FlatWorldMap } from '@/components/FlatWorldMap';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useUserTravels } from '@/hooks/useUserTravels';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const beigeColor = '#E5C9A6'; // Couleur beige pour les notes
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'wishlist'>('profile');
  
  const { logout, userProfile: authUserProfile } = useAuth();
  const { travelData, loading: travelLoading } = useUserTravels();

  // Combine les données du contexte auth avec les vraies données de voyage
  const displayProfile = {
    name: authUserProfile?.displayName || 'Utilisateur',
    photo: authUserProfile?.photoURL || authUserProfile?.profileImage || 'https://images.unsplash.com/photo-1494790108755-2616b5739775?w=200&h=200&fit=crop&crop=face',
    followers: 0, // À implémenter plus tard
    following: 0, // À implémenter plus tard
    visitedCountries: travelData.visitedCountries,
    totalCities: travelData.totalCities
  };

  // Fonction pour gérer le clic sur un pays
  const handleCountryPress = (country: string) => {
    setSelectedCountry(country);
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Barre de navigation en haut */}
      <View style={styles.topNavBar}>
        {/* Bouton déconnexion à gauche */}
        <TouchableOpacity style={styles.navIcon} onPress={handleLogout}>
          <Text style={[styles.iconText, { color: beigeColor }]}>🚪</Text>
        </TouchableOpacity>
        
        {/* Onglets Profile / Wishlist au centre */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'profile' && { borderBottomColor: beigeColor }]}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'profile' ? beigeColor : textColor }]}>
              Profile
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'wishlist' && { borderBottomColor: beigeColor }]}
            onPress={() => setActiveTab('wishlist')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'wishlist' ? beigeColor : textColor }]}>
              Wishlist
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Icône édition à droite */}
        <TouchableOpacity 
          style={styles.navIcon}
          onPress={() => router.push('/edit-profile')}
        >
          <Text style={[styles.iconText, { color: beigeColor }]}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'profile' ? (
          <>
            {/* Header du profil */}
            <View style={styles.profileHeader}>
              <Image source={{ uri: displayProfile.photo }} style={styles.profilePhoto} />
              <Text style={[styles.userName, { color: textColor }]}>{displayProfile.name}</Text>
              
              {/* Stats followers/following */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: textColor }]}>{displayProfile.totalCities}</Text>
                  <Text style={[styles.statLabel, { color: textColor }]}>Villes</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: textColor }]}>{displayProfile.visitedCountries.length}</Text>
                  <Text style={[styles.statLabel, { color: textColor }]}>Pays</Text>
                </View>
              </View>

              {/* Bouton Trips */}
              <TouchableOpacity 
                style={[styles.tripsButton, { backgroundColor: beigeColor }]}
                onPress={() => router.push('../trips')}
              >
                <Text style={styles.tripsButtonText}>🧳 Mes Trips</Text>
              </TouchableOpacity>
            </View>

            {/* Carte du monde en flat design */}
            <View style={styles.mapSection}>
              <FlatWorldMap 
                visitedCountries={displayProfile.visitedCountries}
                onCountryPress={handleCountryPress}
              />
            </View>

            {/* Villes visitées pour le pays sélectionné - affiché seulement après clic */}
            {selectedCountry && (
              <View style={styles.citiesSection}>
                <View style={styles.citiesSectionHeader}>
                  <Text style={[styles.sectionTitle, { color: textColor }]}>
                    Villes visitées en {selectedCountry}
                  </Text>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setSelectedCountry(null)}
                  >
                    <Text style={[styles.closeButtonText, { color: beigeColor }]}>✕</Text>
                  </TouchableOpacity>
                </View>
                {travelData.countryVisits
                  .filter(visit => visit.country === selectedCountry)
                  .map(visit => (
                    <View key={visit.country}>
                      {visit.cities.map(city => (
                        <TouchableOpacity
                          key={city.id}
                          style={styles.cityCard}
                          onPress={() => router.push(`/trip-detail?postId=${city.postId}`)}
                        >
                          <Image source={{ uri: city.photo }} style={styles.cityPhoto} />
                          <View style={styles.cityInfo}>
                            <Text style={[styles.cityName, { color: textColor }]}>{city.name}</Text>
                            <Text style={[styles.cityRating, { color: beigeColor }]}>
                              {city.rating}/10
                            </Text>
                            <Text style={[styles.cityDescription, { color: textColor }]} numberOfLines={2}>
                              {city.description}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
              </View>
            )}
          </>
        ) : (
          /* Contenu Wishlist */
          <View style={styles.wishlistSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              🌟 Mes destinations de rêve
            </Text>
            <View style={styles.wishlistContent}>
              <Text style={[styles.wishlistText, { color: textColor }]}>
                Ici tu pourras voir tous les pays et villes que tu aimerais visiter !
              </Text>
              <Text style={[styles.wishlistSubtext, { color: textColor }]}>
                Fonctionnalité à venir... 🚀
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  navIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  tripsButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
  },
  tripsButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  citiesSection: {
    padding: 16,
  },
  citiesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cityCard: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cityPhoto: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  cityInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cityName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cityRating: {
    fontSize: 14,
    marginBottom: 4,
  },
  cityDescription: {
    fontSize: 12,
    opacity: 0.8,
  },
  wishlistSection: {
    padding: 20,
    alignItems: 'center',
  },
  wishlistContent: {
    alignItems: 'center',
    marginTop: 40,
  },
  wishlistText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    opacity: 0.8,
  },
  wishlistSubtext: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
  },
});
