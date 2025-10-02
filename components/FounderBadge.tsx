import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface FounderBadgeProps {
  role?: 'user' | 'admin' | 'founder';
  size?: 'small' | 'medium' | 'large';
}

export function FounderBadge({ role, size = 'medium' }: FounderBadgeProps) {
  if (role !== 'founder' && role !== 'admin') return null;

  const isFounder = role === 'founder';
  
  const sizeStyles = {
    small: { fontSize: 10, paddingHorizontal: 6, paddingVertical: 2 },
    medium: { fontSize: 11, paddingHorizontal: 8, paddingVertical: 3 },
    large: { fontSize: 12, paddingHorizontal: 10, paddingVertical: 4 },
  };

  return (
    <View style={[
      styles.badge, 
      isFounder ? styles.founderBadge : styles.adminBadge,
      sizeStyles[size]
    ]}>
      <Text style={[styles.badgeText, sizeStyles[size]]}>
        {isFounder ? '👑 FOUNDER' : '🛡️ ADMIN'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginLeft: 8,
    marginTop: 2,
  },
  founderBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  adminBadge: {
    backgroundColor: 'rgba(32, 81, 164, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(32, 81, 164, 0.3)',
  },
  badgeText: {
    color: '#FFD700',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});