import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function CityLogTitle() {
  const textColor = useThemeColor({}, 'text');
  const beigeColor = useThemeColor({ light: '#E5C9A6', dark: '#E5C9A6' }, 'beige');

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: beigeColor }]}>Ci</Text>
        <View style={styles.airplaneContainer}>
          {/* Forme d'avion réaliste */}
          <View style={styles.airplane}>
            {/* Corps de l'avion */}
            <View style={[styles.airplaneBody, { backgroundColor: beigeColor }]} />
            {/* Ailes */}
            <View style={[styles.airplaneWings, { backgroundColor: beigeColor }]} />
            {/* Queue */}
            <View style={[styles.airplaneTail, { backgroundColor: beigeColor }]} />
          </View>
        </View>
        <Text style={[styles.title, { color: beigeColor }]}>yLog</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  airplaneContainer: {
    marginHorizontal: 4,
    width: 20,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  airplane: {
    position: 'relative',
    width: 18,
    height: 28,
  },
  airplaneBody: {
    position: 'absolute',
    width: 3,
    height: 24,
    left: 7.5,
    top: 2,
    borderRadius: 1.5,
  },
  airplaneWings: {
    position: 'absolute',
    width: 18,
    height: 8,
    left: 0,
    top: 12,
    borderRadius: 4,
  },
  airplaneTail: {
    position: 'absolute',
    width: 8,
    height: 6,
    left: 5,
    top: 22,
    borderRadius: 3,
  },
});
