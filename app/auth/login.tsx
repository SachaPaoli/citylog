import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const beigeColor = '#E5C9A6';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      // Message de succès
      Alert.alert(
        'Connexion réussie !', 
        'Vous êtes maintenant connecté à CityLog.',
        [
          {
            text: 'OK',
            onPress: () => {
              // La navigation sera gérée automatiquement par le contexte auth
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      Alert.alert('Erreur de connexion', 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Logo/Titre */}
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: beigeColor }]}>
              CityLog
            </Text>
            <Text style={[styles.subtitle, { color: textColor }]}>
              Connecte-toi pour continuer ton voyage
            </Text>
          </View>

          {/* Formulaire */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: beigeColor }]}
                placeholder="Email"
                placeholderTextColor={`${beigeColor}80`}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: beigeColor }]}
                placeholder="Mot de passe"
                placeholderTextColor={`${beigeColor}80`}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity 
              style={[styles.loginButton, { backgroundColor: beigeColor }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </Text>
            </TouchableOpacity>

            {/* Lien vers inscription */}
            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: textColor }]}>
                Pas encore de compte ?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('./register')}>
                <Text style={[styles.signupLink, { color: beigeColor }]}>
                  Créer un compte
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: 'rgba(229, 201, 166, 0.1)',
  },
  loginButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  loginButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
