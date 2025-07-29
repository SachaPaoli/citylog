import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';

export default function GrayTabBarBackground() {
  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: '#D0D0D0' }]}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
