
import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import PostActionModal from '@/components/PostActionModal';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';


export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [showPostModal, setShowPostModal] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#ffffffff',
          tabBarInactiveTintColor: '#909991ff',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarShowLabel: false,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
              backgroundColor: '#fff',
              height: 80,
              paddingTop: 10,
              paddingBottom: 10,
            },
            default: {
              backgroundColor: '#fff',
              height: 80,
              paddingTop: 10,
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
            tabBarButton: (props) => (
              <HapticTab
                {...props}
                onPress={() => setShowPostModal(true)}
              />
            ),
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
      <PostActionModal
        visible={showPostModal}
        onClose={() => setShowPostModal(false)}
        onNewPost={() => {
          setShowPostModal(false);
          router.push('/post_final');
        }}
        onNewTrip={() => {
          setShowPostModal(false);
          router.push('/trips/create');
        }}
      />
    </>
  );
}
