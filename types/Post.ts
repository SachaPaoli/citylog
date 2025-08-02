export interface Post {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  city: string;
  country: string;
  photo: string; // Photo de couverture
  rating: number; // Note moyenne calculée
  description: string; // Description générale du voyage
  createdAt: Date;
  updatedAt: Date;
  likes: string[]; // Array des IDs des utilisateurs qui ont liké
  comments?: Comment[];
  // Détails du voyage
  stayingItems: TripItem[];
  restaurantItems: TripItem[];
  activitiesItems: TripItem[];
  otherItems: TripItem[];
  isPublic: boolean; // Ajouté pour la visibilité du post
}

export interface TripItem {
  id: string;
  name: string;
  rating: number;
  description: string;
  images: SelectedImage[];
}

export interface SelectedImage {
  id: string;
  uri: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}

export interface CreatePostData {
  city: string;
  country: string;
  photo: string;
  rating: number;
  description: string;
  stayingItems: TripItem[];
  restaurantItems: TripItem[];
  activitiesItems: TripItem[];
  otherItems: TripItem[];
  isPublic: boolean; // Ajouté pour la visibilité du post
}
