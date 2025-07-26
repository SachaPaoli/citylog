import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const beigeColor = '#E5C9A6';

  useEffect(() => {
    if (!loading && !user) {
      // Rediriger vers la connexion si pas d'utilisateur connecté
      router.replace('/auth/login' as any);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={beigeColor} />
        <Text style={[styles.loadingText, { color: beigeColor }]}>
          Vérification...
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={beigeColor} />
        <Text style={[styles.loadingText, { color: beigeColor }]}>
          Redirection...
        </Text>
      </View>
    );
  }

  return <>{children}</>;
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
