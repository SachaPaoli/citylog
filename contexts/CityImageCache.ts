// Cache global pour les URLs d'images de villes
// Utilisable partout dans l'app

const cityImageGlobalCache: { [key: string]: string | null } = {};

export function setCityImageCache(key: string, url: string | null) {
  cityImageGlobalCache[key] = url;
}

export function getCityImageCache(key: string): string | null | undefined {
  return cityImageGlobalCache[key];
}

export function clearCityImageCache() {
  Object.keys(cityImageGlobalCache).forEach(k => delete cityImageGlobalCache[k]);
}

export default cityImageGlobalCache;
