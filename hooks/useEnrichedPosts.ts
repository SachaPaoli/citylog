import { useEffect, useState } from 'react';
import { globalPhotoCache } from './useGlobalPhotoPreloader';
import { Post } from '../types/Post';

export const useEnrichedPosts = (posts: Post[]) => {
  const [enrichedPosts, setEnrichedPosts] = useState<Post[]>([]);

  useEffect(() => {
    // Enrichissement instantané avec le cache global
    const enriched = posts.map(post => {
      const cachedPhoto = globalPhotoCache.get(post.userId) || '';
      return {
        ...post,
        userPhoto: post.userPhoto || cachedPhoto
      };
    });

    setEnrichedPosts(enriched);
    
    // Log pour debug
    const photosFound = enriched.filter(p => p.userPhoto).length;
    console.log(`📸 Enrichissement instantané: ${photosFound}/${posts.length} photos trouvées`);
    
    // Debug détaillé pour voir le cache
    if (globalPhotoCache.size > 0) {
      console.log(`💾 Cache global contient ${globalPhotoCache.size} photos`);
    }
  }, [posts]);

  return { enrichedPosts, loading: false };
};
