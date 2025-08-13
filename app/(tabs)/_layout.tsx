import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import AuthGuard from '@/components/AuthGuard';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#ffffffff', // Bleu foncé pour icône active
          tabBarInactiveTintColor: '#909991ff', // Gris très foncé pour icône inactive
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarShowLabel: false, // Cache les labels
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
              backgroundColor: '#fff', // Fond blanc
              height: 80, // Hauteur plus confortable
              paddingTop: 10, // Padding pour centrer verticalement
              paddingBottom: 10,
            },
            default: {
              backgroundColor: '#fff', // Fond blanc
              height: 80, // Hauteur plus confortable
              paddingTop: 10, // Padding pour centrer verticalement
              paddingBottom: 10,
            },
          }),
        }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane" color={color} />,
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="trophy" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.circle" color={color} />,
        }}
      />
    </Tabs>
    </AuthGuard>
  );
}
