import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';

export default function WhiteTabBarBackground() {
  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF' }]}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
