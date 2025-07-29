import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function CityLogTitle() {
  const textColor = useThemeColor({}, 'text');
  const textActiveColor = useThemeColor({}, 'textActive');

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: textActiveColor }]}>Ci</Text>
        <View style={styles.airplaneContainer}>
          {/* Forme d'avion réaliste */}
          <View style={styles.airplane}>
            {/* Corps de l'avion */}
            <View style={[styles.airplaneBody, { backgroundColor: textActiveColor }]} />
            {/* Ailes */}
            <View style={[styles.airplaneWings, { backgroundColor: textActiveColor }]} />
            {/* Queue */}
            <View style={[styles.airplaneTail, { backgroundColor: textActiveColor }]} />
          </View>
        </View>
        <Text style={[styles.title, { color: textActiveColor }]}>yLog</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
    paddingTop: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  airplaneContainer: {
    marginHorizontal: 3,
    width: 18,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  airplane: {
    position: 'relative',
    width: 20,
    height: 28,
  },
  airplaneBody: {
    position: 'absolute',
    width: 2.5,
    height: 22,
    left: 8.75,
    top: 3,
    borderRadius: 1.25,
  },
  airplaneWings: {
    position: 'absolute',
    width: 20,
    height: 6,
    left: 0,
    top: 11,
    borderRadius: 3,
  },
  airplaneTail: {
    position: 'absolute',
    width: 10,
    height: 4,
    left: 5,
    top: 22,
    borderRadius: 2,
  },
});
