import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

export function CityLogTitle() {
  const textColor = useThemeColor({}, 'text');
  const textActiveColor = useThemeColor({}, 'textActive');

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: textActiveColor }]}>Ci</Text>
        <View style={styles.airplaneContainer}>
          <IconSymbol size={22} name="paperplane.fill" color={textActiveColor} />
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
    width: 22,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
