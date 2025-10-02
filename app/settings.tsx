import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { logout, userProfile, updateUserProfile } = useAuth();
  const router = useRouter();

  // Check admin status
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'founder';
  const isFounder = userProfile?.role === 'founder';

  // États pour les switches
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action is irreversible and will delete all your posts, trips and data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Coming Soon', 'Account deletion will be available soon.');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingsRow = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightComponent,
    showChevron = false,
    dangerous = false 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    showChevron?: boolean;
    dangerous?: boolean;
  }) => (
    <TouchableOpacity 
      style={[styles.settingsRow, dangerous && styles.dangerousRow]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingsRowLeft}>
        <View style={[styles.iconContainer, dangerous && styles.dangerousIcon]}>
          <Ionicons name={icon as any} size={20} color={dangerous ? '#FF4444' : '#2051A4'} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.settingsTitle, dangerous && styles.dangerousText]}>{title}</Text>
          {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingsRowRight}>
        {rightComponent}
        {showChevron && <Ionicons name="chevron-forward" size={20} color="#666" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Admin Section - Only for admins */}
          {isAdmin && (
            <SettingsSection title="🛡️ Admin Panel">
              <SettingsRow
                icon="shield"
                title="Admin Dashboard"
                subtitle={`Role: ${userProfile?.role || 'user'} ${isFounder ? '👑 FOUNDER' : '🛡️'}`}
                onPress={() => Alert.alert('Coming Soon', 'Admin dashboard will be available soon')}
                showChevron
              />
              <SettingsRow
                icon="analytics"
                title="App Analytics"
                subtitle="Users, posts, engagement stats"
                onPress={() => Alert.alert('Coming Soon', 'Analytics will be available soon')}
                showChevron
              />
              <SettingsRow
                icon="people"
                title="User Management"
                subtitle="Manage users, bans, reports"
                onPress={() => Alert.alert('Coming Soon', 'User management will be available soon')}
                showChevron
              />
              <SettingsRow
                icon="card"
                title="Revenue Dashboard"
                subtitle="Premium subscriptions & revenue"
                onPress={() => Alert.alert('Coming Soon', 'Revenue dashboard will be available soon')}
                showChevron
              />
            </SettingsSection>
          )}

          {/* Premium Features - Show what's unlocked */}
          {isAdmin && (
            <SettingsSection title="✨ Premium Access">
              <SettingsRow
                icon="checkmark-circle"
                title="All Premium Features"
                subtitle="Unlimited posts, analytics, priority support"
                rightComponent={<Text style={styles.unlocked}>UNLOCKED</Text>}
              />
              <SettingsRow
                icon="infinite"
                title="Unlimited Everything"
                subtitle="No limits on posts, trips, or storage"
                rightComponent={<Text style={styles.unlocked}>UNLOCKED</Text>}
              />
            </SettingsSection>
          )}

          {/* Privacy & Security */}
          <SettingsSection title="Privacy & Security">
            <SettingsRow
              icon="lock-closed-outline"
              title="Private Profile"
              subtitle="Only your followers can see your posts"
              rightComponent={
                <Switch
                  value={privateProfile}
                  onValueChange={setPrivateProfile}
                  trackColor={{ false: '#333', true: '#2051A4' }}
                  thumbColor="#fff"
                />
              }
            />
            <SettingsRow
              icon="eye-outline"
              title="Online Status"
              subtitle="Show when you're active"
              rightComponent={
                <Switch
                  value={showOnlineStatus}
                  onValueChange={setShowOnlineStatus}
                  trackColor={{ false: '#333', true: '#2051A4' }}
                  thumbColor="#fff"
                />
              }
            />
            <SettingsRow
              icon="shield-outline"
              title="Block Users"
              subtitle="Manage your blocked list"
              onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon')}
              showChevron
            />
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection title="Notifications">
            <SettingsRow
              icon="notifications-outline"
              title="Push Notifications"
              subtitle="Likes, comments, new followers"
              rightComponent={
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{ false: '#333', true: '#2051A4' }}
                  thumbColor="#fff"
                />
              }
            />
            <SettingsRow
              icon="mail-outline"
              title="Email Notifications"
              subtitle="Weekly summary, news"
              rightComponent={
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  trackColor={{ false: '#333', true: '#2051A4' }}
                  thumbColor="#fff"
                />
              }
            />
          </SettingsSection>

          {/* Data & Storage */}
          <SettingsSection title="Data & Storage">
            <SettingsRow
              icon="download-outline"
              title="Download My Data"
              subtitle="Export all your posts and data"
              onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon')}
              showChevron
            />
            <SettingsRow
              icon="trash-outline"
              title="Clear Cache"
              subtitle="Free up storage space"
              onPress={() => {
                Alert.alert('Cache Cleared', 'Image cache has been cleared successfully');
              }}
              showChevron
            />
          </SettingsSection>

          {/* Support & Legal */}
          <SettingsSection title="Support & Legal">
            <SettingsRow
              icon="help-circle-outline"
              title="Help Center"
              subtitle="FAQ and user guides"
              onPress={() => openLink('mailto:support@citylog.app')}
              showChevron
            />
            <SettingsRow
              icon="bug-outline"
              title="Report a Problem"
              subtitle="Bugs, technical issues"
              onPress={() => openLink('mailto:support@citylog.app?subject=Bug Report')}
              showChevron
            />
            <SettingsRow
              icon="document-text-outline"
              title="Terms of Service"
              onPress={() => openLink('https://citylog.app/terms')}
              showChevron
            />
            <SettingsRow
              icon="shield-checkmark-outline"
              title="Privacy Policy"
              onPress={() => openLink('https://citylog.app/privacy')}
              showChevron
            />
          </SettingsSection>

          {/* About */}
          <SettingsSection title="About">
            <SettingsRow
              icon="information-circle-outline"
              title="App Version"
              subtitle="1.0.0 (Build 1)"
              rightComponent={<Text style={styles.versionText}>1.0.0</Text>}
            />
            <SettingsRow
              icon="star-outline"
              title="Rate the App"
              subtitle="Share your feedback on the App Store"
              onPress={() => openLink('https://apps.apple.com/app/citylog')}
              showChevron
            />
            {/* Temporary founder promotion button */}
            {!isAdmin && userProfile?.email && (
              <SettingsRow
                icon="crown-outline"
                title="🚀 Become Founder"
                subtitle="Claim your founder status"
                onPress={async () => {
                  try {
                    // Update user role to founder
                    await updateUserProfile({ 
                      role: 'founder', 
                      premiumFeatures: ['unlimited_posts', 'analytics', 'priority_support', 'founder_badge', 'all_access'] 
                    });
                    Alert.alert('Welcome Founder!', 'You now have founder status with all privileges! 👑');
                  } catch (error) {
                    Alert.alert('Error', 'Failed to update role');
                  }
                }}
                showChevron
              />
            )}
          </SettingsSection>

          {/* Dangerous Actions */}
          <SettingsSection title="Dangerous Actions">
            <SettingsRow
              icon="log-out-outline"
              title="Sign Out"
              onPress={handleLogout}
              dangerous
            />
            <SettingsRow
              icon="trash-outline"
              title="Delete Account"
              subtitle="Irreversible action"
              onPress={handleDeleteAccount}
              dangerous
            />
          </SettingsSection>

          <View style={styles.footer}>
            <Text style={styles.footerText}>CityLog - Share your adventures</Text>
            <Text style={styles.footerSubtext}>Made with ❤️ for travelers</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181C24',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dangerousRow: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderColor: 'rgba(255, 68, 68, 0.2)',
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(32, 81, 164, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dangerousIcon: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
  },
  textContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  dangerousText: {
    color: '#FF4444',
  },
  settingsSubtitle: {
    fontSize: 14,
    color: '#888',
    lineHeight: 18,
  },
  versionText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  unlocked: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
});