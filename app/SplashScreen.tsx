import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const textFadeAnim = useRef(new Animated.Value(1)).current;
  const planeAnim = useRef(new Animated.Value(0)).current;

  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    // Séquence d'animations
    const animationSequence = Animated.sequence([
      // 1. Attendre un peu pour montrer le titre
      Animated.delay(600),
      
      // 2. Animation simultanée : texte qui disparaît + avion qui s'envole
      Animated.parallel([
        // Texte qui disparaît avec fade
        Animated.timing(textFadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        // Avion qui s'envole vers le haut très vite (90°)
        Animated.timing(planeAnim, {
          toValue: -height,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      
      // 3. Fade out final
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]);

    animationSequence.start(() => {
      onFinish();
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Titre CityLog avec avion */}
        <View style={styles.titleContainer}>
          <Animated.View
            style={[
              styles.textRow,
              {
                opacity: textFadeAnim,
              },
            ]}
          >
            <Text style={[styles.titleText, { color: '#fff' }]}>Ci</Text>
            <View style={styles.planeContainer}>
              <Animated.View
                style={[
                  styles.airplane,
                  {
                    transform: [{ translateY: planeAnim }],
                  },
                ]}
              >
                {/* Corps de l'avion */}
                <View style={[styles.airplaneBody, { backgroundColor: '#fff' }]} />
                {/* Ailes */}
                <View style={[styles.airplaneWings, { backgroundColor: '#fff' }]} />
                {/* Queue */}
                <View style={[styles.airplaneTail, { backgroundColor: '#fff' }]} />
              </Animated.View>
            </View>
            <Text style={[styles.titleText, { color: '#fff' }]}>yLog</Text>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Particules d'arrière-plan */}
      <View style={styles.particlesContainer}>
        {[...Array(15)].map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.2],
                }),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181C24', // Couleur de fond générale de l'app
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  titleText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  planeContainer: {
    marginHorizontal: 8,
    width: 40,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  airplane: {
    position: 'relative',
    width: 36,
    height: 56,
  },
  airplaneBody: {
    position: 'absolute',
    width: 6,
    height: 48,
    left: 15,
    top: 4,
    borderRadius: 3,
  },
  airplaneWings: {
    position: 'absolute',
    width: 36,
    height: 16,
    left: 0,
    top: 24,
    borderRadius: 8,
  },
  airplaneTail: {
    position: 'absolute',
    width: 16,
    height: 12,
    left: 10,
    top: 44,
    borderRadius: 6,
  },
  tagline: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    letterSpacing: 1,
    textAlign: 'center',
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
});
