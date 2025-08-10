import { CloudinaryService } from '@/services/CloudinaryService';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ImageStyle, StyleSheet, Text, View } from 'react-native';

interface OptimizedImageProps {
  source: { uri: string };
  style?: ImageStyle;
  placeholder?: boolean;
  variant?: 'thumbnail' | 'medium' | 'large' | 'cover';
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  defaultSource?: any;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  source, 
  style, 
  placeholder = true,
  variant = 'medium',
  resizeMode = 'cover',
  defaultSource
}) => {
  const [loading, setLoading] = useState(placeholder);
  const [error, setError] = useState(false);

  // Timeout pour éviter les loading infinis
  React.useEffect(() => {
    if (!placeholder) return; // Pas de timeout si pas de placeholder
    
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 3000); // 3 secondes timeout

    return () => clearTimeout(timer);
  }, [loading, source.uri, placeholder]);

  // Optimise l'URL selon la variante demandée
  const optimizedUri = React.useMemo(() => {
    // Vérifie si c'est une URL Cloudinary
    if (source.uri.includes('cloudinary.com') || source.uri.includes('res.cloudinary.com')) {
      const variants = CloudinaryService.getImageVariants(source.uri);
      return variants[variant];
    }
    // Pour les URLs externes, retourne l'URL originale
    return source.uri;
  }, [source.uri, variant]);

  const handleLoadStart = () => {
    if (placeholder) setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: optimizedUri }}
        style={[styles.image, style]}
        resizeMode={resizeMode}
        defaultSource={defaultSource}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onLoad={handleLoad}
      />
      
      {/* Loader pendant le chargement */}
      {loading && placeholder && (
        <View style={[styles.placeholder, style]}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      )}
      
      {/* Fallback en cas d'erreur */}
      {error && (
        <View style={[styles.placeholder, style, styles.errorPlaceholder]}>
          <Text style={styles.errorText}>📷</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  errorPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  errorText: {
    fontSize: 24,
    opacity: 0.5,
  },
});
