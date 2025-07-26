import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function AuthNavigator() {
  const { user, loading } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const beigeColor = '#E5C9A6';

  // Rediriger automatiquement selon l'état d'authentification
  useEffect(() => {
    if (!loading) {
      if (user) {
        // Utilisateur connecté : aller vers l'app principale
        router.replace('/(tabs)');
      } else {
        // Utilisateur non connecté : aller vers la connexion
        router.replace('/auth/login');
      }
    }
  }, [user, loading]);

  // Écran de chargement pendant la vérification de l'auth
  return (
    <View style={[styles.loadingContainer, { backgroundColor }]}>
      <ActivityIndicator size="large" color={beigeColor} />
      <Text style={[styles.loadingText, { color: beigeColor }]}>
        Chargement...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});
