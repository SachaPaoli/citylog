import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function DescriptionDetailScreen() {
  const router = useRouter();
  const { description } = useLocalSearchParams<{ description: string }>();
  
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const headerColor = '#181C24';
  const whiteColor = '#FFFFFF';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: headerColor }]}>
        {/* Header personnalisé */}
        <View style={[styles.header, { backgroundColor: headerColor }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={whiteColor} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter} />
          
          <Text style={[styles.headerTitle, { color: whiteColor }]}>
            Description
          </Text>
        </View>
        
        {/* Ligne de séparation */}
        <View style={styles.separator} />
        
        {/* Contenu avec la description */}
        <ScrollView 
          style={[styles.content, { backgroundColor }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.descriptionText, { color: textColor }]}>
            {description}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: 60,
  },
  backButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  headerCenter: {
    flex: 1,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
  },
});
