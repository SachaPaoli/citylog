import { imageCacheService } from '@/services/ImageCacheService';
import { useEffect, useState } from 'react';

export function useGlobalImagePreloader() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const preloadCommonImages = async () => {
      try {
        await imageCacheService.init();
        await imageCacheService.preloadCommonFlags();
        setIsReady(true);
      } catch (error) {
        console.error('Error preloading common images:', error);
        setIsReady(true); // Continue même en cas d'erreur
      }
    };

    preloadCommonImages();
  }, []);

  return { isReady };
}
