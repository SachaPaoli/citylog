// ISO 3166-1 alpha-2 code to country name mapping
export const COUNTRY_NAMES: Record<string, string> = {
  AF: 'Afghanistan',
  AL: 'Albania',
  DZ: 'Algeria',
  FR: 'France',
  DE: 'Germany',
  IT: 'Italy',
  ES: 'Spain',
  US: 'United States',
  GB: 'United Kingdom',
  // ... add more as needed
};

export function getCountryName(codeOrName: string): string {
  if (!codeOrName) return '';
  if (codeOrName.length === 2 && COUNTRY_NAMES[codeOrName.toUpperCase()]) {
    return COUNTRY_NAMES[codeOrName.toUpperCase()];
  }
  return codeOrName;
}
