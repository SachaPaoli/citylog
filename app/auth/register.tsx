import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const textColor = useThemeColor({}, 'text');
  const textActiveColor = useThemeColor({}, 'textActive');
  const backgroundColor = useThemeColor({}, 'background');
  const buttonBackgroundColor = useThemeColor({}, 'buttonBackground');
  const borderColor = useThemeColor({}, 'borderColor');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();

  const handleRegister = async () => {
    // Validation
    if (!email || !password || !confirmPassword || !username || !displayName) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Erreur', 'Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, username, displayName);
      // Message de succès
      Alert.alert(
        'Inscription réussie !', 
        'Votre compte a été créé avec succès. Vous allez être redirigé vers l\'application.',
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
      console.error('Erreur d\'inscription:', error);
      let errorMessage = 'Une erreur est survenue lors de l\'inscription';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cette adresse email est déjà utilisée';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Adresse email invalide';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Mot de passe trop faible';
      }
      
      Alert.alert('Erreur d\'inscription', errorMessage);
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
            <Text style={[styles.title, { color: textActiveColor }]}>
              CityLog
            </Text>
            <Text style={[styles.subtitle, { color: textColor }]}>
              Crée ton compte et commence à voyager
            </Text>
          </View>

          {/* Formulaire */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: textActiveColor }]}
                placeholder="Nom d'affichage"
                placeholderTextColor={`${textActiveColor}80`}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: textActiveColor }]}
                placeholder="Nom d'utilisateur"
                placeholderTextColor={`${textActiveColor}80`}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: textActiveColor }]}
                placeholder="Email"
                placeholderTextColor={`${textActiveColor}80`}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: textActiveColor }]}
                placeholder="Mot de passe"
                placeholderTextColor={`${textActiveColor}80`}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: textActiveColor }]}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor={`${textActiveColor}80`}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity 
              style={[styles.registerButton, { backgroundColor: textActiveColor }]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Création...' : 'Créer mon compte'}
              </Text>
            </TouchableOpacity>

            {/* Lien vers connexion */}
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: textColor }]}>
                Déjà un compte ?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('./login')}>
                <Text style={[styles.loginLink, { color: textActiveColor }]}>
                  Se connecter
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
    paddingVertical: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
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
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: 'rgba(229, 201, 166, 0.1)',
  },
  registerButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  registerButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
