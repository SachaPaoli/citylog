// Structure Firebase à implémenter

/* 
COLLECTIONS PRIORITAIRES À CRÉER :

1. 'users_profiles' - Profils utilisateur étendus
{
  uid: string,
  displayName: string,
  email: string,
  profileImage: string,
  favoriteCountries: string[], // 3 pays favoris
  favoriteCities: string[], // 3 villes favorites
  followers: string[], // UIDs des followers
  following: string[], // UIDs des utilisateurs suivis
  isPremium: boolean,
  premiumExpiry?: Date,
  settings: {
    isProfilePublic: boolean,
    allowFollowers: boolean,
    notifications: boolean
  },
  createdAt: Date,
  updatedAt: Date
}

2. 'user_favorites' - Wishlist des villes/pays
{
  userId: string,
  type: 'city' | 'country',
  itemId: string,
  itemName: string,
  countryCode?: string,
  addedAt: Date,
  notes?: string
}

3. 'trips' - Voyages organisés
{
  id: string,
  userId: string,
  title: string,
  description: string,
  coverImage: string,
  countries: string[],
  cities: string[],
  startDate: Date,
  endDate: Date,
  posts: string[], // IDs des posts liés
  isPublic: boolean,
  createdAt: Date
}

4. 'city_details' - Détails des villes pour l'exploration
{
  id: string,
  name: string,
  country: string,
  countryCode: string,
  region: string,
  latitude: number,
  longitude: number,
  population: number,
  description: string,
  mainImage: string,
  averageRating: number,
  totalVisits: number,
  climate: string,
  bestTimeToVisit: string,
  highlights: string[],
  lastUpdated: Date
}

5. 'follows' - Relations de suivi
{
  followerId: string,
  followingId: string,
  createdAt: Date
}

*/

// Hooks à créer pour ces nouvelles collections
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  profileImage: string;
  favoriteCountries: string[];
  favoriteCities: string[];
  followers: string[];
  following: string[];
  isPremium: boolean;
  premiumExpiry?: Date;
  settings: {
    isProfilePublic: boolean;
    allowFollowers: boolean;
    notifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFavorite {
  userId: string;
  type: 'city' | 'country';
  itemId: string;
  itemName: string;
  countryCode?: string;
  addedAt: Date;
  notes?: string;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  description: string;
  coverImage: string;
  countries: string[];
  cities: string[];
  startDate: Date;
  endDate: Date;
  posts: string[];
  isPublic: boolean;
  createdAt: Date;
}

export interface CityDetail {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  region: string;
  latitude: number;
  longitude: number;
  population: number;
  description: string;
  mainImage: string;
  averageRating: number;
  totalVisits: number;
  climate: string;
  bestTimeToVisit: string;
  highlights: string[];
  lastUpdated: Date;
}
