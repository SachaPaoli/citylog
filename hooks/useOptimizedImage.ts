import { imageCacheService } from '@/services/ImageCacheService';
import { useEffect, useState } from 'react';

export function useOptimizedImage(uri: string | null | undefined) {
  const [cachedUri, setCachedUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si uri est vide ou invalide
    if (!uri || uri.trim() === '') {
      setCachedUri(null);
      setLoading(false);
      return;
    }

    const loadImage = async () => {
      try {
        const cached = await imageCacheService.preloadImage(uri);
        setCachedUri(cached);
      } catch (error) {
        console.log('useOptimizedImage error, falling back to original uri:', error);
        // En cas d'erreur, utiliser l'URI originale
        setCachedUri(uri);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [uri]);

  return { uri: cachedUri, loading };
}
