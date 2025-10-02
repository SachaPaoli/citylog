import React, { useState } from 'react';
import { ActivityIndicator, Image, ImageProps, StyleSheet, View } from 'react-native';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  uri: string | null | undefined;
  placeholder?: React.ReactNode;
  showLoader?: boolean;
}

export function CachedImage({ 
  uri, 
  placeholder, 
  showLoader = false, // Par défaut, pas de loader pour éviter les scintillements
  style, 
  ...props 
}: CachedImageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Si uri est vide ou undefined, afficher directement le placeholder
  if (!uri || uri.trim() === '') {
    return (
      <View style={[style, styles.loaderContainer]}>
        {placeholder || <View style={styles.emptyPlaceholder} />}
      </View>
    );
  }

  // Si erreur de chargement, afficher le placeholder
  if (error) {
    console.log('CachedImage: showing placeholder due to error for', uri);
    return (
      <View style={[style, styles.loaderContainer]}>
        {placeholder || <View style={styles.emptyPlaceholder} />}
      </View>
    );
  }

  return (
    <>
      {loading && showLoader && (
        <View style={[style, styles.loaderContainer, { position: 'absolute' }]}>
          <ActivityIndicator size="small" color="#2051A4" />
        </View>
      )}
      <Image
        {...props}
        source={{ uri }}
        style={style}
        onLoadStart={() => {
          setLoading(true);
        }}
        onLoad={() => {
          console.log('CachedImage: loaded successfully', uri);
        }}
        onLoadEnd={() => {
          setLoading(false);
        }}
        onError={(e) => {
          console.log('CachedImage: error loading', uri, e.nativeEvent?.error);
          setLoading(false);
          setError(true);
          if (props.onError) {
            props.onError(e);
          }
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  emptyPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a2a',
    borderRadius: 50,
  },
});
