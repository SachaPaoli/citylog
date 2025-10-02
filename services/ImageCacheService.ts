import { Image } from 'react-native';

class ImageCacheService {
  private cache: Map<string, string> = new Map();
  private prefetchPromises: Map<string, Promise<boolean>> = new Map();
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
  }

  async preloadImage(uri: string): Promise<string> {
    if (!uri || uri === '') return uri;
    
    if (this.cache.has(uri)) {
      return this.cache.get(uri)!;
    }

    try {
      // Si c'est une URI locale ou un require, on la retourne directement
      if (!uri.startsWith('http')) {
        this.cache.set(uri, uri);
        return uri;
      }

      // Vérifie si un prefetch est déjà en cours pour cette image
      if (!this.prefetchPromises.has(uri)) {
        const prefetchPromise = Image.prefetch(uri);
        this.prefetchPromises.set(uri, prefetchPromise);
      }

      // Attend le prefetch
      await this.prefetchPromises.get(uri);
      this.cache.set(uri, uri);
      
      return uri;
    } catch (error) {
      // En cas d'erreur, on retourne l'URI originale quand même
      this.cache.set(uri, uri);
      return uri;
    }
  }

  private generateFilename(uri: string): string {
    // Génère un nom de fichier unique basé sur l'URL
    const hash = uri.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const ext = uri.split('.').pop()?.split('?')[0] || 'jpg';
    return `${Math.abs(hash)}.${ext}`;
  }

  getCachedUri(uri: string): string {
    return this.cache.get(uri) || uri;
  }

  async preloadMultiple(uris: string[]): Promise<void> {
    const validUris = uris.filter(uri => uri && uri !== '');
    await Promise.all(validUris.map(uri => this.preloadImage(uri).catch(() => uri)));
  }

  async clearCache(): Promise<void> {
    this.cache.clear();
    this.prefetchPromises.clear();
  }

  // Précharge les drapeaux les plus communs
  async preloadCommonFlags(): Promise<void> {
    const commonCountryCodes = [
      'fr', 'us', 'gb', 'de', 'es', 'it', 'jp', 'cn', 'br', 'in',
      'ca', 'au', 'mx', 'kr', 'nl', 'ch', 'se', 'no', 'dk', 'fi',
      'be', 'at', 'pt', 'gr', 'pl', 'cz', 'hu', 'ro', 'bg', 'hr',
      'th', 'sg', 'my', 'id', 'ph', 'vn', 'ae', 'sa', 'eg', 'za',
      'ar', 'cl', 'co', 've', 'pe', 'uy', 'nz', 'ie', 'il', 'tr'
    ];

    const flagUrls = commonCountryCodes.map(code => 
      `https://flagcdn.com/w320/${code}.png`
    );

    await this.preloadMultiple(flagUrls);
  }
}

export const imageCacheService = new ImageCacheService();
